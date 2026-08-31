package org.hk.flixly.controller;

import org.hk.flixly.model.HomeFeedDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.HomeFeedService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/home")
public class HomeController {

    private final HomeFeedService homeFeedService;
    private final UserRepository userRepository;

    public HomeController(HomeFeedService homeFeedService, UserRepository userRepository) {
        this.homeFeedService = homeFeedService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public HomeFeedDto feed(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return homeFeedService.getFeed();
        }
        Long userId = userRepository.findByEmail(userDetails.getUsername())
                .map(UserEntity::getId)
                .orElse(null);
        return homeFeedService.getFeed(userId);
    }
}
