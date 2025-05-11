package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;
import org.hk.flixly.model.entity.BookEntity;

import java.util.List;

@Getter
@Setter
public class AuthorDto {
    private String name;
    private String portrait;
    private Integer birthYear;
    private Integer deathYear;
    private String description;
    private List<BookEntity> bookWrittenBy;
    private List<BookEntity> haveBeenReadByTheUser;
}
