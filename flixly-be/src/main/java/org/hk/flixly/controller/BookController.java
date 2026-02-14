package org.hk.flixly.controller;

import org.hk.flixly.model.BookResponse;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.BookService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/books")
public class BookController {

    private final BookService bookService;
    private final UserRepository userRepository;

    public BookController(BookService bookService, UserRepository userRepository) {
        this.bookService = bookService;
        this.userRepository = userRepository;
    }

    @GetMapping("/")
    public BookResponse findAll(@AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return bookService.getAllBooks();
        }

        UserEntity user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userDetails.getUsername()));


        return bookService.getAllBooks(user.getId());
    }

    @GetMapping("/publishYear/{publishYear}")
    public BookResponse findByPublishYear(@PathVariable Integer publishYear) {

        return bookService.findAllByPublishYear(publishYear);
    }
}
