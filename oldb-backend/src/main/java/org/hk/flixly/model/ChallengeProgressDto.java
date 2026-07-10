package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeProgressDto {
    private Long id;
    private String code;
    private String title;
    private int goal;
    private int progress;
    private int percent;
    private String color;
}
