package org.hk.flixly.controller;

import org.hk.flixly.model.BotmStatusDto;
import org.hk.flixly.service.BotmService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/botm")
public class BotmController {

    private final BotmService botmService;

    public BotmController(BotmService botmService) {
        this.botmService = botmService;
    }

    @GetMapping
    public BotmStatusDto current(@AuthenticationPrincipal UserDetails userDetails) {
        return botmService.getCurrent(userDetails);
    }

    @PostMapping("/vote")
    public BotmStatusDto vote(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Giriş gerekli");
        }
        Object raw = body.get("bookId");
        if (raw == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kitap gerekli");
        }
        Long bookId = ((Number) raw).longValue();
        try {
            return botmService.vote(bookId, userDetails);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
