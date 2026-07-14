package org.hk.flixly.controller;

import org.hk.flixly.model.HomeFeedDto;
import org.hk.flixly.service.HomeFeedService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/home")
public class HomeController {

    private final HomeFeedService homeFeedService;

    public HomeController(HomeFeedService homeFeedService) {
        this.homeFeedService = homeFeedService;
    }

    @GetMapping
    public HomeFeedDto feed() {
        return homeFeedService.getFeed();
    }
}
