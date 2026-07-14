package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCommentRequest {
    private String targetType; // BOOK | AUTHOR
    private Long targetId;
    private String body;
    /** When true, comment body is hidden behind a spoiler reveal control. */
    private boolean spoiler;
}
