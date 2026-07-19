package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeaturedBadgeDto {
    private String code;
    private String title;
    private String description;
    private String icon;
    private String rarity;
    private String earnedAt;
}
