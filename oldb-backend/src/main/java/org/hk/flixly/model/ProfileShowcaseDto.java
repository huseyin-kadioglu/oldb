package org.hk.flixly.model;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileShowcaseDto {
    private Long id;
    private String type;
    private String title;
    private String description;
    private Long bookId;
    private String bookTitle;
    private String authorName;
    private String coverUrl;
    private String quote;
    private int position;
    @Builder.Default
    private List<ShowcaseBookDto> books = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
