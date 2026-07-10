package org.hk.flixly.model;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityFeedItemDto {
    private Long activityId;
    private Long userId;
    private String username;
    private String profileName;
    private String avatarUrl;

    private Long bookId;
    private String bookTitle;
    private String coverUrl;
    private Integer publicationYear;

    private String status;
    private double rating;
    private String comment;
    private boolean hasReview;

    private LocalDate readDate;
    private LocalDate updateDate;
    private LocalDateTime createdAt;

    /** friends | you | incoming | community */
    private String scope;
    private String incomingType; // FOLLOW | COMMENT_LIKE | null
}
