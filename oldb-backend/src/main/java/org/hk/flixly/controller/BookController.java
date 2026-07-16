package org.hk.flixly.controller;

import org.hk.flixly.model.BookDto;
import org.hk.flixly.model.BookResponse;
import org.hk.flixly.model.BookSocialDto;
import org.hk.flixly.model.DiscoverFeedDto;
import org.hk.flixly.model.DiscoverPageDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.BookService;
import org.hk.flixly.service.BookSocialService;
import org.hk.flixly.service.DiscoverFeedService;
import org.hk.flixly.service.DiscoverService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/books")
public class BookController {

    private final BookService bookService;
    private final BookSocialService bookSocialService;
    private final DiscoverService discoverService;
    private final DiscoverFeedService discoverFeedService;
    private final UserRepository userRepository;

    public BookController(
            BookService bookService,
            BookSocialService bookSocialService,
            DiscoverService discoverService,
            DiscoverFeedService discoverFeedService,
            UserRepository userRepository) {
        this.bookService = bookService;
        this.bookSocialService = bookSocialService;
        this.discoverService = discoverService;
        this.discoverFeedService = discoverFeedService;
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

    @GetMapping("/discover")
    public DiscoverPageDto discover(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo,
            @RequestParam(required = false) Integer minPages,
            @RequestParam(required = false) Integer maxPages,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Boolean editorChoice,
            @RequestParam(required = false) Boolean weeklyPick,
            @RequestParam(required = false) Boolean newRelease,
            @RequestParam(required = false, defaultValue = "mostRead") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "24") int size) {
        return discoverService.discover(
                q, genre, authorId, author, minRating, yearFrom, yearTo,
                minPages, maxPages, language, editorChoice, weeklyPick, newRelease,
                sort, page, size);
    }

    @GetMapping("/discover/feed")
    public DiscoverFeedDto discoverFeed() {
        return discoverFeedService.getFeed();
    }

    @GetMapping("/{bookId}")
    public BookDto findById(@PathVariable Long bookId,
                            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByEmail(userDetails.getUsername())
                    .map(UserEntity::getId).orElse(null);
        }
        return bookService.findById(bookId, userId);
    }

    @GetMapping("/{bookId}/social")
    public BookSocialDto getSocial(
            @PathVariable Long bookId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByEmail(userDetails.getUsername())
                    .map(UserEntity::getId).orElse(null);
        }
        return bookSocialService.getSocial(bookId, userId);
    }
}
