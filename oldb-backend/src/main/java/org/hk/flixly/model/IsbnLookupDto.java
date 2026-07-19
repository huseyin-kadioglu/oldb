package org.hk.flixly.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

/** ISBN lookup sonucu — henüz kaydedilmez; FE preview ile uygular. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IsbnLookupDto {
    private boolean found;
    private String message;
    private String title;
    private String originalTitle;
    private String authorName;
    private Long matchedAuthorId;
    private Integer year;
    private Integer pageCount;
    private String language;
    private String coverUrl;
    private String description;
    private String isbn;
    @Builder.Default
    private List<String> genreSuggestions = new ArrayList<>();
}
