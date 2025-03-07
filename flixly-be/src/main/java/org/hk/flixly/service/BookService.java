package org.hk.flixly.service;

import org.hk.flixly.model.BookEntity;
import org.hk.flixly.repository.BookRepository;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Logger;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<BookEntity> getAllBooks() {
        System.out.println(bookRepository.findAll());
        return bookRepository.findAll();
    }
}
