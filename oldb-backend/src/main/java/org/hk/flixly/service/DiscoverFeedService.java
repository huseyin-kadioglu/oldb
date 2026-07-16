package org.hk.flixly.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.hk.flixly.model.DiscoverBookDto;
import org.hk.flixly.model.DiscoverFeedDto;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DiscoverFeedService {

    private static final int RAIL_SIZE = 12;

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final ActivityRepository activityRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public DiscoverFeedService(
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            ActivityRepository activityRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.activityRepository = activityRepository;
    }

    public DiscoverFeedDto getFeed() {
        LocalDate today = LocalDate.now();
        LocalDate weekFrom = today.minusDays(7);
        LocalDate monthFrom = today.minusDays(30);
        LocalDate riseRecent = today.minusDays(14);
        LocalDate risePrev = today.minusDays(28);
        LocalDate talkFrom = today.minusDays(30);

        List<DiscoverBookDto> trending = mapScoreRows(
                activityRepository.findMostDiscussedBookIdsSince(talkFrom.atStartOfDay(), talkFrom, RAIL_SIZE));
        List<DiscoverBookDto> editor = mapEntities(bookRepository.findEditorChoices(RAIL_SIZE));

        List<DiscoverBookDto> week = mapScoreRows(
                activityRepository.findMostReadBookIdsSince(weekFrom, RAIL_SIZE));
        if (week.isEmpty()) {
            week = mapScoreRows(activityRepository.findMostReadBookIdsSince(monthFrom, RAIL_SIZE));
        }
        if (week.isEmpty()) {
            week = mapScoreRows(activityRepository.findMostReadBookIdsAllTime(RAIL_SIZE));
        }

        List<DiscoverBookDto> neu = mapEntities(bookRepository.findNewReleases(RAIL_SIZE));

        List<DiscoverBookDto> rising = mapScoreRows(
                activityRepository.findRisingBookIds(riseRecent, risePrev, RAIL_SIZE));
        if (rising.isEmpty()) {
            rising = mapScoreRows(activityRepository.findMostReadBookIdsSince(monthFrom, RAIL_SIZE));
        }
        if (rising.isEmpty()) {
            rising = trending;
        }

        enrichRatingsAndReads(trending, editor, week, neu, rising);

        return DiscoverFeedDto.builder()
                .trending(trending)
                .editorChoice(editor)
                .weekMostRead(week)
                .newReleases(neu)
                .rising(rising)
                .build();
    }

    private List<DiscoverBookDto> mapScoreRows(List<Object[]> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        Map<Long, Long> scores = new LinkedHashMap<>();
        for (Object[] row : rows) {
            scores.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }
        Map<Long, BookEntity> books = bookRepository.findAllById(scores.keySet()).stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity()));
        Map<Long, AuthorEntity> authors = loadAuthors(books.values().stream().toList());

        List<DiscoverBookDto> out = new ArrayList<>();
        for (Map.Entry<Long, Long> e : scores.entrySet()) {
            BookEntity book = books.get(e.getKey());
            if (book == null) {
                continue;
            }
            AuthorEntity author = book.getAuthorId() != null ? authors.get(book.getAuthorId()) : null;
            DiscoverBookDto dto = toDto(book, author);
            dto.setReadCount(e.getValue());
            out.add(dto);
        }
        return out;
    }

    private List<DiscoverBookDto> mapEntities(List<BookEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }
        Map<Long, AuthorEntity> authors = loadAuthors(entities);
        List<DiscoverBookDto> out = new ArrayList<>(entities.size());
        for (BookEntity book : entities) {
            AuthorEntity author = book.getAuthorId() != null ? authors.get(book.getAuthorId()) : null;
            out.add(toDto(book, author));
        }
        return out;
    }

    private DiscoverBookDto toDto(BookEntity book, AuthorEntity author) {
        return DiscoverBookDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .authorName(author != null ? author.getName() : null)
                .authorId(book.getAuthorId())
                .coverUrl(book.getCoverUrl())
                .publicationYear(book.getPublicationYear())
                .genres(book.getGenres())
                .editorChoice(book.isEditorChoice())
                .weeklyPick(book.isWeeklyPick())
                .newRelease(book.isNewRelease())
                .build();
    }

    private Map<Long, AuthorEntity> loadAuthors(List<BookEntity> books) {
        List<Long> ids = books.stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return authorRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(AuthorEntity::getId, Function.identity()));
    }

    @SafeVarargs
    private void enrichRatingsAndReads(List<DiscoverBookDto>... lists) {
        List<Long> ids = new ArrayList<>();
        for (List<DiscoverBookDto> list : lists) {
            for (DiscoverBookDto dto : list) {
                if (dto.getId() != null) {
                    ids.add(dto.getId());
                }
            }
        }
        if (ids.isEmpty()) {
            return;
        }

        Map<Long, double[]> ratings = loadRatings(ids);
        Map<Long, Long> reads = loadReadCounts(ids);

        for (List<DiscoverBookDto> list : lists) {
            for (DiscoverBookDto dto : list) {
                double[] r = ratings.get(dto.getId());
                if (r != null) {
                    dto.setAverageRating(r[0]);
                    dto.setRatingCount((long) r[1]);
                }
                if (dto.getReadCount() <= 0) {
                    dto.setReadCount(reads.getOrDefault(dto.getId(), 0L));
                }
            }
        }
    }

    @SuppressWarnings("unchecked")
    private Map<Long, double[]> loadRatings(List<Long> bookIds) {
        Query q = entityManager.createNativeQuery("""
                SELECT book_id, AVG(rating)::float, COUNT(*)
                FROM user_activity
                WHERE book_id IN (:ids)
                  AND rating IS NOT NULL AND rating > 0
                GROUP BY book_id
                """);
        q.setParameter("ids", bookIds);
        List<Object[]> rows = q.getResultList();
        Map<Long, double[]> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put(((Number) row[0]).longValue(), new double[]{
                    ((Number) row[1]).doubleValue(),
                    ((Number) row[2]).doubleValue()
            });
        }
        return map;
    }

    @SuppressWarnings("unchecked")
    private Map<Long, Long> loadReadCounts(List<Long> bookIds) {
        Query q = entityManager.createNativeQuery("""
                SELECT book_id, COUNT(*)
                FROM user_book_map
                WHERE book_id IN (:ids)
                  AND status IN ('READ', 'COMPLETED')
                GROUP BY book_id
                """);
        q.setParameter("ids", bookIds);
        List<Object[]> rows = q.getResultList();
        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }
        return map;
    }
}
