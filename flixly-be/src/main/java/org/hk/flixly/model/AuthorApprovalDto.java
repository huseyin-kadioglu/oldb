package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthorApprovalDto {

    private Long authorId;
    private boolean isWonNobelPrize;
    private Long id;
    private String name;
    private String portrait;
    private Integer birthYear;
    private Integer deathYear;
    private String description;
}
