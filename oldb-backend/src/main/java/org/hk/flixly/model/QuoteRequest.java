package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuoteRequest {
    private Long bookId;
    private String body;
    private String pageNote;
}
