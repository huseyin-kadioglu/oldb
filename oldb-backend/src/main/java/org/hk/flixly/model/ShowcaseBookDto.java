package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowcaseBookDto {
    private Long bookId;
    private String title;
    private String authorName;
    private String coverUrl;
    private int position;
}
