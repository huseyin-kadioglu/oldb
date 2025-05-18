package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookResponse {

    private List<BookDto> books;
}
