package org.hk.flixly.service;

import org.hk.flixly.model.entity.BookEntity;
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
        List<BookEntity> all = bookRepository.findAll();
        all.stream().forEach(item -> {
            item.setDescription("Bu eser, edebi derinliği ve karakter zenginliği ile okuyucuyu etkileyen unutulmaz bir yolculuğa davet ediyor. Klasikler arasında yerini almış bu kitap, insan ruhunun karmaşıklığını ustalıkla işliyor");
            item.setPublicationYear(2012);
        });
        return all;
    }

    public List<BookEntity> getBooksByAuthorId(Long id) {
        return bookRepository.findAllByAuthorId(id);
    }
}
