package org.hk.flixly.service;

import org.hk.flixly.model.AuthorApprovalDto;
import org.hk.flixly.model.AuthorDto;
import org.hk.flixly.model.BookDto;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.AuthorRatingEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRatingRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final BookService bookService;
    private final AuthorRatingRepository authorRatingRepository;
    private final UserBookMapRepository userBookMapRepository;
    private final ActivityRepository activityRepository;

    public AuthorService(AuthorRepository authorRepository, BookService bookService,
                         AuthorRatingRepository authorRatingRepository,
                         UserBookMapRepository userBookMapRepository,
                         ActivityRepository activityRepository) {
        this.authorRepository = authorRepository;
        this.bookService = bookService;
        this.authorRatingRepository = authorRatingRepository;
        this.userBookMapRepository = userBookMapRepository;
        this.activityRepository = activityRepository;
    }

    public AuthorDto findById(Long id) {
        return findById(id, null);
    }

    public AuthorDto findById(Long id, Long userId) {
        AuthorEntity authorEntity = authorRepository.findById(id).orElseThrow();
        List<BookEntity> writtenByAuthor = bookService.getBooksByAuthorId(id);

        Map<Long, Set<String>> userStatusMap = Collections.emptyMap();
        if (userId != null) {
            List<UserBookMapEntity> maps = userBookMapRepository.findByUserId(userId);
            userStatusMap = maps.stream()
                    .collect(Collectors.groupingBy(
                            UserBookMapEntity::getBookId,
                            Collectors.mapping(UserBookMapEntity::getStatus, Collectors.toSet())
                    ));
        }

        final Map<Long, Set<String>> statusMap = userStatusMap;
        Map<Long, double[]> bookRatingMap = buildBookRatingMap();
        Map<Long, Map<String, Integer>> statusCountsMap = mapBookStatusCounts();
        List<BookDto> bookDtos = writtenByAuthor.stream()
                .map(book -> {
                    BookDto dto = toBookDto(book, authorEntity, statusMap.getOrDefault(book.getId(), Collections.emptySet()));
                    double[] rating = bookRatingMap.get(book.getId());
                    if (rating != null) {
                        dto.setAverageRating(new BigDecimal(rating[0]).setScale(1, RoundingMode.HALF_UP).doubleValue());
                        dto.setRatingCount((long) rating[1]);
                    }
                    Map<String, Integer> counts = statusCountsMap.getOrDefault(book.getId(), Collections.emptyMap());
                    int read = counts.getOrDefault(BookActivityStatus.READ, 0)
                            + counts.getOrDefault(BookActivityStatus.COMPLETED, 0);
                    int liked = counts.getOrDefault(BookActivityStatus.LIKE, 0);
                    dto.setReadCount(read);
                    dto.setHowManyPplLiked(liked);
                    return dto;
                })
                .toList();

        List<BookDto> readByUser = bookDtos.stream()
                .filter(BookDto::isRead)
                .toList();

        AuthorDto authorResponse = new AuthorDto();
        authorResponse.setId(authorEntity.getId());
        authorResponse.setName(authorEntity.getName());
        authorResponse.setBirthYear(authorEntity.getBirthYear());
        authorResponse.setDeathYear(authorEntity.getDeathYear());
        authorResponse.setDescription(authorEntity.getDescription());
        authorResponse.setPortrait(authorEntity.getPortrait());
        authorResponse.setCountry(authorEntity.getCountry());
        authorResponse.setBooks(bookDtos);
        authorResponse.setBookWrittenBy(writtenByAuthor);
        authorResponse.setHaveBeenReadByTheUser(
                writtenByAuthor.stream().filter(b -> {
                    Set<String> s = statusMap.getOrDefault(b.getId(), Collections.emptySet());
                    return s.contains(BookActivityStatus.READ) || s.contains(BookActivityStatus.COMPLETED);
                }).toList()
        );
        authorResponse.setUserReadCount(readByUser.size());
        authorResponse.setTotalBookCount(bookDtos.size());

        applyRatingStats(authorResponse, id);

        if (userId != null) {
            authorRatingRepository.findByUserIdAndAuthorId(userId, id)
                    .ifPresent(r -> authorResponse.setUserRating(r.getRating()));
        }

        return authorResponse;
    }

    private static BookDto toBookDto(BookEntity book, AuthorEntity author, Set<String> statuses) {
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setOriginalTitle(book.getOriginalTitle());
        dto.setAuthorId(book.getAuthorId());
        dto.setCoverUrl(book.getCoverUrl());
        dto.setDescription(book.getDescription());
        dto.setPublicationYear(book.getPublicationYear());
        dto.setPageCount(book.getPageCount());
        dto.setWonNobelPrize(book.isWonNobelPrize());
        dto.setPageCount(book.getPageCount());
        dto.setIsbn(book.getIsbn());
        dto.setEditorChoice(book.isEditorChoice());
        dto.setWeeklyPick(book.isWeeklyPick());
        dto.setNewRelease(book.isNewRelease());
        dto.setGenres(book.getGenres());
        dto.setAuthorName(author.getName());
        dto.setAuthorCountry(author.getCountry());
        dto.setLiked(statuses.contains(BookActivityStatus.LIKE));
        dto.setFavourite(statuses.contains(BookActivityStatus.FAVOURITE));
        dto.setInReadList(statuses.contains(BookActivityStatus.READLIST));
        dto.setInLibrary(statuses.contains(BookActivityStatus.LIBRARY));
        dto.setInShopping(statuses.contains(BookActivityStatus.SHOPPING));
        dto.setRead(statuses.contains(BookActivityStatus.READ) || statuses.contains(BookActivityStatus.COMPLETED));
        dto.setDropped(statuses.contains(BookActivityStatus.DROPPED));
        return dto;
    }

    public List<AuthorEntity> findAll() {
        return authorRepository.findAll();
    }

    public void rateAuthor(Long authorId, Long userId, double rating) {
        AuthorRatingEntity entity = authorRatingRepository
                .findByUserIdAndAuthorId(userId, authorId)
                .orElse(new AuthorRatingEntity());
        entity.setUserId(userId);
        entity.setAuthorId(authorId);
        entity.setRating(rating);
        authorRatingRepository.save(entity);
    }

    public void createApprovedAuthor(AuthorApprovalDto dto) {
        AuthorEntity authorEntity = new AuthorEntity();
        authorEntity.setName(dto.getName());
        authorEntity.setPortrait(dto.getPortrait());
        authorEntity.setDescription(dto.getDescription());
        authorEntity.setBirthYear(dto.getBirthYear());
        authorEntity.setDeathYear(dto.getDeathYear());
        authorRepository.save(authorEntity);
    }

    private void applyRatingStats(AuthorDto dto, Long authorId) {
        Object[] raw = authorRatingRepository.findRatingStatsByAuthorId(authorId);
        if (raw == null || raw.length == 0) {
            return;
        }
        Object[] row = raw[0] instanceof Object[] ? (Object[]) raw[0] : raw;
        if (row.length < 2 || row[0] == null) {
            return;
        }
        double avg = ((Number) row[0]).doubleValue();
        long count = row[1] != null ? ((Number) row[1]).longValue() : 0;
        dto.setAverageRating(new BigDecimal(avg).setScale(1, RoundingMode.HALF_UP).doubleValue());
        dto.setRatingCount(count);
    }

    /** bookId -> [avgRating, ratingCount] — keşif kartları için mevcut activity verisi */
    private Map<Long, double[]> buildBookRatingMap() {
        List<Object[]> rows = activityRepository.findBookRatingStats();
        Map<Long, double[]> map = new HashMap<>();
        if (rows == null) {
            return map;
        }
        for (Object[] row : rows) {
            if (row == null || row.length < 3 || row[0] == null || row[1] == null) {
                continue;
            }
            Long bookId = ((Number) row[0]).longValue();
            double avg = ((Number) row[1]).doubleValue();
            double count = row[2] != null ? ((Number) row[2]).doubleValue() : 0;
            map.put(bookId, new double[]{avg, count});
        }
        return map;
    }

    private Map<Long, Map<String, Integer>> mapBookStatusCounts() {
        List<Object[]> statusCounts = userBookMapRepository.findBookStatusCounts();
        Map<Long, Map<String, Integer>> map = new HashMap<>();
        if (statusCounts == null) {
            return map;
        }
        for (Object[] row : statusCounts) {
            if (row == null || row.length < 3 || row[0] == null || row[1] == null) {
                continue;
            }
            Long bookId = ((Number) row[0]).longValue();
            String status = String.valueOf(row[1]);
            int count = row[2] != null ? ((Number) row[2]).intValue() : 0;
            map.computeIfAbsent(bookId, k -> new HashMap<>()).put(status, count);
        }
        return map;
    }
}
