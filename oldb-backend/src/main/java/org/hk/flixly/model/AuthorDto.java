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
    /** Ham kitap listesi (geriye uyumluluk) */
    private List<BookEntity> bookWrittenBy;
    /** Kullanıcı durumlarıyla zenginleştirilmiş kitaplar */
    private List<BookDto> books;
    private List<BookEntity> haveBeenReadByTheUser;
    private int userReadCount;
    private int totalBookCount;

    private double averageRating;
    private long ratingCount;
    private double userRating;
}
