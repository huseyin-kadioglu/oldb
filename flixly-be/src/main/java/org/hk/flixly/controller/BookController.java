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

    @GetMapping("/filter")
    public BookResponse filterBooks(
            @RequestParam(required = false, defaultValue = "false") boolean nobelOnly,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo,
            @RequestParam(required = false, defaultValue = "0") double minRating,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByEmail(userDetails.getUsername())
                    .map(UserEntity::getId).orElse(null);
        }
        return bookService.getFilteredBooks(userId, nobelOnly, country, yearFrom, yearTo, minRating);
    }
}
