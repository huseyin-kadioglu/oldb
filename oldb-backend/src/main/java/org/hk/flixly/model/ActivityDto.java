package org.hk.flixly.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class ActivityDto {
    private Long userId;
    private Long bookId;
    private Long authorId;
    private LocalDate readDate;
    private double rating;
    private String comment;
    private String status;
    private String actionType; // LIKE, FAVOURITE, READLIST
    private String action; // ADD, REMOVE
}
