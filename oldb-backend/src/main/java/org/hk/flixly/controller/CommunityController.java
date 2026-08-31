package org.hk.flixly.controller;

import org.hk.flixly.model.CommunityReviewDto;
import org.hk.flixly.model.CommunityStatsDto;
import org.hk.flixly.service.CommunityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/community")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping("/stats")
    public CommunityStatsDto getStats() {
        return communityService.getStats();
    }

    @GetMapping("/reviews")
    public List<CommunityReviewDto> getRecentReviews(
            @RequestParam(defaultValue = "10") int limit) {
        return communityService.getRecentReviews(limit);
    }
}
