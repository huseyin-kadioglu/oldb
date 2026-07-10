package org.hk.flixly.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

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
    private String isbn;

    private boolean isLiked;
    private boolean isFavourite;
    private boolean isInReadList;
    private boolean isInLibrary;
    private boolean isInShopping;
    private boolean isRead;
    private boolean isDropped;
    private boolean isWonNobelPrize;

    @JsonProperty("isEditorChoice")
    private boolean editorChoice;
    @JsonProperty("isWeeklyPick")
    private boolean weeklyPick;
    @JsonProperty("isNewRelease")
    private boolean newRelease;

    private long howManyPplLiked;
    private long howManyPplFavourited;
    private long howManyPplAddedToReadList;
    private long howManyPplInShopping;
    private long howManyPplDropped;

    private double averageRating;
    private long ratingCount;

    /** 5★ → 1★ yüzde dağılımı (toplam 100 veya 0) */
    private List<Integer> ratingDistribution;

    private Integer currentPage;

    private String authorName;
    private String authorCountry;
    private String adminNotes;
    private String genres;
}
