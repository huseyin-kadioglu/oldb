package org.hk.flixly.controller;

import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

@CrossOrigin
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Bekleyen profil fotoğrafı isteklerini listele */
    @GetMapping("/pending-avatars")
    public List<Map<String, Object>> getPendingAvatars(@AuthenticationPrincipal UserDetails userDetails) {
        return StreamSupport.stream(userRepository.findAll().spliterator(), false)
                .filter(u -> u.getPendingAvatarUrl() != null && !u.getPendingAvatarUrl().isBlank())
                .map(u -> Map.<String, Object>of(
                        "userId", u.getId(),
                        "username", u.getProfilName(),
                        "pendingAvatarUrl", u.getPendingAvatarUrl(),
                        "currentAvatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : ""
                ))
                .toList();
    }

    /** Fotoğraf isteğini onayla */
    @PostMapping("/pending-avatars/{userId}/approve")
    public ResponseEntity<Void> approveAvatar(@PathVariable Long userId) {
        userRepository.findById(userId.intValue()).ifPresent(user -> {
            user.setAvatarUrl(user.getPendingAvatarUrl());
            user.setPendingAvatarUrl(null);
            userRepository.save(user);
        });
        return ResponseEntity.ok().build();
    }

    /** Fotoğraf isteğini reddet */
    @DeleteMapping("/pending-avatars/{userId}/reject")
    public ResponseEntity<Void> rejectAvatar(@PathVariable Long userId) {
        userRepository.findById(userId.intValue()).ifPresent(user -> {
            user.setPendingAvatarUrl(null);
            userRepository.save(user);
        });
        return ResponseEntity.ok().build();
    }

    /** Tüm kullanıcıları listele (admin yönetimi) */
    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return StreamSupport.stream(userRepository.findAll().spliterator(), false)
                .map(u -> Map.<String, Object>of(
                        "userId", u.getId(),
                        "username", u.getProfilName(),
                        "email", u.getUsername(),
                        "role", u.getRole() != null ? u.getRole() : "USER",
                        "status", u.isStatus(),
                        "contributionPoint", u.getContributionPoint(),
                        "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "",
                        "pendingAvatarUrl", u.getPendingAvatarUrl() != null ? u.getPendingAvatarUrl() : ""
                ))
                .toList();
    }
}
