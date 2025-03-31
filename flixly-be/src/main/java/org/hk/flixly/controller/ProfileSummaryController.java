package org.hk.flixly.controller;

import org.hk.flixly.model.ProfileInfoDTO;
import org.hk.flixly.service.ProfileService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/")
    public ProfileInfoDTO findAll(@RequestParam String username) {

        return profileService.getProfileInfo(username);
    }
}