package org.hk.flixly.service;

import org.hk.flixly.model.CommunityBookDto;
import org.hk.flixly.model.CommunityReviewDto;
import org.hk.flixly.model.CommunityStatsDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CommunityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;

    public CommunityService(
            ActivityRepository activityRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            AuthorRepository authorRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
    }

    public CommunityStatsDto getStats() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate last30Days = today.minusDays(30);

        long booksThisMonth = activityRepository.countBooksReadSince(monthStart);
        long booksLast30 = activityRepository.countBooksReadSince(last30Days);
        long activeMembers = userRepository.countByStatusTrue();
        long readersThisMonth = activityRepository.countDistinctReadersSince(monthStart);

        List<Object[]> topRows = activityRepository.findMostReadBookIdsSince(last30Days, 8);
        List<CommunityBookDto> topBooks = mapTopBooks(topRows);

        return CommunityStatsDto.builder()
                .booksReadThisMonth(booksThisMonth)
                .booksReadLast30Days(booksLast30)
                .activeMembers(activeMembers)
                .readersThisMonth(readersThisMonth)
                .booksReadThisMonthList(topBooks)
                .build();
    }

    public List<CommunityReviewDto> getRecentReviews(int limit) {
        List<Object[]> rows = activityRepository.findRecentReviews(Math.min(Math.max(limit, 1), 50));
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        List<Long> userIds = new ArrayList<>();
        List<Long> bookIds = new ArrayList<>();
        for (Object[] row : rows) {
            userIds.add(((Number) row[1]).longValue());
            bookIds.add(((Number) row[2]).longValue());
        }

        Map<Long, UserEntity> users = new java.util.HashMap<>();
        for (Long id : userIds.stream().distinct().toList()) {
            userRepository.findById(id.intValue()).ifPresent(u -> users.put(u.getId(), u));
        }
        Map<Long, BookEntity> books = bookRepository.findAllById(bookIds).stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity(), (a, b) -> a));

        List<CommunityReviewDto> result = new ArrayList<>();
        for (Object[] row : rows) {
            Long userId = ((Number) row[1]).longValue();
            Long bookId = ((Number) row[2]).longValue();
            UserEntity user = users.get(userId);
            BookEntity book = books.get(bookId);
            if (book == null) {
                continue;
            }

            LocalDate readDate = null;
            if (row[5] != null) {
                readDate = row[5] instanceof LocalDate ld ? ld : LocalDate.parse(row[5].toString());
            }

            result.add(CommunityReviewDto.builder()
                    .activityId(((Number) row[0]).longValue())
                    .userId(userId)
                    .username(user != null ? user.getProfilName() : null)
                    .profileName(user != null ? user.getProfilName() : null)
                    .bookId(bookId)
                    .title(book.getTitle())
                    .coverUrl(book.getCoverUrl())
                    .rating(row[3] != null ? ((Number) row[3]).doubleValue() : 0)
                    .comment(row[4] != null ? row[4].toString() : null)
                    .readDate(readDate)
                    .build());
        }
        return result;
    }

    private List<CommunityBookDto> mapTopBooks(List<Object[]> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> readCounts = rows.stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> ((Number) row[1]).longValue(),
                        (a, b) -> a,
                        java.util.LinkedHashMap::new
                ));
        List<Long> bookIds = new ArrayList<>(readCounts.keySet());

        Map<Long, BookEntity> books = bookRepository.findAllById(bookIds).stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity()));

        List<Long> authorIds = books.values().stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, AuthorEntity> authors = authorRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(AuthorEntity::getId, Function.identity()));

        List<CommunityBookDto> result = new ArrayList<>();
        for (Long bookId : bookIds) {
            BookEntity book = books.get(bookId);
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
                    .readCount(readCounts.getOrDefault(bookId, 0L))
                    .build());
        }
        return result;
    }
}
