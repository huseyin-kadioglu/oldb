package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ShowcaseRequest {
    /** QUOTE (default) or FAVORITE_BOOKS */
    private String type;
    private String title;
    private String description;
    private Long bookId;
    private String quote;
    /** Ordered book ids for FAVORITE_BOOKS */
    private List<Long> bookIds;
}
