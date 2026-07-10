package org.hk.flixly.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityBookDto {
    private Long id;
    private String title;
    private String originalTitle;
    private String coverUrl;
    private Long authorId;
    private String authorName;
    private Integer publicationYear;
    private Integer pageCount;
    private double averageRating;
    private long readCount;
}
