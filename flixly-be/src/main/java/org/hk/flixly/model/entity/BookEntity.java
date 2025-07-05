package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "book_seq")
    @SequenceGenerator(name = "book_seq", sequenceName = "book_id_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String originalTitle;

    private Long authorId;
    private Long publisherId;
    private Long translatorId;

    private Integer pageCount;

    private String coverUrl;
    private String description;
    private int publicationYear;

    private boolean isWonNobelPrize;

}
