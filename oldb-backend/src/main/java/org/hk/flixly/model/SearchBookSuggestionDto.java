package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchBookSuggestionDto {
    private Long id;
    private String title;
    private String authorName;
    private String coverUrl;
}
