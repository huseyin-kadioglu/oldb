package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContinueReadingDto {
    private Long id;
    private String title;
    private String coverUrl;
    private String authorName;
    private Long authorId;
    private Integer pageCount;
    private Integer currentPage;
    private Integer progressPercent;
    /** Son ilerleme / liste güncellemesi */
    private java.time.LocalDateTime lastUpdated;
}
