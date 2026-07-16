package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchAuthorSuggestionDto {
    private Long id;
    private String name;
    private String imageUrl;
    private long bookCount;
}
