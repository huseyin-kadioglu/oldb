package org.hk.flixly.service;

import org.hk.flixly.model.AuthorApprovalDto;
import org.hk.flixly.model.AuthorDto;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.repository.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final BookService bookService;


    public AuthorService(AuthorRepository authorRepository, BookService bookService) {
        this.authorRepository = authorRepository;
        this.bookService = bookService;
    }

    public AuthorDto findById(Long id) {

        AuthorEntity authorEntity = authorRepository.findById(id).orElseThrow();

        List<BookEntity> writtenByAuthor = bookService.getBooksByAuthorId(id);

        AuthorDto authorResponse = new AuthorDto();
        authorResponse.setName(authorEntity.getName());
        authorResponse.setBirthYear(authorEntity.getBirthYear());
        authorResponse.setDeathYear(authorEntity.getDeathYear());
        authorResponse.setDescription(authorEntity.getDescription());
        authorResponse.setPortrait(authorEntity.getPortrait());
        authorResponse.setBookWrittenBy(writtenByAuthor);
        return authorResponse;
    }

    public List<AuthorEntity> findAll() {
        return authorRepository.findAll();
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
}
