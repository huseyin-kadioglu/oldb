package org.hk.flixly.controller;

import org.hk.flixly.model.QuoteEntryDto;
import org.hk.flixly.model.QuoteRequest;
import org.hk.flixly.service.QuoteEntryService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/quotes")
public class QuoteController {

    private final QuoteEntryService quoteEntryService;

    public QuoteController(QuoteEntryService quoteEntryService) {
        this.quoteEntryService = quoteEntryService;
    }

    @GetMapping("/user/{username}")
    public List<QuoteEntryDto> listByUsername(@PathVariable String username) {
        try {
            return quoteEntryService.listForUsername(username);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PostMapping
    public QuoteEntryDto create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody QuoteRequest request) {
        requireAuth(userDetails);
        try {
            return quoteEntryService.create(request, userDetails);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public QuoteEntryDto update(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody QuoteRequest request) {
        requireAuth(userDetails);
        try {
            return quoteEntryService.update(id, request, userDetails);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        requireAuth(userDetails);
        try {
            quoteEntryService.delete(id, userDetails);
            return Map.of("status", "ok");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    private void requireAuth(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Giriş gerekli");
        }
    }
}
