package org.hk.flixly.service;

import org.hk.flixly.model.BookDto;
import org.hk.flixly.model.BookResponse;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final UserBookMapRepository bookMapRepository;

    public BookService(BookRepository bookRepository, UserBookMapRepository bookMapRepository) {
        this.bookRepository = bookRepository;
        this.bookMapRepository = bookMapRepository;
    }

    private static List<BookDto> mapBookEntityToResponse(List<BookEntity> allBooks, Map<Long, Set<String>> userBookStatusMap, Map<Long, Map<String, Integer>> bookStatusCountsMap) {
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
                    Set<String> statuses = userBookStatusMap.getOrDefault(book.getId(), Collections.emptySet());

                    dto.setLiked(statuses.contains("LIKE"));
                    dto.setFavourite(statuses.contains("FAVOURITE"));
                    dto.setInReadList(statuses.contains("READLIST"));

                    Map<String, Integer> counts = bookStatusCountsMap.getOrDefault(book.getId(), Collections.emptyMap());
                    dto.setHowManyPplLiked(counts.getOrDefault("LIKE", 0));
                    dto.setHowManyPplFavourited(counts.getOrDefault("FAVOURITE", 0));
                    dto.setHowManyPplAddedToReadList(counts.getOrDefault("READLIST", 0));

                    return dto;
                })
                .collect(Collectors.toList());
        return bookDTOs;
    }

    public BookResponse getAllBooks(Long id) {

        List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(id);

        // Kullanıcının her kitapla ilişkisini kolayca erişmek için Map<Long bookId, Set<String status>>
        Map<Long, Set<String>> userBookStatusMap = userBookMaps.stream()
                .collect(Collectors.groupingBy(
                        UserBookMapEntity::getBookId,
                        Collectors.mapping(UserBookMapEntity::getStatus, Collectors.toSet())
                ));

        Map<Long, Map<String, Integer>> bookStatusCountsMap = mapTotalStats();

        List<BookEntity> allBooks = bookRepository.findAll();

        List<BookDto> bookDTOs = mapBookEntityToResponse(allBooks, userBookStatusMap, bookStatusCountsMap);

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

                    Map<String, Integer> counts = bookStatusCountsMap.getOrDefault(book.getId(), Collections.emptyMap());
                    dto.setHowManyPplLiked(counts.getOrDefault("LIKE", 0));
                    dto.setHowManyPplFavourited(counts.getOrDefault("FAVOURITE", 0));
                    dto.setHowManyPplAddedToReadList(counts.getOrDefault("READLIST", 0));

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
                    if (book.isWonNobelPrize()) {
                        result.setNobelPrizeWinner(dto);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
        result.setBooks(bookDTOs);
        return result;
    }
}
