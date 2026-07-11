package org.hk.flixly.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String type;
    private Long actorId;
    private String actorUsername;
    private String actorAvatarUrl;
    private Long bookId;
    private String bookTitle;
    private Long targetCommentId;
    private int count;
    private String linkPath;
    private boolean read;
    private LocalDateTime createdAt;
}
