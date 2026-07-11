package org.hk.flixly.model;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookReviewSnippetDto {
    private Long activityId;
    private Long userId;
    private String username;
    private String profileName;
    private String avatarUrl;
    private String role;
    private double rating;
    private String comment;
    private LocalDate readDate;
}
