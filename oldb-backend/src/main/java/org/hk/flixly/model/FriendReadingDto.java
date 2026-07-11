package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendReadingDto {
    private Long userId;
    private String username;
    private String profileName;
    private String avatarUrl;
    private String role;
    /** READ | READLIST | LIBRARY | LIKE */
    private String status;
}
