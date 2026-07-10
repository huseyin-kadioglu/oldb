package org.hk.flixly.service;

import org.hk.flixly.model.BookApprovalDto;
import org.hk.flixly.model.BookDto;
import org.hk.flixly.model.BookResponse;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final UserBookMapRepository bookMapRepository;
    private final AuthorRepository authorRepository;
    private final ActivityRepository activityRepository;

    public BookService(BookRepository bookRepository, UserBookMapRepository bookMapRepository,
                       AuthorRepository authorRepository, ActivityRepository activityRepository) {
        this.bookRepository = bookRepository;
        this.bookMapRepository = bookMapRepository;
        this.authorRepository = authorRepository;
        this.activityRepository = activityRepository;
    }

    /** bookId -> [avgRating, ratingCount] */
    private Map<Long, double[]> buildRatingMap() {
        List<Object[]> rows = activityRepository.findBookRatingStats();
        Map<Long, double[]> map = new HashMap<>();
        for (Object[] row : rows) {
            Long bookId = (Long) row[0];
            double avg = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            double rounded = new BigDecimal(avg).setScale(1, RoundingMode.HALF_UP).doubleValue();
            map.put(bookId, new double[]{rounded, count});
        }
        return map;
    }

    /** authorId -> AuthorEntity map */
    private Map<Long, AuthorEntity> buildAuthorMap(List<BookEntity> books) {
        Set<Long> authorIds = books.stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        return authorRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(AuthorEntity::getId, a -> a));
    }

    private static void applyAuthorInfo(BookDto dto, Long authorId, Map<Long, AuthorEntity> authorMap) {
        if (authorId == null || authorMap == null) return;
        AuthorEntity author = authorMap.get(authorId);
        if (author != null) {
            dto.setAuthorName(author.getName());
            dto.setAuthorCountry(author.getCountry());
        }
    }

    private static List<BookDto> mapBookEntityToResponse(List<BookEntity> allBooks,
                                                          Map<Long, Set<String>> userBookStatusMap,
                                                          Map<Long, Map<String, Integer>> bookStatusCountsMap,
                                                          Map<Long, double[]> ratingMap,
                                                          Map<Long, AuthorEntity> authorMap) {
        return allBooks.stream()
                .map(book -> {
                    BookDto dto = new BookDto();
                    dto.setId(book.getId());
                    dto.setTitle(book.getTitle());
                    dto.setAuthorId(book.getAuthorId());
                    dto.setCoverUrl(book.getCoverUrl());
                    dto.setDescription(book.getDescription());
                    dto.setPublicationYear(book.getPublicationYear());
                    dto.setOriginalTitle(book.getOriginalTitle());
                    dto.setWonNobelPrize(book.isWonNobelPrize());
                    dto.setPageCount(book.getPageCount());
                    dto.setIsbn(book.getIsbn());
                    dto.setAdminNotes(book.getAdminNotes());
                    dto.setEditorChoice(book.isEditorChoice());
                    dto.setWeeklyPick(book.isWeeklyPick());
                    dto.setNewRelease(book.isNewRelease());
                    dto.setGenres(book.getGenres());

                    Set<String> statuses = userBookStatusMap.getOrDefault(book.getId(), Collections.emptySet());
                    dto.setLiked(statuses.contains("LIKE"));
                    dto.setFavourite(statuses.contains("FAVOURITE"));
                    dto.setInReadList(statuses.contains("READLIST"));
                    dto.setInLibrary(statuses.contains("LIBRARY"));
                    dto.setInShopping(statuses.contains("SHOPPING"));
                    dto.setRead(statuses.contains("READ") || statuses.contains("COMPLETED"));
                    dto.setDropped(statuses.contains("DROPPED"));

                    Map<String, Integer> counts = bookStatusCountsMap.getOrDefault(book.getId(), Collections.emptyMap());
                    dto.setHowManyPplLiked(counts.getOrDefault("LIKE", 0));
                    dto.setHowManyPplFavourited(counts.getOrDefault("FAVOURITE", 0));
                    dto.setHowManyPplAddedToReadList(counts.getOrDefault("READLIST", 0));
                    dto.setHowManyPplInShopping(counts.getOrDefault("SHOPPING", 0));
                    dto.setHowManyPplDropped(counts.getOrDefault("DROPPED", 0));

                    double[] rating = ratingMap.getOrDefault(book.getId(), new double[]{0.0, 0L});
                    dto.setAverageRating(rating[0]);
                    dto.setRatingCount((long) rating[1]);

                    applyAuthorInfo(dto, book.getAuthorId(), authorMap);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public BookResponse getAllBooks(Long id) {
        List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(id);

        Map<Long, Set<String>> userBookStatusMap = userBookMaps.stream()
                .collect(Collectors.groupingBy(
                        UserBookMapEntity::getBookId,
                        Collectors.mapping(UserBookMapEntity::getStatus, Collectors.toSet())
                ));

        Map<Long, Map<String, Integer>> bookStatusCountsMap = mapTotalStats();
        Map<Long, double[]> ratingMap = buildRatingMap();
        List<BookEntity> allBooks = bookRepository.findAll();
        Map<Long, AuthorEntity> authorMap = buildAuthorMap(allBooks);

        List<BookDto> bookDTOs = mapBookEntityToResponse(allBooks, userBookStatusMap, bookStatusCountsMap, ratingMap, authorMap);

        BookResponse response = new BookResponse();
        response.setBooks(bookDTOs);
        return response;
    }

    public List<BookEntity> getBooksByAuthorId(Long id) {
        return bookRepository.findAllByAuthorId(id);
    }

    public BookResponse getAllBooks() {
        List<BookEntity> allBooks = bookRepository.findAll();
        Map<Long, Map<String, Integer>> bookStatusCountsMap = mapTotalStats();
        Map<Long, double[]> ratingMap = buildRatingMap();
        Map<Long, AuthorEntity> authorMap = buildAuthorMap(allBooks);

        List<BookDto> bookDTOs = allBooks.stream()
                .map(book -> {
                    BookDto dto = new BookDto();
                    dto.setId(book.getId());
                    dto.setTitle(book.getTitle());
                    dto.setAuthorId(book.getAuthorId());
                    dto.setCoverUrl(book.getCoverUrl());
                    dto.setDescription(book.getDescription());
                    dto.setPublicationYear(book.getPublicationYear());
                    dto.setOriginalTitle(book.getOriginalTitle());
                    dto.setWonNobelPrize(book.isWonNobelPrize());
                    dto.setPageCount(book.getPageCount());
                    dto.setIsbn(book.getIsbn());
                    dto.setAdminNotes(book.getAdminNotes());
                    dto.setEditorChoice(book.isEditorChoice());
                    dto.setWeeklyPick(book.isWeeklyPick());
                    dto.setNewRelease(book.isNewRelease());
                    dto.setGenres(book.getGenres());

                    Map<String, Integer> counts = bookStatusCountsMap.getOrDefault(book.getId(), Collections.emptyMap());
                    dto.setHowManyPplLiked(counts.getOrDefault("LIKE", 0));
                    dto.setHowManyPplFavourited(counts.getOrDefault("FAVOURITE", 0));
                    dto.setHowManyPplAddedToReadList(counts.getOrDefault("READLIST", 0));
                    dto.setHowManyPplInShopping(counts.getOrDefault("SHOPPING", 0));
                    dto.setHowManyPplDropped(counts.getOrDefault("DROPPED", 0));

                    double[] rating = ratingMap.getOrDefault(book.getId(), new double[]{0.0, 0L});
                    dto.setAverageRating(rating[0]);
                    dto.setRatingCount((long) rating[1]);

                    applyAuthorInfo(dto, book.getAuthorId(), authorMap);

                    return dto;
                })
                .collect(Collectors.toList());

        BookResponse response = new BookResponse();
        response.setBooks(bookDTOs);
        return response;
    }

    private Map<Long, Map<String, Integer>> mapTotalStats() {
        List<Object[]> statusCounts = bookMapRepository.findBookStatusCounts();

        Map<Long, Map<String, Integer>> bookStatusCountsMap = new HashMap<>();

        for (Object[] row : statusCounts) {
            Long bookId = (Long) row[0];
            String status = (String) row[1];
            Long count = (Long) row[2];

            bookStatusCountsMap
                    .computeIfAbsent(bookId, k -> new HashMap<>())
                    .put(status, count.intValue());
        }
        return bookStatusCountsMap;
    }

    public BookResponse findAllByPublishYear(Integer publishYear) {
        List<BookEntity> entities = bookRepository.findAllByPublicationYear(publishYear);
        BookResponse result = new BookResponse();
        Map<Long, double[]> ratingMap = buildRatingMap();
        Map<Long, AuthorEntity> authorMap = buildAuthorMap(entities);

        List<BookDto> bookDTOs = entities.stream()
                .map(book -> {
                    BookDto dto = new BookDto();
                    dto.setId(book.getId());
                    dto.setTitle(book.getTitle());
                    dto.setAuthorId(book.getAuthorId());
                    dto.setCoverUrl(book.getCoverUrl());
                    dto.setDescription(book.getDescription());
                    dto.setPublicationYear(book.getPublicationYear());
                    dto.setOriginalTitle(book.getOriginalTitle());
                    dto.setWonNobelPrize(book.isWonNobelPrize());
                    dto.setPageCount(book.getPageCount());
                    if (book.isWonNobelPrize()) {
                        result.setNobelPrizeWinner(dto);
                    }
                    double[] rating = ratingMap.getOrDefault(book.getId(), new double[]{0.0, 0L});
                    dto.setAverageRating(rating[0]);
                    dto.setRatingCount((long) rating[1]);
                    applyAuthorInfo(dto, book.getAuthorId(), authorMap);
                    return dto;
                })
                .collect(Collectors.toList());
        result.setBooks(bookDTOs);

        if (result.getNobelPrizeWinner() != null) {
            Long authorId = result.getNobelPrizeWinner().getAuthorId();
            AuthorEntity author = authorRepository.findById(authorId).orElse(null);
            result.setAuthor(author);
        }
        return result;
    }

    public BookResponse getFilteredBooks(Long userId, boolean nobelOnly, String country,
                                         Integer yearFrom, Integer yearTo, double minRating) {
        List<BookEntity> filtered = bookRepository.findFiltered(nobelOnly, yearFrom, yearTo);

        Map<Long, double[]> ratingMap = buildRatingMap();
        Map<Long, AuthorEntity> authorMap = buildAuthorMap(filtered);

        // Java-side filtering: country and minRating (computed field)
        filtered = filtered.stream()
                .filter(book -> {
                    if (country != null && !country.isBlank()) {
                        AuthorEntity author = authorMap.get(book.getAuthorId());
                        if (author == null || !country.equals(author.getCountry())) return false;
                    }
                    if (minRating > 0) {
                        double avg = ratingMap.getOrDefault(book.getId(), new double[]{0.0, 0L})[0];
                        if (avg < minRating) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        Map<Long, Set<String>> userBookStatusMap = Collections.emptyMap();
        if (userId != null) {
            List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(userId);
            userBookStatusMap = userBookMaps.stream()
                    .collect(Collectors.groupingBy(
                            UserBookMapEntity::getBookId,
                            Collectors.mapping(UserBookMapEntity::getStatus, Collectors.toSet())
                    ));
        }

        Map<Long, Map<String, Integer>> bookStatusCountsMap = mapTotalStats();
        List<BookDto> bookDTOs = mapBookEntityToResponse(filtered, userBookStatusMap, bookStatusCountsMap, ratingMap, authorMap);

        BookResponse response = new BookResponse();
        response.setBooks(bookDTOs);
        return response;
    }

    public BookDto findById(Long bookId, Long userId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

        Map<Long, Set<String>> userBookStatusMap = Collections.emptyMap();
        if (userId != null) {
            List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(userId);
            userBookStatusMap = userBookMaps.stream()
                    .collect(Collectors.groupingBy(
                            UserBookMapEntity::getBookId,
                            Collectors.mapping(UserBookMapEntity::getStatus, Collectors.toSet())
                    ));
        }

        Map<Long, Map<String, Integer>> bookStatusCountsMap = mapTotalStats();
        Map<Long, double[]> ratingMap = buildRatingMap();
        Map<Long, AuthorEntity> authorMap = buildAuthorMap(List.of(book));

        BookDto dto = mapBookEntityToResponse(
                List.of(book),
                userBookStatusMap,
                bookStatusCountsMap,
                ratingMap,
                authorMap
        ).get(0);
        dto.setRatingDistribution(getRatingDistributionPercents(bookId));
        if (userId != null) {
            bookMapRepository.findByUserIdAndBookIdAndStatus(userId, bookId, "READLIST")
                    .ifPresent(m -> dto.setCurrentPage(m.getCurrentPage()));
            if (dto.getCurrentPage() == null) {
                bookMapRepository.findByUserIdAndBookIdAndStatus(userId, bookId, "READ")
                        .ifPresent(m -> dto.setCurrentPage(m.getCurrentPage()));
            }
        }
        return dto;
    }

    public List<Integer> getRatingDistributionPercents(Long bookId) {
        List<Object[]> rows = activityRepository.findRatingDistributionByBookId(bookId);
        int[] counts = new int[6]; // index 1..5
        int total = 0;
        if (rows != null) {
            for (Object[] row : rows) {
                int star = ((Number) row[0]).intValue();
                int cnt = ((Number) row[1]).intValue();
                if (star >= 1 && star <= 5) {
                    counts[star] = cnt;
                    total += cnt;
                }
            }
        }
        List<Integer> percents = new ArrayList<>();
        for (int star = 5; star >= 1; star--) {
            if (total == 0) {
                percents.add(0);
            } else {
                percents.add((int) Math.round(100.0 * counts[star] / total));
            }
        }
        return percents;
    }

    public void createApprovedBook(BookApprovalDto dto) {
        BookEntity bookEntity = new BookEntity();
        bookEntity.setTitle(dto.getTitle());
        bookEntity.setPublicationYear(dto.getYear());
        bookEntity.setDescription(dto.getDescription());
        bookEntity.setCoverUrl(dto.getCoverUrl());
        bookEntity.setAuthorId(dto.getAuthorId());
        bookEntity.setOriginalTitle(dto.getOriginalTitle());
        bookEntity.setPageCount(dto.getPageCount());
        bookEntity.setEditorChoice(dto.isEditorChoice());
        bookEntity.setWeeklyPick(dto.isWeeklyPick());
        bookEntity.setNewRelease(dto.isNewRelease());
        bookEntity.setAdminNotes(dto.getAdminNotes());
        bookRepository.save(bookEntity);
    }
}
