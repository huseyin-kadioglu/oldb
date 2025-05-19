package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookDto {

    private Long id;
    private String title;
    private String originalTitle;

    private Long authorId;
    private Long publisherId;
    private Long translatorId;
    private Integer pageCount;

    private String coverUrl;
    private String description;
    private int publicationYear;
    private boolean isLiked;
    private boolean isFavourite;
    private boolean isInReadList;
    private boolean isWonNobelPrize;

    private long howManyPplLiked;
    private long howManyPplFavourited;
    private long howManyPplAddedToReadList;
    private long howManyPplDropped;
}
