package org.hk.flixly.controller;

import org.hk.flixly.model.ChangePasswordRequest;
import org.hk.flixly.model.DailyReadCheckinDto;
import org.hk.flixly.model.ProfileInfoDTO;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.service.DailyReadCheckinService;
import org.hk.flixly.service.ProfileService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/profile")
public class ProfileSummaryController {

    private final ProfileService profileService;
    private final DailyReadCheckinService dailyReadCheckinService;

    public ProfileSummaryController(
            ProfileService profileService,
            DailyReadCheckinService dailyReadCheckinService) {
        this.profileService = profileService;
        this.dailyReadCheckinService = dailyReadCheckinService;
    }

    @GetMapping("/")
    public ProfileInfoDTO findAll(@AuthenticationPrincipal UserDetails userDetails) {
        return profileService.getProfileInfo(userDetails);
    }

    /** Günlük okuma tik’i — {username} path’inden önce tanımlanmalı */
    @GetMapping("/me/read-today")
    public DailyReadCheckinDto getReadToday(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String date
    ) {
        return dailyReadCheckinService.getStatus(userDetails, date);
    }

    @PutMapping("/me/read-today")
    public DailyReadCheckinDto setReadToday(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body
    ) {
        boolean checked = Boolean.TRUE.equals(body.get("checkedIn"))
                || Boolean.TRUE.equals(body.get("checkedInToday"));
        String date = body.get("date") != null ? String.valueOf(body.get("date")) : null;
        return dailyReadCheckinService.setToday(userDetails, date, checked);
    }

    @GetMapping("/{username}")
    public ProfileInfoDTO getProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return profileService.getProfileInfo(username, userDetails);
    }

    @PutMapping("/edit")
    public ProfileInfoDTO updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request
    ) {
        return profileService.updateProfileByEmail(
                userDetails.getUsername(),
                request
        );
    }

    @PostMapping(value = "/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfileInfoDTO uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) throws java.io.IOException {
        return profileService.uploadAvatar(userDetails.getUsername(), file);
    }

    @PutMapping("/change-password")
    public void changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest request
    ) {
        profileService.changePassword(userDetails.getUsername(), request);
    }

    @GetMapping("/{username}/list/{listType}")
    public List<BookEntity> getBookList(
            @PathVariable String username,
            @PathVariable String listType) {
        return profileService.getBookListByStatus(username, listType.toUpperCase());
    }
}
