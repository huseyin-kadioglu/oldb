package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "books", indexes = {
        @Index(name = "idx_books_ol_key", columnList = "openLibraryKey", unique = true),
        @Index(name = "idx_books_title", columnList = "title"),
        @Index(name = "idx_books_author_id", columnList = "authorId"),
        @Index(name = "idx_books_publication_year", columnList = "publicationYear")
})
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

    @Column(length = 4000)
    private String description;

    private int publicationYear;

    private boolean isWonNobelPrize;

    /** Open Library work key, e.g. /works/OL45804W */
    @Column(unique = true)
    private String openLibraryKey;

    private String isbn;

    @Column(length = 500)
    private String adminNotes;

    /** Kullanıcıya açık editör öneri notu */
    @Column(length = 1000)
    private String editorNotes;

    @Column(nullable = false)
    private boolean editorChoice = false;

    @Column(nullable = false)
    private boolean weeklyPick = false;

    @Column(nullable = false)
    private boolean newRelease = false;

    /** Virgülle ayrılmış türler (ör. Fiction, Mystery) */
    @Column(length = 1000)
    private String genres;

    /** ISO dil kodu (ör. tur, eng) — Open Library language */
    @Column(length = 16)
    private String language;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    /** Staff username (profil adı) */
    @Column(name = "created_by", length = 64)
    private String createdBy;

    @Column(name = "updated_by", length = 64)
    private String updatedBy;

    @PrePersist
    void onCreate() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}
