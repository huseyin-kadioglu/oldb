package org.hk.flixly.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {
    private Long id;
    private Long userId;
    private String username;
    private String profileName;
    private String avatarUrl;
    private String role;
    private String targetType;
    private Long targetId;
    private String body;
    private boolean spoiler;
    private int likeCount;
    private boolean likedByMe;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
