package org.hk.flixly.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileShowcaseDto {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String authorName;
    private String coverUrl;
    private String quote;
    private int position;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
