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
    /** İlk ilerleme tarihi — bitirme onayında varsayılan başlangıç */
    private java.time.LocalDate readingStartedAt;
    /** Son ilerleme / liste güncellemesi */
    private java.time.LocalDateTime lastUpdated;
}
