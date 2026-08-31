package org.hk.flixly.controller;

import org.hk.flixly.model.NotificationDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<NotificationDto> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "30") int limit
    ) {
        return notificationService.list(requireUserId(userDetails), limit);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        return Map.of("count", notificationService.unreadCount(requireUserId(userDetails)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markOneRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        notificationService.markRead(requireUserId(userDetails), id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read")
    public Map<String, Integer> markRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) Map<String, List<Long>> body
    ) {
        List<Long> ids = body != null ? body.get("ids") : null;
        int updated = notificationService.markRead(requireUserId(userDetails), ids);
        return Map.of("updated", updated);
    }

    private Long requireUserId(UserDetails userDetails) {
        UserEntity user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
        return user.getId();
    }
}
