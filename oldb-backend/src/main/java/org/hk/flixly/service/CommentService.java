package org.hk.flixly.service;

import org.hk.flixly.model.CommentDto;
import org.hk.flixly.model.CreateCommentRequest;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.CommentEntity;
import org.hk.flixly.model.entity.CommentLikeEntity;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.CommentLikeRepository;
import org.hk.flixly.repository.CommentRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class CommentService {

    public static final String BOOK = "BOOK";
    public static final String AUTHOR = "AUTHOR";
    private static final int POINTS_WRITE = 1;
    private static final int POINTS_LIKE_RECEIVED = 2;

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final NotificationService notificationService;

    public CommentService(
            CommentRepository commentRepository,
            CommentLikeRepository commentLikeRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.notificationService = notificationService;
    }

    public List<CommentDto> list(String targetType, Long targetId, Long viewerUserId) {
        String type = normalizeType(targetType);
        return commentRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(type, targetId).stream()
                .map(c -> toDto(c, viewerUserId))
                .toList();
    }

    @Transactional
    public CommentDto create(CreateCommentRequest request, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        String type = normalizeType(request.getTargetType());
        if (request.getTargetId() == null) {
            throw new IllegalArgumentException("Hedef gerekli");
        }
        String body = request.getBody() == null ? "" : request.getBody().trim();
        if (body.length() < 2) {
            throw new IllegalArgumentException("Yorum en az 2 karakter olmalı");
        }
        if (body.length() > 2000) {
            throw new IllegalArgumentException("Yorum çok uzun");
        }
        validateTarget(type, request.getTargetId());

        CommentEntity entity = CommentEntity.builder()
                .userId(user.getId())
                .targetType(type)
                .targetId(request.getTargetId())
                .body(body)
                .likeCount(0)
                .build();
        entity = commentRepository.save(entity);
        addContribution(user.getId(), POINTS_WRITE);
        if (BOOK.equals(type)) {
            notificationService.notifyWeeklyPickComment(user.getId(), request.getTargetId());
        }
        return toDto(entity, user.getId());
    }

    @Transactional
    public CommentDto toggleLike(Long commentId, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Yorum bulunamadı"));

        var existing = commentLikeRepository.findByCommentIdAndUserId(commentId, user.getId());
        if (existing.isPresent()) {
            commentLikeRepository.delete(existing.get());
            comment.setLikeCount(Math.max(0, comment.getLikeCount() - 1));
            addContribution(comment.getUserId(), -POINTS_LIKE_RECEIVED);
        } else {
            if (comment.getUserId().equals(user.getId())) {
                throw new IllegalArgumentException("Kendi yorumunu beğenemezsin");
            }
            commentLikeRepository.save(CommentLikeEntity.builder()
                    .commentId(commentId)
                    .userId(user.getId())
                    .build());
            comment.setLikeCount(comment.getLikeCount() + 1);
            addContribution(comment.getUserId(), POINTS_LIKE_RECEIVED);
            Long bookId = BOOK.equals(comment.getTargetType()) ? comment.getTargetId() : null;
            notificationService.notifyCommentLike(user.getId(), comment.getUserId(), commentId, bookId);
        }
        commentRepository.save(comment);
        return toDto(comment, user.getId());
    }

    @Transactional
    public void delete(Long commentId, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Yorum bulunamadı"));
        if (!comment.getUserId().equals(user.getId())
                && !UserRole.isStaff(user.getRole())) {
            throw new IllegalArgumentException("Bu yorumu silemezsin");
        }
        commentRepository.delete(comment);
    }

    private void validateTarget(String type, Long targetId) {
        if (BOOK.equals(type)) {
            if (!bookRepository.existsById(targetId)) {
                throw new IllegalArgumentException("Kitap bulunamadı");
            }
        } else if (AUTHOR.equals(type)) {
            if (!authorRepository.existsById(targetId)) {
                throw new IllegalArgumentException("Yazar bulunamadı");
            }
        }
    }

    private void addContribution(Long userId, int delta) {
        userRepository.findById(userId.intValue()).ifPresent(u -> {
            u.setContributionPoint(Math.max(0, u.getContributionPoint() + delta));
            userRepository.save(u);
        });
    }

    private CommentDto toDto(CommentEntity c, Long viewerUserId) {
        UserEntity author = userRepository.findById(c.getUserId().intValue()).orElse(null);
        boolean liked = viewerUserId != null
                && commentLikeRepository.existsByCommentIdAndUserId(c.getId(), viewerUserId);
        return CommentDto.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .username(author != null ? author.getProfilName() : null)
                .profileName(author != null ? author.getProfilName() : null)
                .avatarUrl(author != null ? author.getAvatarUrl() : null)
                .role(author != null ? author.getRole() : null)
                .targetType(c.getTargetType())
                .targetId(c.getTargetId())
                .body(c.getBody())
                .likeCount(c.getLikeCount())
                .likedByMe(liked)
                .createdAt(c.getCreatedAt())
                .build();
    }

    private static String normalizeType(String type) {
        if (type == null) throw new IllegalArgumentException("Hedef tipi gerekli");
        String t = type.trim().toUpperCase(Locale.ROOT);
        if (!BOOK.equals(t) && !AUTHOR.equals(t)) {
            throw new IllegalArgumentException("Geçersiz hedef tipi");
        }
        return t;
    }

    private UserEntity requireUser(UserDetails userDetails) {
        if (userDetails == null) throw new IllegalArgumentException("Giriş gerekli");
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
    }
}
