package org.hk.flixly.controller;

import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.NotificationService;
import org.hk.flixly.service.OpenLibraryImportService;
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
    private final OpenLibraryImportService openLibraryImportService;
    private final NotificationService notificationService;

    public AdminController(
            UserRepository userRepository,
            OpenLibraryImportService openLibraryImportService,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.openLibraryImportService = openLibraryImportService;
        this.notificationService = notificationService;
    }

    /** Open Library'den katalog import / zenginleştirme */
    @PostMapping("/catalog/import-open-library")
    public OpenLibraryImportService.ImportResult importOpenLibrary() {
        return openLibraryImportService.importCatalog();
    }

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

    @PostMapping("/pending-avatars/{userId}/approve")
    public ResponseEntity<Void> approveAvatar(@PathVariable Long userId) {
        userRepository.findById(userId.intValue()).ifPresent(user -> {
            user.setAvatarUrl(user.getPendingAvatarUrl());
            user.setPendingAvatarUrl(null);
            userRepository.save(user);
            notificationService.notifyAvatarDecision(user.getId(), true);
        });
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/pending-avatars/{userId}/reject")
    public ResponseEntity<Void> rejectAvatar(@PathVariable Long userId) {
        userRepository.findById(userId.intValue()).ifPresent(user -> {
            user.setPendingAvatarUrl(null);
            userRepository.save(user);
            notificationService.notifyAvatarDecision(user.getId(), false);
        });
        return ResponseEntity.ok().build();
    }

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

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (!(userDetails instanceof UserEntity actor) || !UserRole.isAdmin(actor.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Sadece admin rol değiştirebilir"));
        }
        String raw = body.get("role");
        UserRole next = UserRole.from(raw);
        return userRepository.findById(userId.intValue())
                .map(user -> {
                    user.setRole(next.name());
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                            "userId", user.getId(),
                            "role", user.getRole()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
