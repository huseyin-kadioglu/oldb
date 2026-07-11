package org.hk.flixly.service;

import org.hk.flixly.model.ActivityFeedItemDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.CommentEntity;
import org.hk.flixly.model.entity.CommentLikeEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserFollowEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.CommentLikeRepository;
import org.hk.flixly.repository.CommentRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserFollowRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ActivityFeedService {

    private final ActivityRepository activityRepository;
    private final UserFollowRepository followRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final UserBookMapRepository userBookMapRepository;
    private final NotificationService notificationService;

    public ActivityFeedService(
            ActivityRepository activityRepository,
            UserFollowRepository followRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            CommentRepository commentRepository,
            CommentLikeRepository commentLikeRepository,
            UserBookMapRepository userBookMapRepository,
            NotificationService notificationService) {
        this.activityRepository = activityRepository;
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.userBookMapRepository = userBookMapRepository;
        this.notificationService = notificationService;
    }

    public List<ActivityFeedItemDto> feed(Long viewerId, String scope, int limit) {
        int lim = Math.min(Math.max(limit, 1), 80);
        String s = scope == null ? "friends" : scope.toLowerCase(Locale.ROOT);
        return switch (s) {
            case "you" -> viewerId == null ? List.of() : youFeed(viewerId, lim);
            case "incoming" -> viewerId == null ? List.of() : incomingFeed(viewerId, lim);
            case "community" -> communityFeed(lim);
            default -> viewerId == null ? communityFeed(lim) : friendsFeed(viewerId, lim);
        };
    }

    /** Ana sayfa: son topluluk aktiviteleri */
    public List<ActivityFeedItemDto> recentCommunity(int limit) {
        return communityFeed(Math.min(Math.max(limit, 1), 24));
    }

    private List<ActivityFeedItemDto> friendsFeed(Long viewerId, int limit) {
        List<Long> following = followRepository.findFollowingIds(viewerId);
        if (following.isEmpty()) {
            // henüz kimseyi takip etmiyorsa topluluk akışını göster
            return communityFeed(limit);
        }
        return mapActivities(activityRepository.findRecentByUserIds(following, limit), "friends");
    }

    private List<ActivityFeedItemDto> youFeed(Long viewerId, int limit) {
        return mapActivities(activityRepository.findRecentByUserIds(List.of(viewerId), limit), "you");
    }

    private List<ActivityFeedItemDto> communityFeed(int limit) {
        return mapActivities(activityRepository.findRecentAll(limit), "community");
    }

    private List<ActivityFeedItemDto> incomingFeed(Long viewerId, int limit) {
        List<ActivityFeedItemDto> items = new ArrayList<>();

        // Seni takip edenler
        for (UserFollowEntity f : followRepository.findByFollowingIdOrderByCreatedAtDesc(viewerId)) {
            if (items.size() >= limit) break;
            UserEntity follower = userRepository.findById(f.getFollowerId().intValue()).orElse(null);
            if (follower == null) continue;
            items.add(ActivityFeedItemDto.builder()
                    .userId(follower.getId())
                    .username(follower.getProfilName())
                    .profileName(follower.getProfilName())
                    .avatarUrl(follower.getAvatarUrl())
                    .role(follower.getRole())
                    .status("FOLLOW")
                    .scope("incoming")
                    .incomingType("FOLLOW")
                    .createdAt(f.getCreatedAt())
                    .build());
        }

        // Yorumlarına gelen beğeniler
        List<CommentEntity> myComments = commentRepository.findByUserIdOrderByCreatedAtDesc(viewerId);
        Set<Long> commentIds = myComments.stream().map(CommentEntity::getId).collect(Collectors.toSet());
        if (!commentIds.isEmpty()) {
            Map<Long, CommentEntity> commentMap = myComments.stream()
                    .collect(Collectors.toMap(CommentEntity::getId, Function.identity(), (a, b) -> a));
            List<CommentLikeEntity> likes = commentLikeRepository.findByCommentIdInOrderByIdDesc(commentIds);
            for (CommentLikeEntity like : likes) {
                if (items.size() >= limit) break;
                if (like.getUserId().equals(viewerId)) continue;
                CommentEntity comment = commentMap.get(like.getCommentId());
                UserEntity liker = userRepository.findById(like.getUserId().intValue()).orElse(null);
                if (liker == null || comment == null) continue;
                items.add(ActivityFeedItemDto.builder()
                        .userId(liker.getId())
                        .username(liker.getProfilName())
                        .profileName(liker.getProfilName())
                        .avatarUrl(liker.getAvatarUrl())
                        .role(liker.getRole())
                        .bookId("BOOK".equals(comment.getTargetType()) ? comment.getTargetId() : null)
                        .comment(comment.getBody())
                        .status("COMMENT_LIKE")
                        .scope("incoming")
                        .incomingType("COMMENT_LIKE")
                        .build());
            }
        }

        return items.stream().limit(limit).toList();
    }

    private List<ActivityFeedItemDto> mapActivities(List<UserActivityEntity> activities, String scope) {
        if (activities == null || activities.isEmpty()) return List.of();

        Set<Long> userIds = activities.stream().map(UserActivityEntity::getUserId).collect(Collectors.toSet());
        Set<Long> bookIds = activities.stream().map(UserActivityEntity::getBookId).filter(Objects::nonNull).collect(Collectors.toSet());

        Map<Long, UserEntity> users = new HashMap<>();
        for (Long id : userIds) {
            userRepository.findById(id.intValue()).ifPresent(u -> users.put(u.getId(), u));
        }
        Map<Long, BookEntity> books = bookRepository.findAllById(bookIds).stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity(), (a, b) -> a));

        Map<Long, Long> likeCounts = new HashMap<>();
        if (!bookIds.isEmpty()) {
            for (Object[] row : userBookMapRepository.countByBookIdsAndStatus(bookIds, BookActivityStatus.LIKE)) {
                likeCounts.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
            }
        }

        List<ActivityFeedItemDto> result = new ArrayList<>();
        for (UserActivityEntity a : activities) {
            UserEntity user = users.get(a.getUserId());
            BookEntity book = a.getBookId() != null ? books.get(a.getBookId()) : null;
            boolean hasReview = a.getComment() != null && !a.getComment().isBlank();
            result.add(ActivityFeedItemDto.builder()
                    .activityId(a.getId())
                    .userId(a.getUserId())
                    .username(user != null ? user.getProfilName() : null)
                    .profileName(user != null ? user.getProfilName() : null)
                    .avatarUrl(user != null ? user.getAvatarUrl() : null)
                    .role(user != null ? user.getRole() : null)
                    .bookId(a.getBookId())
                    .bookTitle(book != null ? book.getTitle() : null)
                    .coverUrl(book != null ? book.getCoverUrl() : null)
                    .publicationYear(book != null && book.getPublicationYear() > 0 ? book.getPublicationYear() : null)
                    .status(a.getStatus())
                    .rating(a.getRating())
                    .comment(a.getComment())
                    .hasReview(hasReview)
                    .likeCount(a.getBookId() != null ? likeCounts.getOrDefault(a.getBookId(), 0L) : 0L)
                    .readDate(a.getReadDate())
                    .updateDate(a.getUpdateDate())
                    .scope(scope)
                    .build());
        }
        return result;
    }

    @Transactional
    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Kendini takip edemezsin");
        }
        if (!userRepository.findById(followingId.intValue()).isPresent()) {
            throw new IllegalArgumentException("Kullanıcı bulunamadı");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return;
        }
        followRepository.save(UserFollowEntity.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build());
        notificationService.notifyFollow(followerId, followingId);
    }

    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    public Map<String, Object> followStats(Long userId, Long viewerId) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("followingCount", followRepository.countByFollowerId(userId));
        map.put("followerCount", followRepository.countByFollowingId(userId));
        map.put("following", viewerId != null && followRepository.existsByFollowerIdAndFollowingId(viewerId, userId));
        return map;
    }
}
