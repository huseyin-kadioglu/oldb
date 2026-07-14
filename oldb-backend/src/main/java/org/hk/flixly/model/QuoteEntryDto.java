package org.hk.flixly.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteEntryDto {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String authorName;
    private String coverUrl;
    private String body;
    private String pageNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
