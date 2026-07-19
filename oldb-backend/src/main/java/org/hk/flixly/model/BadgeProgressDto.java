package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeProgressDto {
    private Long id;
    private String code;
    private String title;
    private String description;
    private String rarity;
    private String icon;
    private String tag;
    private int goal;
    private int current;
    private int percent;
    private boolean earned;
    private boolean legendaryTrack;
    /** ISO-8601; yalnızca kazanılmışsa dolu */
    private String earnedAt;
    /** Kullanıcının profilde sergilediği rozet mi */
    private boolean featured;
}
