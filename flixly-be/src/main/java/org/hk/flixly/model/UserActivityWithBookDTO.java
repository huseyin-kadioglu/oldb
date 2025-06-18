package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UserActivityWithBookDTO {
    private Long bookId;
    private String bookTitle;
    private String coverUrl;
    private LocalDate readDate;
    // ihtiyaca göre yazar adı vs. de eklenebilir

    private Long userId;
    private double rating;
    private String comment;
    private String status;
    private LocalDate updateDate;
    // getter/setter
}