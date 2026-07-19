package org.hk.flixly.service;

import org.hk.flixly.model.BookApprovalDto;
import org.hk.flixly.model.BookDto;
import org.hk.flixly.model.BookResponse;
import org.hk.flixly.model.CatalogBookDto;
import org.hk.flixly.model.CatalogDuplicateCheckDto;
import org.hk.flixly.model.CatalogDuplicateMatchDto;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
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

                    applyStatusCounts(dto, bookStatusCountsMap.getOrDefault(book.getId(), Collections.emptyMap()));

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

                    applyStatusCounts(dto, bookStatusCountsMap.getOrDefault(book.getId(), Collections.emptyMap()));

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

    /** Distinct user rows per status (GROUP BY bookId, status). READ+COMPLETED exclusive → sum is safe. */
    private static void applyStatusCounts(BookDto dto, Map<String, Integer> counts) {
        int liked = counts.getOrDefault(BookActivityStatus.LIKE, 0);
        int favourite = counts.getOrDefault(BookActivityStatus.FAVOURITE, 0);
        int readlist = counts.getOrDefault(BookActivityStatus.READLIST, 0);
        int shopping = counts.getOrDefault(BookActivityStatus.SHOPPING, 0);
        int dropped = counts.getOrDefault(BookActivityStatus.DROPPED, 0);
        int library = counts.getOrDefault(BookActivityStatus.LIBRARY, 0);
        int read = counts.getOrDefault(BookActivityStatus.READ, 0)
                + counts.getOrDefault(BookActivityStatus.COMPLETED, 0);

        dto.setHowManyPplLiked(liked);
        dto.setHowManyPplFavourited(favourite);
        dto.setHowManyPplAddedToReadList(readlist);
        dto.setHowManyPplInShopping(shopping);
        dto.setHowManyPplDropped(dropped);
        dto.setFavoriteCount(favourite);
        dto.setLibraryCount(library);
        dto.setReadCount(read);
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
        persistBook(dto, null);
    }

    /** Staff katalog editörü — kitabı doğrudan katalog tablosuna yazar ve kaydı döner. */
    @Transactional
    public CatalogBookDto createBookDirect(BookApprovalDto dto, String actorUsername) {
        validateCatalogPayload(dto);
        CatalogDuplicateCheckDto dups = findDuplicates(dto, null);
        if (dups.isHasDuplicates()) {
            throw new IllegalStateException("Benzer bir kitap zaten katalogda. Önce mevcut kaydı kontrol edin.");
        }
        enforceWeeklyPick(dto, null);
        BookEntity saved = persistBook(dto, actorUsername);
        return toCatalogDto(saved);
    }

    @Transactional
    public CatalogBookDto updateBookDirect(Long bookId, BookApprovalDto dto, String actorUsername) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Kitap bulunamadı: " + bookId));
        validateCatalogPayload(dto);
        CatalogDuplicateCheckDto dups = findDuplicates(dto, bookId);
        if (dups.isHasDuplicates()) {
            throw new IllegalStateException("Bu değişiklik başka bir katalog kaydıyla çakışıyor.");
        }
        enforceWeeklyPick(dto, bookId);
        applyMetadata(book, dto);
        book.setUpdatedBy(actorUsername);
        return toCatalogDto(bookRepository.save(book));
    }

    public CatalogBookDto getCatalogBook(Long bookId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Kitap bulunamadı: " + bookId));
        return toCatalogDto(book);
    }

    public CatalogDuplicateCheckDto findDuplicates(BookApprovalDto dto, Long excludeId) {
        List<CatalogDuplicateMatchDto> matches = new ArrayList<>();
        Set<Long> seen = new HashSet<>();

        String isbnDigits = CatalogGenreCatalog.normalizeIsbn(dto.getIsbn());
        if (isbnDigits.length() == 10 || isbnDigits.length() == 13) {
            for (BookEntity b : bookRepository.findByNormalizedIsbn(isbnDigits, excludeId)) {
                addMatch(matches, seen, b, "isbn");
            }
        }
        if (dto.getAuthorId() != null) {
            String title = dto.getTitle() != null ? dto.getTitle().trim() : "";
            if (!title.isBlank()) {
                for (BookEntity b : bookRepository.findByAuthorAndTitleIgnoreCase(dto.getAuthorId(), title, excludeId)) {
                    addMatch(matches, seen, b, "title_author");
                }
            }
            String original = dto.getOriginalTitle() != null ? dto.getOriginalTitle().trim() : "";
            if (!original.isBlank()) {
                for (BookEntity b : bookRepository.findByAuthorAndOriginalTitleIgnoreCase(
                        dto.getAuthorId(), original, excludeId)) {
                    addMatch(matches, seen, b, "original_title_author");
                }
            }
        }

        return CatalogDuplicateCheckDto.builder()
                .hasDuplicates(!matches.isEmpty())
                .matches(matches)
                .build();
    }

    public CatalogBookDto getActiveWeeklyPick() {
        List<BookEntity> picks = bookRepository.findAllWeeklyPicks();
        if (picks.isEmpty()) return null;
        return toCatalogDto(picks.get(0));
    }

    private void enforceWeeklyPick(BookApprovalDto dto, Long keepId) {
        if (!dto.isWeeklyPick()) return;
        List<BookEntity> existing = bookRepository.findAllWeeklyPicks();
        boolean otherActive = existing.stream()
                .anyMatch(b -> keepId == null || !b.getId().equals(keepId));
        if (otherActive && !dto.isConfirmWeeklyPickReplace()) {
            BookEntity current = existing.stream()
                    .filter(b -> keepId == null || !b.getId().equals(keepId))
                    .findFirst()
                    .orElse(existing.get(0));
            throw new WeeklyPickConflictException(
                    "Şu an haftanın kitabı: \"" + current.getTitle() + "\". Değiştirmek için onaylayın.",
                    toCatalogDto(current));
        }
        bookRepository.clearWeeklyPicksExcept(keepId);
    }

    private void validateCatalogPayload(BookApprovalDto dto) {
        String title = dto.getTitle() != null ? dto.getTitle().trim() : "";
        if (title.isBlank()) {
            throw new IllegalArgumentException("Kitap adı zorunludur.");
        }
        if (dto.getAuthorId() == null || !authorRepository.existsById(dto.getAuthorId())) {
            throw new IllegalArgumentException("Geçerli bir yazar seçilmelidir.");
        }
        if (dto.getYear() < 0 || dto.getYear() > java.time.Year.now().getValue() + 2) {
            throw new IllegalArgumentException("Geçerli bir yayın yılı girin.");
        }
        if (dto.getPageCount() != null && dto.getPageCount() < 0) {
            throw new IllegalArgumentException("Sayfa sayısı negatif olamaz.");
        }
        String isbn = CatalogGenreCatalog.normalizeIsbn(dto.getIsbn());
        if (!isbn.isEmpty() && isbn.length() != 10 && isbn.length() != 13) {
            throw new IllegalArgumentException("ISBN 10 veya 13 haneli olmalıdır.");
        }
    }

    private BookEntity persistBook(BookApprovalDto dto, String actorUsername) {
        BookEntity bookEntity = new BookEntity();
        applyMetadata(bookEntity, dto);
        bookEntity.setCreatedBy(actorUsername);
        bookEntity.setUpdatedBy(actorUsername);
        return bookRepository.save(bookEntity);
    }

    /** Yalnızca metadata — sosyal alanlara dokunulmaz (entity'de yok). */
    private void applyMetadata(BookEntity book, BookApprovalDto dto) {
        book.setTitle(dto.getTitle() != null ? dto.getTitle().trim() : null);
        book.setPublicationYear(dto.getYear());
        book.setDescription(blankToNull(dto.getDescription()));
        book.setCoverUrl(blankToNull(dto.getCoverUrl()));
        book.setAuthorId(dto.getAuthorId());
        book.setOriginalTitle(blankToNull(dto.getOriginalTitle()));
        book.setPageCount(dto.getPageCount());
        book.setEditorChoice(dto.isEditorChoice());
        book.setWeeklyPick(dto.isWeeklyPick());
        book.setNewRelease(dto.isNewRelease());
        book.setAdminNotes(blankToNull(dto.getAdminNotes()));
        book.setEditorNotes(blankToNull(dto.getEditorNotes()));
        book.setGenres(CatalogGenreCatalog.canonicalizeCsv(dto.getGenres()));
        book.setLanguage(blankToNull(dto.getLanguage() != null ? dto.getLanguage().trim().toLowerCase() : null));
        String isbn = CatalogGenreCatalog.normalizeIsbn(dto.getIsbn());
        book.setIsbn(isbn.isEmpty() ? null : isbn);
    }

    private void addMatch(List<CatalogDuplicateMatchDto> matches, Set<Long> seen, BookEntity b, String reason) {
        if (b == null || b.getId() == null || !seen.add(b.getId())) return;
        String authorName = null;
        if (b.getAuthorId() != null) {
            authorName = authorRepository.findById(b.getAuthorId()).map(AuthorEntity::getName).orElse(null);
        }
        matches.add(CatalogDuplicateMatchDto.builder()
                .id(b.getId())
                .title(b.getTitle())
                .authorId(b.getAuthorId())
                .authorName(authorName)
                .year(b.getPublicationYear())
                .isbn(b.getIsbn())
                .coverUrl(b.getCoverUrl())
                .reason(reason)
                .build());
    }

    public CatalogBookDto toCatalogDto(BookEntity book) {
        String authorName = null;
        if (book.getAuthorId() != null) {
            authorName = authorRepository.findById(book.getAuthorId()).map(AuthorEntity::getName).orElse(null);
        }
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        return CatalogBookDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .originalTitle(book.getOriginalTitle())
                .authorId(book.getAuthorId())
                .authorName(authorName)
                .pageCount(book.getPageCount())
                .coverUrl(book.getCoverUrl())
                .description(book.getDescription())
                .year(book.getPublicationYear())
                .isbn(book.getIsbn())
                .genres(book.getGenres())
                .language(book.getLanguage())
                .adminNotes(book.getAdminNotes())
                .editorNotes(book.getEditorNotes())
                .editorChoice(book.isEditorChoice())
                .weeklyPick(book.isWeeklyPick())
                .newRelease(book.isNewRelease())
                .createdBy(book.getCreatedBy())
                .updatedBy(book.getUpdatedBy())
                .createdAt(book.getCreatedAt() != null ? book.getCreatedAt().format(fmt) : null)
                .updatedAt(book.getUpdatedAt() != null ? book.getUpdatedAt().format(fmt) : null)
                .build();
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) return null;
        return s.trim();
    }

    /** Haftanın kitabı çakışması — controller 409 döner. */
    public static class WeeklyPickConflictException extends RuntimeException {
        private final CatalogBookDto current;

        public WeeklyPickConflictException(String message, CatalogBookDto current) {
            super(message);
            this.current = current;
        }

        public CatalogBookDto getCurrent() {
            return current;
        }
    }
}
