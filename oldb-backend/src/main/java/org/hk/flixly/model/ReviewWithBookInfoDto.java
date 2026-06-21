package org.hk.flixly.model;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReviewWithBookInfoDto {
    private Long bookId;
    private String coverUrl;
    private String title;
    private Integer year;
    private String authorName; // varsayalım tek bir yazar var
    private LocalDate readDate;
    private String comment;

    // getter / setter
}