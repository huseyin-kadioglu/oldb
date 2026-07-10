package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCommentRequest {
    private String targetType; // BOOK | AUTHOR
    private Long targetId;
    private String body;
}
