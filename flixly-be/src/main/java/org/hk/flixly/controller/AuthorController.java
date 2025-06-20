package org.hk.flixly.controller;

import org.hk.flixly.model.AuthorDto;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.service.AuthorService;
import org.hk.flixly.service.BookService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin
@RestController
@RequestMapping("/authors")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService, BookService bookService) {
        this.authorService = authorService;
    }

    @GetMapping("/{authorId}")
    public AuthorDto findById(@PathVariable Long authorId) {
        return authorService.findById(authorId);
    }

    @GetMapping("/")
    public List<AuthorEntity> findAll() {
        return authorService.findAll();
    }
}