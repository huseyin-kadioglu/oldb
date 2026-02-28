package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;
import org.hk.flixly.model.entity.BookEntity;

import java.util.List;

@Getter
@Setter
public class AuthorDto {
    private Long id;
    private String name;
    private String portrait;
    private Integer birthYear;
    private Integer deathYear;
    private String description;
    private String country;
    private List<BookEntity> bookWrittenBy;
    private List<BookEntity> haveBeenReadByTheUser;

    private double averageRating;
    private long ratingCount;
    private double userRating; // logged-in user's own rating (0 if not rated)
}
