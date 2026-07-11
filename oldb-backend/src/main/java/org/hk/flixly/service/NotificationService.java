package org.hk.flixly.service;

import org.hk.flixly.model.NotificationDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.NotificationEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.model.enums.NotificationType;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.NotificationRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final UserBookMapRepository userBookMapRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            UserBookMapRepository userBookMapRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.userBookMapRepository = userBookMapRepository;
    }

    public List<NotificationDto> list(Long userId, int limit) {
        int lim = Math.min(Math.max(limit, 1), 50);
        return notificationRepository.findRecentByUserId(userId, lim).stream()
                .map(this::toDto)
                .toList();
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public void markRead(Long userId, Long notificationId) {
        notificationRepository.findByIdAndUserId(notificationId, userId).ifPresent(n -> {
            if (n.getReadAt() == null) {
                n.setReadAt(LocalDateTime.now());
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public int markRead(Long userId, Collection<Long> ids) {
        LocalDateTime now = LocalDateTime.now();
        if (ids == null || ids.isEmpty()) {
            return notificationRepository.markAllRead(userId, now);
        }
        return notificationRepository.markReadByIds(userId, ids, now);
    }

    @Transactional
    public void notifyFollow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) return;
        UserEntity actor = userRepository.findById(followerId.intValue()).orElse(null);
        if (actor == null) return;
        notificationRepository.save(NotificationEntity.builder()
                .userId(followingId)
                .actorId(followerId)
                .type(NotificationType.FOLLOW)
                .actorUsername(actor.getProfilName())
                .actorAvatarUrl(actor.getAvatarUrl())
                .linkPath("/profile/" + actor.getProfilName())
                .count(1)
                .build());
    }

    @Transactional
    public void notifyCommentLike(Long actorId, Long commentOwnerId, Long commentId, Long bookIdIfAny) {
        if (actorId.equals(commentOwnerId)) return;
        UserEntity actor = userRepository.findById(actorId.intValue()).orElse(null);
        if (actor == null) return;
        String link = bookIdIfAny != null
                ? "/book/" + bookIdIfAny
                : "/profile/" + actor.getProfilName();
        notificationRepository.save(NotificationEntity.builder()
                .userId(commentOwnerId)
                .actorId(actorId)
                .type(NotificationType.COMMENT_LIKE)
                .actorUsername(actor.getProfilName())
                .actorAvatarUrl(actor.getAvatarUrl())
                .bookId(bookIdIfAny)
                .targetCommentId(commentId)
                .linkPath(link)
                .count(1)
                .build());
    }

    @Transactional
    public void notifyWeeklyPickComment(Long actorId, Long bookId) {
        BookEntity book = bookRepository.findById(bookId).orElse(null);
        if (book == null || !book.isWeeklyPick()) return;

        UserEntity actor = userRepository.findById(actorId.intValue()).orElse(null);
        String actorName = actor != null ? actor.getProfilName() : null;
        String actorAvatar = actor != null ? actor.getAvatarUrl() : null;

        List<Long> recipientIds = userBookMapRepository.findDistinctUserIdsByBookIdAndStatuses(
                bookId,
                List.of(BookActivityStatus.LIBRARY, BookActivityStatus.READLIST, BookActivityStatus.READ, BookActivityStatus.COMPLETED)
        );

        LocalDateTime since = LocalDate.now().atStartOfDay();
        for (Long recipientId : recipientIds) {
            if (recipientId.equals(actorId)) continue;
            // Rate limit: 1 per book per user per day
            if (notificationRepository.findRecentWeeklyPick(
                    recipientId, NotificationType.WEEKLY_PICK_COMMENT, bookId, since).isPresent()) {
                continue;
            }
            notificationRepository.save(NotificationEntity.builder()
                    .userId(recipientId)
                    .actorId(actorId)
                    .type(NotificationType.WEEKLY_PICK_COMMENT)
                    .actorUsername(actorName)
                    .actorAvatarUrl(actorAvatar)
                    .bookId(bookId)
                    .bookTitle(book.getTitle())
                    .linkPath("/book/" + bookId)
                    .count(1)
                    .build());
        }
    }

    /**
     * Okuyan kişi → kitabı READLIST'te tutanlara SAME_BOOK bildirimi (günlük merge + count).
     */
    @Transactional
    public void notifySameBookReaders(Long actorId, Long bookId) {
        if (bookId == null) return;
        BookEntity book = bookRepository.findById(bookId).orElse(null);
        if (book == null) return;
        UserEntity actor = userRepository.findById(actorId.intValue()).orElse(null);
        if (actor == null) return;

        List<Long> onReadlist = userBookMapRepository.findDistinctUserIdsByBookIdAndStatuses(
                bookId, List.of(BookActivityStatus.READLIST));

        LocalDateTime since = LocalDate.now().atStartOfDay();
        for (Long recipientId : onReadlist) {
            if (recipientId.equals(actorId)) continue;

            var existing = notificationRepository.findOpenSameBook(
                    recipientId, NotificationType.SAME_BOOK, bookId, since);
            if (existing.isPresent()) {
                NotificationEntity n = existing.get();
                n.setCount(n.getCount() + 1);
                n.setActorId(actorId);
                n.setActorUsername(actor.getProfilName());
                n.setActorAvatarUrl(actor.getAvatarUrl());
                n.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(n);
            } else {
                notificationRepository.save(NotificationEntity.builder()
                        .userId(recipientId)
                        .actorId(actorId)
                        .type(NotificationType.SAME_BOOK)
                        .actorUsername(actor.getProfilName())
                        .actorAvatarUrl(actor.getAvatarUrl())
                        .bookId(bookId)
                        .bookTitle(book.getTitle())
                        .linkPath("/book/" + bookId)
                        .count(1)
                        .build());
            }
        }
    }

    @Transactional
    public void notifyAvatarDecision(Long userId, boolean approved) {
        if (userId == null) return;
        UserEntity user = userRepository.findById(userId.intValue()).orElse(null);
        if (user == null) return;
        String username = user.getProfilName();
        notificationRepository.save(NotificationEntity.builder()
                .userId(userId)
                .type(approved ? NotificationType.AVATAR_APPROVED : NotificationType.AVATAR_REJECTED)
                .linkPath(approved ? "/profile/" + username : "/settings")
                .count(1)
                .build());
    }

    private NotificationDto toDto(NotificationEntity n) {
        return NotificationDto.builder()
                .id(n.getId())
                .type(n.getType())
                .actorId(n.getActorId())
                .actorUsername(n.getActorUsername())
                .actorAvatarUrl(n.getActorAvatarUrl())
                .bookId(n.getBookId())
                .bookTitle(n.getBookTitle())
                .targetCommentId(n.getTargetCommentId())
                .count(n.getCount())
                .linkPath(n.getLinkPath())
                .read(n.getReadAt() != null)
                .createdAt(n.getCreatedAt())
                .build();
    }
}
