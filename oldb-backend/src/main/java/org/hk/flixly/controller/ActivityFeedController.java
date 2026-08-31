package org.hk.flixly.controller;

import org.hk.flixly.model.ActivityFeedItemDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.ActivityFeedService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/activity")
public class ActivityFeedController {

    private final ActivityFeedService activityFeedService;
    private final UserRepository userRepository;

    public ActivityFeedController(ActivityFeedService activityFeedService, UserRepository userRepository) {
        this.activityFeedService = activityFeedService;
        this.userRepository = userRepository;
    }

    @GetMapping("/feed")
    public List<ActivityFeedItemDto> feed(
            @RequestParam(defaultValue = "friends") String scope,
            @RequestParam(defaultValue = "40") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long viewerId = resolveUserId(userDetails);
        return activityFeedService.feed(viewerId, scope, limit);
    }

    @GetMapping("/recent")
    public List<ActivityFeedItemDto> recent(@RequestParam(defaultValue = "12") int limit) {
        return activityFeedService.recentCommunity(limit);
    }

    @PostMapping("/follow/{username}")
    public Map<String, Object> follow(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity me = requireUser(userDetails);
        UserEntity target = resolveByUsername(username);
        try {
            activityFeedService.follow(me.getId(), target.getId());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        return activityFeedService.followStats(target.getId(), me.getId());
    }

    @DeleteMapping("/follow/{username}")
    public Map<String, Object> unfollow(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity me = requireUser(userDetails);
        UserEntity target = resolveByUsername(username);
        activityFeedService.unfollow(me.getId(), target.getId());
        return activityFeedService.followStats(target.getId(), me.getId());
    }

    @GetMapping("/follow/{username}/stats")
    public Map<String, Object> followStats(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity target = resolveByUsername(username);
        Long viewerId = resolveUserId(userDetails);
        return activityFeedService.followStats(target.getId(), viewerId);
    }

    private UserEntity requireUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Giriş gerekli");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Kullanıcı bulunamadı"));
    }

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername())
                .map(UserEntity::getId)
                .orElse(null);
    }

    private UserEntity resolveByUsername(String username) {
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));
    }
}
