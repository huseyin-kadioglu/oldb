package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class DiscoverBookDto {
    private Long id;
    private String title;
    private String authorName;
    private Long authorId;
    private String coverUrl;
    private int publicationYear;
    private String genres;
    private double averageRating;
    private long ratingCount;
    private long readCount;
    private long favoriteCount;
    private boolean editorChoice;
    private boolean weeklyPick;
    private boolean newRelease;
}
