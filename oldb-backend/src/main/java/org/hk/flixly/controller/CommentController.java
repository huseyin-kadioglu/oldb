package org.hk.flixly.controller;

import org.hk.flixly.model.CommentDto;
import org.hk.flixly.model.CreateCommentRequest;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    public CommentController(CommentService commentService, UserRepository userRepository) {
        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<CommentDto> list(
            @RequestParam String targetType,
            @RequestParam Long targetId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long viewerId = resolveUserId(userDetails);
        return commentService.list(targetType, targetId, viewerId);
    }

    @PostMapping
    public CommentDto create(
            @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        requireAuth(userDetails);
        try {
            return commentService.create(request, userDetails);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public CommentDto toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        requireAuth(userDetails);
        try {
            return commentService.toggleLike(id, userDetails);
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
            commentService.delete(id, userDetails);
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

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername())
                .map(UserEntity::getId)
                .orElse(null);
    }
}
