package org.hk.flixly.service;

import org.hk.flixly.model.BookDto;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
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

    public List<BookDto> getAllBooks(Long id) {

        List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(id);

        // Kullanıcının her kitapla ilişkisini kolayca erişmek için Map<Long bookId, Set<String status>>
        Map<Long, Set<String>> userBookStatusMap = userBookMaps.stream()
                .collect(Collectors.groupingBy(
                        UserBookMapEntity::getBookId,
                        Collectors.mapping(UserBookMapEntity::getStatus, Collectors.toSet())
                ));

        List<BookEntity> allBooks = bookRepository.findAll();

        List<BookDto> bookDTOs = allBooks.stream()
                .map(book -> {
                    BookDto dto = new BookDto();
                    dto.setId(book.getId());
                    dto.setTitle(book.getTitle());
                    dto.setAuthorId(book.getAuthorId());
                    dto.setCoverUrl(book.getCoverUrl());

                    Set<String> statuses = userBookStatusMap.getOrDefault(book.getId(), Collections.emptySet());

                    dto.setLiked(statuses.contains("LIKE"));
                    dto.setFavourite(statuses.contains("FAVOURITE"));
                    dto.setInReadList(statuses.contains("READLIST"));

                    return dto;
                })
                .collect(Collectors.toList());

        return bookDTOs;
    }

    public List<BookEntity> getBooksByAuthorId(Long id) {
        return bookRepository.findAllByAuthorId(id);
    }

    public List<BookDto> getAllBooks() {
        List<BookEntity> allBooks = bookRepository.findAll();


        List<BookDto> bookDTOs = allBooks.stream()
                .map(book -> {
                    BookDto dto = new BookDto();
                    dto.setId(book.getId());
                    dto.setTitle(book.getTitle());
                    dto.setAuthorId(book.getAuthorId());
                    dto.setCoverUrl(book.getCoverUrl());
                    return dto;
                })
                .collect(Collectors.toList());

        return bookDTOs;
    }
}
