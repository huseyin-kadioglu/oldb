package org.hk.flixly.model;

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

    private long howManyPplLiked;
    private long howManyPplFavourited;
    private long howManyPplAddedToReadList;
    private long howManyPplDropped;

    public Long getId() {

        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOriginalTitle() {
        return originalTitle;
    }

    public void setOriginalTitle(String originalTitle) {
        this.originalTitle = originalTitle;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public Long getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(Long publisherId) {
        this.publisherId = publisherId;
    }

    public Long getTranslatorId() {
        return translatorId;
    }

    public void setTranslatorId(Long translatorId) {
        this.translatorId = translatorId;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(int publicationYear) {
        this.publicationYear = publicationYear;
    }

    public boolean isLiked() {
        return isLiked;
    }

    public void setLiked(boolean liked) {
        isLiked = liked;
    }

    public boolean isFavourite() {
        return isFavourite;
    }

    public void setFavourite(boolean favourite) {
        isFavourite = favourite;
    }

    public boolean isInReadList() {
        return isInReadList;
    }

    public void setInReadList(boolean inReadList) {
        isInReadList = inReadList;
    }

    public long getHowManyPplLiked() {
        return howManyPplLiked;
    }

    public void setHowManyPplLiked(long howManyPplLiked) {
        this.howManyPplLiked = howManyPplLiked;
    }

    public long getHowManyPplFavourited() {
        return howManyPplFavourited;
    }

    public void setHowManyPplFavourited(long howManyPplFavourited) {
        this.howManyPplFavourited = howManyPplFavourited;
    }

    public long getHowManyPplAddedToReadList() {
        return howManyPplAddedToReadList;
    }

    public void setHowManyPplAddedToReadList(long howManyPplAddedToReadList) {
        this.howManyPplAddedToReadList = howManyPplAddedToReadList;
    }

    public long getHowManyPplDropped() {
        return howManyPplDropped;
    }

    public void setHowManyPplDropped(long howManyPplDropped) {
        this.howManyPplDropped = howManyPplDropped;
    }
}
