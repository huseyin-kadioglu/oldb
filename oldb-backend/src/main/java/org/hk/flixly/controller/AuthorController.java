package org.hk.flixly.controller;

import org.hk.flixly.model.AuthorDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.AuthorService;
import org.hk.flixly.service.BookService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@CrossOrigin
@RestController
@RequestMapping("/authors")
public class AuthorController {

    private final AuthorService authorService;
    private final UserRepository userRepository;

    public AuthorController(AuthorService authorService, BookService bookService, UserRepository userRepository) {
        this.authorService = authorService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{authorId}")
    public AuthorDto findById(@PathVariable Long authorId,
                              @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return authorService.findById(authorId);
        }
        UserEntity user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return authorService.findById(authorId, user.getId());
    }

    @GetMapping("/")
    public List<AuthorEntity> findAll() {
        return authorService.findAll();
    }

    @PostMapping("/{authorId}/rate")
    public void rateAuthor(@PathVariable Long authorId,
                           @RequestBody Map<String, Double> body,
                           @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        double rating = body.get("rating");
        authorService.rateAuthor(authorId, user.getId(), rating);
    }
}
