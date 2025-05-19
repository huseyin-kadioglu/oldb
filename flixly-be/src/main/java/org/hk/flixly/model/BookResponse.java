package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;
import org.hk.flixly.model.entity.AuthorEntity;

import java.util.List;

@Getter
@Setter
public class BookResponse {

    private List<BookDto> books;
    private BookDto nobelPrizeWinner;
    private AuthorEntity author;
}
