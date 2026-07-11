package org.hk.flixly.service;

import org.hk.flixly.model.*;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookSocialService {

    private static final List<String> FRIEND_STATUSES = List.of(
            BookActivityStatus.READ,
            BookActivityStatus.COMPLETED,
            BookActivityStatus.READLIST,
            BookActivityStatus.LIBRARY,
            BookActivityStatus.LIKE
    );

    private static final Map<String, Integer> STATUS_PRIORITY = Map.of(
            BookActivityStatus.READ, 1,
            BookActivityStatus.COMPLETED, 1,
            BookActivityStatus.READLIST, 2,
            BookActivityStatus.LIBRARY, 3,
            BookActivityStatus.LIKE, 4
    );

    private final BookRepository bookRepository;
    private final UserFollowRepository followRepository;
    private final UserBookMapRepository bookMapRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    public BookSocialService(
            BookRepository bookRepository,
            UserFollowRepository followRepository,
            UserBookMapRepository bookMapRepository,
            UserRepository userRepository,
            ActivityRepository activityRepository) {
        this.bookRepository = bookRepository;
        this.followRepository = followRepository;
        this.bookMapRepository = bookMapRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }

    public BookSocialDto getSocial(Long bookId, Long viewerId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

        return BookSocialDto.builder()
                .friendsReading(buildFriendsReading(bookId, viewerId))
                .topReviews(buildTopReviews(bookId))
                .authorOtherBooks(buildAuthorOtherBooks(book, viewerId))
                .build();
    }

    private List<FriendReadingDto> buildFriendsReading(Long bookId, Long viewerId) {
        if (viewerId == null) {
            return List.of();
        }
        List<Long> followingIds = followRepository.findFollowingIds(viewerId);
        if (followingIds == null || followingIds.isEmpty()) {
            return List.of();
        }

        List<UserBookMapEntity> maps = bookMapRepository.findByBookIdAndUserIdInAndStatusIn(
                bookId, followingIds, FRIEND_STATUSES);
        if (maps.isEmpty()) {
            return List.of();
        }

        Map<Long, String> bestStatusByUser = new LinkedHashMap<>();
        for (UserBookMapEntity map : maps) {
            String status = map.getStatus();
            int prio = STATUS_PRIORITY.getOrDefault(status, 99);
            String existing = bestStatusByUser.get(map.getUserId());
            if (existing == null || prio < STATUS_PRIORITY.getOrDefault(existing, 99)) {
                bestStatusByUser.put(map.getUserId(),
                        BookActivityStatus.COMPLETED.equals(status) ? BookActivityStatus.READ : status);
            }
        }

        List<FriendReadingDto> result = new ArrayList<>();
        for (Map.Entry<Long, String> e : bestStatusByUser.entrySet()) {
            userRepository.findById(e.getKey().intValue()).ifPresent(user ->
                    result.add(FriendReadingDto.builder()
                            .userId(user.getId())
                            .username(user.getProfilName())
                            .profileName(user.getFullName() != null && !user.getFullName().isBlank()
                                    ? user.getFullName()
                                    : user.getProfilName())
                            .avatarUrl(user.getAvatarUrl())
                            .role(user.getRole())
                            .status(e.getValue())
                            .build()));
        }
        result.sort(Comparator.comparing(FriendReadingDto::getProfileName, Comparator.nullsLast(String::compareToIgnoreCase)));
        return result;
    }

    private List<BookReviewSnippetDto> buildTopReviews(Long bookId) {
        List<UserActivityEntity> reviews = activityRepository.findTopReviewsByBookId(bookId, 3);
        List<BookReviewSnippetDto> result = new ArrayList<>();
        for (UserActivityEntity a : reviews) {
            UserEntity user = userRepository.findById(a.getUserId().intValue()).orElse(null);
            result.add(BookReviewSnippetDto.builder()
                    .activityId(a.getId())
                    .userId(a.getUserId())
                    .username(user != null ? user.getProfilName() : null)
                    .profileName(user != null
                            ? (user.getFullName() != null && !user.getFullName().isBlank()
                                ? user.getFullName()
                                : user.getProfilName())
                            : null)
                    .avatarUrl(user != null ? user.getAvatarUrl() : null)
                    .role(user != null ? user.getRole() : null)
                    .rating(a.getRating())
                    .comment(a.getComment())
                    .readDate(a.getReadDate())
                    .build());
        }
        return result;
    }

    private List<BookDto> buildAuthorOtherBooks(BookEntity book, Long viewerId) {
        if (book.getAuthorId() == null) {
            return List.of();
        }
        return bookRepository.findAllByAuthorId(book.getAuthorId()).stream()
                .filter(b -> !b.getId().equals(book.getId()))
                .limit(12)
                .map(b -> {
                    BookDto dto = new BookDto();
                    dto.setId(b.getId());
                    dto.setTitle(b.getTitle());
                    dto.setCoverUrl(b.getCoverUrl());
                    dto.setAuthorId(b.getAuthorId());
                    dto.setPublicationYear(b.getPublicationYear());
                    return dto;
                })
                .toList();
    }
}
