package org.hk.flixly.controller;

import org.hk.flixly.model.SearchSuggestionsDto;
import org.hk.flixly.service.SearchSuggestionService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/search")
public class SearchController {

    private final SearchSuggestionService searchSuggestionService;

    public SearchController(SearchSuggestionService searchSuggestionService) {
        this.searchSuggestionService = searchSuggestionService;
    }

    @GetMapping("/suggestions")
    public SearchSuggestionsDto suggestions(@RequestParam(name = "q", defaultValue = "") String q) {
        return searchSuggestionService.suggest(q);
    }
}
