package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogDuplicateMatchDto {
    private Long id;
    private String title;
    private String authorName;
    private Long authorId;
    private Integer year;
    private String isbn;
    private String coverUrl;
    /** isbn | title_author | original_title_author */
    private String reason;
}
