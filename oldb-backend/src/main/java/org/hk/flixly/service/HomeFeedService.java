package org.hk.flixly.service;

import org.hk.flixly.model.CommunityBookDto;
import org.hk.flixly.model.CommunityReviewDto;
import org.hk.flixly.model.GenrePreferenceDto;
import org.hk.flixly.model.HomeFeedDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.CommentRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HomeFeedService {

    private static final int RAIL_BOOKS = 8;
    private static final int POPULAR_REVIEWS = 4;
    /** Short / one-word blurbs stay in activity feed; not "popular reviews". */
    private static final int MIN_POPULAR_REVIEW_CHARS = 80;
    private static final int MIN_POPULAR_REVIEW_LIKES = 1;
    private static final int POPULAR_LOOKBACK_DAYS = 90;
    /** Minimum completed/read books before personalized rails appear. */
    private static final int MIN_READS_FOR_PERSONALIZATION = 3;
    private static final int MIN_AUTHOR_READS = 2;

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final ActivityRepository activityRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final UserBookMapRepository userBookMapRepository;
    private final GenrePreferenceService genrePreferenceService;
    private final CommunityService communityService;

    public HomeFeedService(
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            ActivityRepository activityRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            UserBookMapRepository userBookMapRepository,
            GenrePreferenceService genrePreferenceService,
            CommunityService communityService) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.activityRepository = activityRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.userBookMapRepository = userBookMapRepository;
        this.genrePreferenceService = genrePreferenceService;
        this.communityService = communityService;
    }

    public HomeFeedDto getFeed() {
        return getFeed(null);
    }

    public HomeFeedDto getFeed(Long userId) {
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
        List<CommunityReviewDto> popularReviews = loadPopularReviews(monthStart, monthStartTs, today);

        HomeFeedDto.HomeFeedDtoBuilder builder = HomeFeedDto.builder()
                .stoaPicks(stoa)
                .newReleases(neu)
                .discussed(discussed)
                .allTimeMostRead(allTime)
                .popularReviews(popularReviews)
                .communityStats(communityService.getStats());

        if (userId != null) {
            applyPersonalization(builder, userId);
        }

        return builder.build();
    }

    private void applyPersonalization(HomeFeedDto.HomeFeedDtoBuilder builder, Long userId) {
        List<UserBookMapEntity> maps = userBookMapRepository.findByUserId(userId);
        Set<Long> readIds = maps.stream()
                .filter(m -> BookActivityStatus.READ.equals(m.getStatus())
                        || BookActivityStatus.COMPLETED.equals(m.getStatus()))
                .map(UserBookMapEntity::getBookId)
                .collect(Collectors.toCollection(HashSet::new));

        if (readIds.size() < MIN_READS_FOR_PERSONALIZATION) {
            return;
        }

        List<BookEntity> readBooks = bookRepository.findAllById(readIds);
        Map<Long, Long> authorReadCounts = readBooks.stream()
                .filter(b -> b.getAuthorId() != null)
                .collect(Collectors.groupingBy(BookEntity::getAuthorId, Collectors.counting()));

        Long topAuthorId = authorReadCounts.entrySet().stream()
                .filter(e -> e.getValue() >= MIN_AUTHOR_READS)
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        List<CommunityBookDto> fromMostReadAuthor = List.of();
        if (topAuthorId != null) {
            List<BookEntity> unreadFromAuthor = bookRepository.findRecentByAuthorId(topAuthorId, RAIL_BOOKS * 3)
                    .stream()
                    .filter(b -> !readIds.contains(b.getId()))
                    .limit(RAIL_BOOKS)
                    .toList();
            if (!unreadFromAuthor.isEmpty()) {
                fromMostReadAuthor = mapBooks(unreadFromAuthor, null);
                builder.fromMostReadAuthor(fromMostReadAuthor);
                builder.mostReadAuthorId(topAuthorId);
                authorRepository.findById(topAuthorId)
                        .ifPresent(a -> builder.mostReadAuthorName(a.getName()));
            }
        }

        List<GenrePreferenceDto> genres = genrePreferenceService.forUserId(userId);
        if (!genres.isEmpty() && genres.get(0).getCount() >= 2) {
            String topGenre = genres.get(0).getGenre();
            List<BookEntity> genreBooks = bookRepository.findByGenreContaining(topGenre, RAIL_BOOKS * 3)
                    .stream()
                    .filter(b -> !readIds.contains(b.getId()))
                    .limit(RAIL_BOOKS)
                    .toList();
            if (!genreBooks.isEmpty()) {
                builder.fromFavoriteGenres(mapBooks(genreBooks, null));
                builder.favoriteGenreLabel(topGenre);
            }
        }

        // History-based: other unread books from authors the user has already read
        Set<Long> usedIds = new HashSet<>(readIds);
        fromMostReadAuthor.forEach(b -> usedIds.add(b.getId()));

        List<Long> authorIds = authorReadCounts.keySet().stream()
                .filter(id -> !Objects.equals(id, topAuthorId))
                .sorted((a, b) -> Long.compare(authorReadCounts.get(b), authorReadCounts.get(a)))
                .limit(5)
                .toList();

        List<BookEntity> historyPool = new ArrayList<>();
        for (Long authorId : authorIds) {
            historyPool.addAll(bookRepository.findRecentByAuthorId(authorId, 6));
        }
        if (historyPool.size() < RAIL_BOOKS && !genres.isEmpty()) {
            for (GenrePreferenceDto g : genres.stream().limit(3).toList()) {
                historyPool.addAll(bookRepository.findByGenreContaining(g.getGenre(), 6));
            }
        }

        List<BookEntity> because = historyPool.stream()
                .filter(b -> b.getId() != null && !usedIds.contains(b.getId()))
                .collect(Collectors.toMap(BookEntity::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new))
                .values().stream()
                .limit(RAIL_BOOKS)
                .toList();
        if (!because.isEmpty()) {
            builder.becauseYouRead(mapBooks(because, null));
        }
    }

    private List<CommunityReviewDto> loadPopularReviews(
            LocalDate monthStart, LocalDateTime monthStartTs, LocalDate today) {
        LocalDateTime lookbackTs = today.minusDays(POPULAR_LOOKBACK_DAYS).atStartOfDay();
        LocalDate lookbackDate = today.minusDays(POPULAR_LOOKBACK_DAYS);

        // Prefer liked quality comments this month, then 90-day lookback.
        // Soften min-likes only after length/multi-word gates already applied.
        List<CommunityReviewDto> fromComments = mapLikedComments(
                commentRepository.findQualityPopularBookCommentsSince(
                        monthStartTs, MIN_POPULAR_REVIEW_CHARS, MIN_POPULAR_REVIEW_LIKES, POPULAR_REVIEWS));
        if (!fromComments.isEmpty()) {
            return fromComments;
        }

        fromComments = mapLikedComments(
                commentRepository.findQualityPopularBookCommentsSince(
                        lookbackTs, MIN_POPULAR_REVIEW_CHARS, MIN_POPULAR_REVIEW_LIKES, POPULAR_REVIEWS));
        if (!fromComments.isEmpty()) {
            return fromComments;
        }

        fromComments = mapLikedComments(
                commentRepository.findQualityPopularBookCommentsSince(
                        lookbackTs, MIN_POPULAR_REVIEW_CHARS, 0, POPULAR_REVIEWS));
        if (!fromComments.isEmpty()) {
            return fromComments;
        }

        List<CommunityReviewDto> fromActivities = mapActivityReviews(
                activityRepository.findQualityTopReviewsSince(
                        monthStart, MIN_POPULAR_REVIEW_CHARS, POPULAR_REVIEWS));
        if (!fromActivities.isEmpty()) {
            return fromActivities;
        }

        return mapActivityReviews(
                activityRepository.findQualityTopReviewsSince(
                        lookbackDate, MIN_POPULAR_REVIEW_CHARS, POPULAR_REVIEWS));
    }

    private List<CommunityReviewDto> mapLikedComments(List<Object[]> rows) {
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
            String comment = row[3] != null ? row[3].toString() : null;
            if (!isQualityReviewText(comment)) {
                continue;
            }
            UserEntity user = users.get(userId);
            double rating = row.length > 7 && row[7] != null ? ((Number) row[7]).doubleValue() : 0;
            boolean spoiler = row.length > 6 && row[6] != null && toBoolean(row[6]);
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
                    .rating(rating)
                    .comment(comment)
                    .likeCount(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                    .readDate(parseRowDate(row[5]))
                    .spoiler(spoiler)
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
            String comment = row[4] != null ? row[4].toString() : null;
            if (!isQualityReviewText(comment)) {
                continue;
            }
            UserEntity user = users.get(userId);
            LocalDate readDate = parseRowDate(row[5]);
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
                    .comment(comment)
                    .likeCount(0)
                    .readDate(readDate)
                    .spoiler(false)
                    .build());
        }
        return result;
    }

    private static boolean isQualityReviewText(String comment) {
        if (comment == null) {
            return false;
        }
        String trimmed = comment.trim().replaceAll("\\s+", " ");
        if (trimmed.length() < MIN_POPULAR_REVIEW_CHARS) {
            return false;
        }
        // Exclude one-word blurbs ("güzel", "incelemeeee")
        return trimmed.contains(" ");
    }

    private static boolean toBoolean(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        if (value instanceof Number n) {
            return n.intValue() != 0;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private static LocalDate parseRowDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDate ld) {
            return ld;
        }
        if (value instanceof java.sql.Date sd) {
            return sd.toLocalDate();
        }
        if (value instanceof java.sql.Timestamp ts) {
            return ts.toLocalDateTime().toLocalDate();
        }
        if (value instanceof LocalDateTime ldt) {
            return ldt.toLocalDate();
        }
        String s = value.toString();
        return LocalDate.parse(s.length() >= 10 ? s.substring(0, 10) : s);
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
