package org.hk.flixly.controller;

import org.hk.flixly.model.ChangePasswordRequest;
import org.hk.flixly.model.DailyReadCheckinDto;
import org.hk.flixly.model.FeaturedBadgeDto;
import org.hk.flixly.model.ProfileInfoDTO;
import org.hk.flixly.model.ProfileShowcaseDto;
import org.hk.flixly.model.ReadCheckinHistoryDto;
import org.hk.flixly.model.ShowcaseReorderRequest;
import org.hk.flixly.model.ShowcaseRequest;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.repository.UserRepository;
import org.hk.flixly.service.DailyReadCheckinService;
import org.hk.flixly.service.GamificationService;
import org.hk.flixly.service.ProfileService;
import org.hk.flixly.service.ProfileShowcaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/profile")
public class ProfileSummaryController {

    private final ProfileService profileService;
    private final DailyReadCheckinService dailyReadCheckinService;
    private final ProfileShowcaseService profileShowcaseService;
    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    public ProfileSummaryController(
            ProfileService profileService,
            DailyReadCheckinService dailyReadCheckinService,
            ProfileShowcaseService profileShowcaseService,
            GamificationService gamificationService,
            UserRepository userRepository) {
        this.profileService = profileService;
        this.dailyReadCheckinService = dailyReadCheckinService;
        this.profileShowcaseService = profileShowcaseService;
        this.gamificationService = gamificationService;
        this.userRepository = userRepository;
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

    @PostMapping("/showcases")
    public ProfileShowcaseDto createShowcase(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ShowcaseRequest request
    ) {
        requireAuth(userDetails);
        try {
            return profileShowcaseService.create(request, userDetails);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/showcases/reorder")
    public List<ProfileShowcaseDto> reorderShowcases(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ShowcaseReorderRequest request
    ) {
        requireAuth(userDetails);
        try {
            return profileShowcaseService.reorder(
                    request != null ? request.getIds() : null, userDetails);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/showcases/{id}")
    public ProfileShowcaseDto updateShowcase(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ShowcaseRequest request
    ) {
        requireAuth(userDetails);
        try {
            return profileShowcaseService.update(id, request, userDetails);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/showcases/{id}")
    public Map<String, String> deleteShowcase(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        requireAuth(userDetails);
        try {
            profileShowcaseService.delete(id, userDetails);
            return Map.of("status", "ok");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/featured-badge")
    public ResponseEntity<?> setFeaturedBadge(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body
    ) {
        requireAuth(userDetails);
        UserEntity user = requireUser(userDetails);
        try {
            FeaturedBadgeDto dto = gamificationService.setFeaturedBadge(
                    user.getId(),
                    body != null ? body.get("badgeCode") : null
            );
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/featured-badge")
    public ResponseEntity<?> clearFeaturedBadge(@AuthenticationPrincipal UserDetails userDetails) {
        requireAuth(userDetails);
        UserEntity user = requireUser(userDetails);
        gamificationService.clearFeaturedBadge(user.getId());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/{username}/read-checkins")
    public ReadCheckinHistoryDto getReadCheckins(
            @PathVariable String username,
            @RequestParam(required = false, defaultValue = "week") String range
    ) {
        return dailyReadCheckinService.getHistory(username, range);
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

    private void requireAuth(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Giriş gerekli");
        }
    }

    private UserEntity requireUser(UserDetails userDetails) {
        requireAuth(userDetails);
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Kullanıcı bulunamadı"));
    }
}
