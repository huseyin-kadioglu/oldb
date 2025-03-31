package org.hk.flixly.service;

import org.hk.flixly.model.BookEntity;
import org.hk.flixly.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<BookEntity> getAllBooks() {
        return bookRepository.findAll();
    }
}
