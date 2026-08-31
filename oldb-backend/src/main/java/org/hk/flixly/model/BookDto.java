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

    /** Kullanıcı durumları — is* alanı adı Jackson/Lombok ile bozulmasın diye sade isimler */
    private boolean liked;
    private boolean favourite;
    private boolean inReadList;
    private boolean inLibrary;
    private boolean inShopping;
    private boolean read;
    private boolean dropped;
    private boolean wonNobelPrize;
    /** Yazar Nobel sahibi mi (kapak badge'inden bağımsız; yazar profili / kitap sayfası metni) */
    private boolean authorWonNobelPrize;
    private Integer authorNobelYear;

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

    /** Kapak altı sosyal kanıt — tek book detail response */
    private long favoriteCount;
    private long libraryCount;
    private long readCount;

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
