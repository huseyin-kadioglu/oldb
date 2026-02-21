package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

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

    // Admin editorial fields
    @Column(length = 500)
    private String adminNotes;

    private boolean isEditorChoice;
    private boolean isWeeklyPick;
    private boolean isNewRelease;
}
