package org.hk.flixly.service;

import org.hk.flixly.model.CommentDto;
import org.hk.flixly.model.CreateCommentRequest;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.CommentEntity;
import org.hk.flixly.model.entity.CommentLikeEntity;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.CommentLikeRepository;
import org.hk.flixly.repository.CommentRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

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
    private final ActivityRepository activityRepository;
    private final NotificationService notificationService;
    private final GamificationService gamificationService;

    public CommentService(
            CommentRepository commentRepository,
            CommentLikeRepository commentLikeRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            ActivityRepository activityRepository,
            NotificationService notificationService,
            GamificationService gamificationService) {
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.activityRepository = activityRepository;
        this.notificationService = notificationService;
        this.gamificationService = gamificationService;
    }

    public List<CommentDto> list(String targetType, Long targetId, Long viewerUserId) {
        String type = normalizeType(targetType);
        List<CommentEntity> comments =
                commentRepository.findByTargetTypeAndTargetIdOrderByUpdatedAtDesc(type, targetId);
        Map<Long, Double> ratingByUser = Collections.emptyMap();
        if (BOOK.equals(type) && !comments.isEmpty()) {
            List<Long> userIds = comments.stream()
                    .map(CommentEntity::getUserId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
            ratingByUser = loadBookRatings(targetId, userIds);
        }
        Map<Long, Double> ratings = ratingByUser;
        return comments.stream()
                .map(c -> toDto(c, viewerUserId, ratings.get(c.getUserId())))
                .toList();
    }

    /**
     * One comment per user per target. Creating again updates the existing comment body/spoiler.
     */
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

        Double rating = null;
        if (BOOK.equals(type)) {
            rating = loadBookRatings(request.getTargetId(), List.of(user.getId())).get(user.getId());
        }

        var existing = commentRepository.findByUserIdAndTargetTypeAndTargetId(
                user.getId(), type, request.getTargetId());
        if (existing.isPresent()) {
            CommentEntity entity = existing.get();
            entity.setBody(body);
            entity.setSpoiler(request.isSpoiler());
            entity = commentRepository.save(entity);
            return toDto(entity, user.getId(), rating);
        }

        CommentEntity entity = CommentEntity.builder()
                .userId(user.getId())
                .targetType(type)
                .targetId(request.getTargetId())
                .body(body)
                .spoiler(request.isSpoiler())
                .likeCount(0)
                .build();
        entity = commentRepository.save(entity);
        addContribution(user.getId(), POINTS_WRITE);
        if (BOOK.equals(type)) {
            notificationService.notifyWeeklyPickComment(user.getId(), request.getTargetId());
        }
        gamificationService.evaluateAndPersist(user.getId());
        return toDto(entity, user.getId(), rating);
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
        gamificationService.evaluateAndPersist(comment.getUserId());
        Double rating = null;
        if (BOOK.equals(comment.getTargetType())) {
            rating = loadBookRatings(comment.getTargetId(), List.of(comment.getUserId()))
                    .get(comment.getUserId());
        }
        return toDto(comment, user.getId(), rating);
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

    private Map<Long, Double> loadBookRatings(Long bookId, List<Long> userIds) {
        if (bookId == null || userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<Long, Double> map = new HashMap<>();
        for (Object[] row : activityRepository.findMaxRatingsByBookAndUsers(bookId, userIds)) {
            if (row == null || row[0] == null || row[1] == null) continue;
            Long uid = ((Number) row[0]).longValue();
            double rating = ((Number) row[1]).doubleValue();
            map.put(uid, rating);
        }
        return map;
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

    private CommentDto toDto(CommentEntity c, Long viewerUserId, Double rating) {
        UserEntity author = userRepository.findById(c.getUserId().intValue()).orElse(null);
        boolean liked = viewerUserId != null
                && commentLikeRepository.existsByCommentIdAndUserId(c.getId(), viewerUserId);
        String displayName = null;
        if (author != null) {
            displayName = author.getFullName() != null && !author.getFullName().isBlank()
                    ? author.getFullName()
                    : author.getProfilName();
        }
        return CommentDto.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .username(author != null ? author.getProfilName() : null)
                .profileName(displayName)
                .avatarUrl(author != null ? author.getAvatarUrl() : null)
                .role(author != null ? author.getRole() : null)
                .targetType(c.getTargetType())
                .targetId(c.getTargetId())
                .body(c.getBody())
                .spoiler(c.isSpoiler())
                .likeCount(c.getLikeCount())
                .likedByMe(liked)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .rating(rating != null && rating > 0 ? rating : null)
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
