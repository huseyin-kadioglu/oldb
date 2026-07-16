package org.hk.flixly.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchSuggestionsDto {
    @Builder.Default
    private List<SearchBookSuggestionDto> books = new ArrayList<>();
    @Builder.Default
    private List<SearchAuthorSuggestionDto> authors = new ArrayList<>();
}
