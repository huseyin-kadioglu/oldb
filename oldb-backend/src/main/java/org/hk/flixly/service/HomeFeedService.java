package org.hk.flixly.service;

import org.hk.flixly.model.CommunityBookDto;
import org.hk.flixly.model.CommunityReviewDto;
import org.hk.flixly.model.HomeFeedDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.CommentRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HomeFeedService {

    private static final int RAIL_BOOKS = 8;
    private static final int POPULAR_REVIEWS = 4;

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final ActivityRepository activityRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final CommunityService communityService;

    public HomeFeedService(
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            ActivityRepository activityRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            CommunityService communityService) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.activityRepository = activityRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.communityService = communityService;
    }

    public HomeFeedDto getFeed() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate talkFrom = today.minusDays(30);
        LocalDateTime monthStartTs = monthStart.atStartOfDay();
        LocalDateTime talkFromTs = talkFrom.atStartOfDay();

        List<CommunityBookDto> stoa = mapBooks(bookRepository.findEditorChoices(RAIL_BOOKS), null);
        List<CommunityBookDto> neu = mapBooks(bookRepository.findNewReleases(RAIL_BOOKS), null);
        List<CommunityBookDto> discussed = mapTopRows(
                activityRepository.findMostDiscussedBookIdsSince(talkFromTs, talkFrom, RAIL_BOOKS)
        );
        List<CommunityBookDto> allTime = mapTopRows(
                activityRepository.findMostReadBookIdsAllTime(RAIL_BOOKS)
        );
        List<CommunityReviewDto> popularReviews = loadPopularReviews(monthStart, monthStartTs);

        return HomeFeedDto.builder()
                .stoaPicks(stoa)
                .newReleases(neu)
                .discussed(discussed)
                .allTimeMostRead(allTime)
                .popularReviews(popularReviews)
                .communityStats(communityService.getStats())
                .build();
    }

    private List<CommunityReviewDto> loadPopularReviews(LocalDate monthStart, LocalDateTime monthStartTs) {
        List<Object[]> likedComments = commentRepository.findTopLikedBookCommentsSince(
                monthStartTs, POPULAR_REVIEWS);
        if (likedComments != null && !likedComments.isEmpty()) {
            List<CommunityReviewDto> fromComments = mapLikedComments(likedComments);
            if (!fromComments.isEmpty()) {
                return fromComments;
            }
        }
        return mapActivityReviews(
                activityRepository.findTopReviewsSince(monthStart, POPULAR_REVIEWS));
    }

    private List<CommunityReviewDto> mapLikedComments(List<Object[]> rows) {
        List<Long> userIds = new ArrayList<>();
        List<Long> bookIds = new ArrayList<>();
        for (Object[] row : rows) {
            userIds.add(((Number) row[1]).longValue());
            bookIds.add(((Number) row[2]).longValue());
        }

        Map<Long, UserEntity> users = loadUsers(userIds);
        Map<Long, BookEntity> books = bookRepository.findAllById(bookIds).stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity(), (a, b) -> a));

        List<CommunityReviewDto> result = new ArrayList<>();
        for (Object[] row : rows) {
            Long userId = ((Number) row[1]).longValue();
            Long bookId = ((Number) row[2]).longValue();
            BookEntity book = books.get(bookId);
            if (book == null) {
                continue;
            }
            UserEntity user = users.get(userId);
            result.add(CommunityReviewDto.builder()
                    .activityId(((Number) row[0]).longValue())
                    .userId(userId)
                    .username(user != null ? user.getProfilName() : null)
                    .profileName(user != null ? user.getProfilName() : null)
                    .avatarUrl(user != null ? user.getAvatarUrl() : null)
                    .role(user != null ? user.getRole() : null)
                    .bookId(bookId)
                    .title(book.getTitle())
                    .coverUrl(book.getCoverUrl())
                    .rating(0)
                    .comment(row[3] != null ? row[3].toString() : null)
                    .likeCount(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                    .readDate(row[5] != null
                            ? (row[5] instanceof java.sql.Timestamp ts
                            ? ts.toLocalDateTime().toLocalDate()
                            : LocalDate.parse(row[5].toString().substring(0, 10)))
                            : null)
                    .build());
        }
        return result;
    }

    private List<CommunityReviewDto> mapActivityReviews(List<Object[]> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        List<Long> userIds = new ArrayList<>();
        List<Long> bookIds = new ArrayList<>();
        for (Object[] row : rows) {
            userIds.add(((Number) row[1]).longValue());
            bookIds.add(((Number) row[2]).longValue());
        }
        Map<Long, UserEntity> users = loadUsers(userIds);
        Map<Long, BookEntity> books = bookRepository.findAllById(bookIds).stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity(), (a, b) -> a));

        List<CommunityReviewDto> result = new ArrayList<>();
        for (Object[] row : rows) {
            Long userId = ((Number) row[1]).longValue();
            Long bookId = ((Number) row[2]).longValue();
            BookEntity book = books.get(bookId);
            if (book == null) {
                continue;
            }
            UserEntity user = users.get(userId);
            LocalDate readDate = null;
            if (row[5] != null) {
                readDate = row[5] instanceof LocalDate ld ? ld : LocalDate.parse(row[5].toString());
            }
            result.add(CommunityReviewDto.builder()
                    .activityId(((Number) row[0]).longValue())
                    .userId(userId)
                    .username(user != null ? user.getProfilName() : null)
                    .profileName(user != null ? user.getProfilName() : null)
                    .avatarUrl(user != null ? user.getAvatarUrl() : null)
                    .role(user != null ? user.getRole() : null)
                    .bookId(bookId)
                    .title(book.getTitle())
                    .coverUrl(book.getCoverUrl())
                    .rating(row[3] != null ? ((Number) row[3]).doubleValue() : 0)
                    .comment(row[4] != null ? row[4].toString() : null)
                    .likeCount(0)
                    .readDate(readDate)
                    .build());
        }
        return result;
    }

    private Map<Long, UserEntity> loadUsers(List<Long> userIds) {
        Map<Long, UserEntity> users = new java.util.HashMap<>();
        for (Long id : userIds.stream().distinct().toList()) {
            userRepository.findById(id.intValue()).ifPresent(u -> users.put(u.getId(), u));
        }
        return users;
    }

    private List<CommunityBookDto> mapTopRows(List<Object[]> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        Map<Long, Long> scores = new LinkedHashMap<>();
        for (Object[] row : rows) {
            scores.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }
        Map<Long, BookEntity> books = bookRepository.findAllById(scores.keySet()).stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity()));
        Map<Long, AuthorEntity> authors = loadAuthors(books);

        List<CommunityBookDto> result = new ArrayList<>();
        for (Map.Entry<Long, Long> e : scores.entrySet()) {
            BookEntity book = books.get(e.getKey());
            if (book == null) {
                continue;
            }
            AuthorEntity author = book.getAuthorId() != null ? authors.get(book.getAuthorId()) : null;
            result.add(CommunityBookDto.builder()
                    .id(book.getId())
                    .title(book.getTitle())
                    .originalTitle(book.getOriginalTitle())
                    .coverUrl(book.getCoverUrl())
                    .authorId(book.getAuthorId())
                    .authorName(author != null ? author.getName() : null)
                    .publicationYear(book.getPublicationYear())
                    .pageCount(book.getPageCount())
                    .readCount(e.getValue())
                    .build());
        }
        return result;
    }

    private List<CommunityBookDto> mapBooks(List<BookEntity> entities, Map<Long, Long> scoreById) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }
        Map<Long, AuthorEntity> authors = loadAuthors(
                entities.stream().collect(Collectors.toMap(BookEntity::getId, Function.identity(), (a, b) -> a)));
        List<CommunityBookDto> result = new ArrayList<>();
        for (BookEntity book : entities) {
            AuthorEntity author = book.getAuthorId() != null ? authors.get(book.getAuthorId()) : null;
            result.add(CommunityBookDto.builder()
                    .id(book.getId())
                    .title(book.getTitle())
                    .originalTitle(book.getOriginalTitle())
                    .coverUrl(book.getCoverUrl())
                    .authorId(book.getAuthorId())
                    .authorName(author != null ? author.getName() : null)
                    .publicationYear(book.getPublicationYear())
                    .pageCount(book.getPageCount())
                    .readCount(scoreById != null ? scoreById.getOrDefault(book.getId(), 0L) : 0L)
                    .build());
        }
        return result;
    }

    private Map<Long, AuthorEntity> loadAuthors(Map<Long, BookEntity> books) {
        List<Long> authorIds = books.values().stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (authorIds.isEmpty()) {
            return Map.of();
        }
        return authorRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(AuthorEntity::getId, Function.identity()));
    }
}
