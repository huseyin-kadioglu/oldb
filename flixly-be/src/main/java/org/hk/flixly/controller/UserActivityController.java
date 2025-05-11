package org.hk.flixly.controller;

import org.hk.flixly.model.ActivityDto;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.service.UserActivityService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/userActivity")
public class UserActivityController {

    private final UserActivityService userActivityService;

    public UserActivityController(UserActivityService userActivityService) {
        this.userActivityService = userActivityService;
    }

    @PostMapping("/")
    public UserActivityEntity createActivity(@RequestBody ActivityDto activityDto, @AuthenticationPrincipal UserDetails userDetails) {
        return userActivityService.createActivity(activityDto, userDetails);
    }

    @PostMapping("/ghostMenu")
    public UserActivityEntity createActivityFromGhostMenu(@RequestBody ActivityDto activityDto, @AuthenticationPrincipal UserDetails userDetails){
        return userActivityService.createActivityFromGhostMenu(activityDto, userDetails);
    }
}
