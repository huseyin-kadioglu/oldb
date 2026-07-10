package org.hk.flixly.controller;

import org.hk.flixly.model.GenrePreferenceDto;
import org.hk.flixly.service.GenrePreferenceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/genres")
public class GenreController {

    private final GenrePreferenceService genrePreferenceService;

    public GenreController(GenrePreferenceService genrePreferenceService) {
        this.genrePreferenceService = genrePreferenceService;
    }

    @GetMapping("/preferences/{username}")
    public List<GenrePreferenceDto> preferences(@PathVariable String username) {
        return genrePreferenceService.forUsername(username);
    }
}
