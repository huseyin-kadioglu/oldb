package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenrePreferenceDto {
    private String genre;
    private int count;
    private int percent;
}
