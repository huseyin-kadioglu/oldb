package org.hk.flixly.controller;

import org.hk.flixly.model.BadgeProgressDto;
import org.hk.flixly.model.ChallengeProgressDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.GamificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamification")
public class GamificationController {

    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    public GamificationController(GamificationService gamificationService, UserRepository userRepository) {
        this.gamificationService = gamificationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/badges")
    public List<BadgeProgressDto> myBadges(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        return gamificationService.getBadgesForUser(user.getId());
    }

    @GetMapping("/badges/{username}")
    public List<BadgeProgressDto> badgesForUser(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails != null) {
            UserEntity viewer = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            if (viewer != null && usernameEquals(viewer, username)) {
                return gamificationService.getBadgesForUser(viewer.getId());
            }
        }
        return gamificationService.getEarnedBadgesForUsername(username);
    }

    private boolean usernameEquals(UserEntity viewer, String username) {
        String profile = viewer.getProfilName();
        return profile != null && profile.equalsIgnoreCase(username);
    }

    @GetMapping("/challenges")
    public List<ChallengeProgressDto> myChallenges(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        return gamificationService.getChallengesForUser(user.getId());
    }

    @GetMapping("/challenges/{username}")
    public List<ChallengeProgressDto> challengesForUser(@PathVariable String username) {
        return gamificationService.getChallengesForUsername(username);
    }

    private UserEntity requireUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("Giriş gerekli");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }
}
