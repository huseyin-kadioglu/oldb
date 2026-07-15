package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profile_showcase_books", indexes = {
        @Index(name = "idx_showcase_books_showcase", columnList = "showcaseId")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_showcase_book", columnNames = {"showcaseId", "bookId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileShowcaseBookEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long showcaseId;

    @Column(nullable = false)
    private Long bookId;

    /** Display order within the vitrine (0-based). */
    @Column(nullable = false)
    private int position = 0;
}
