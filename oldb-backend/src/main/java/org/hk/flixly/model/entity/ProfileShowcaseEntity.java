package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hk.flixly.model.enums.ShowcaseType;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile_showcases", indexes = {
        @Index(name = "idx_showcase_user", columnList = "userId")
}, uniqueConstraints = {
        // Only enforced when bookId is non-null (Postgres allows multiple NULLs)
        @UniqueConstraint(name = "uk_showcase_user_book", columnNames = {"userId", "bookId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileShowcaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    /** QUOTE or FAVORITE_BOOKS — legacy rows default to QUOTE. */
    @Column(nullable = false, length = 32)
    @Builder.Default
    private String type = ShowcaseType.QUOTE;

    /** Optional custom title (especially for favorite books). Max 60. */
    @Column(length = 60)
    private String title;

    /** Optional short blurb under title. Max 120. */
    @Column(length = 120)
    private String description;

    /** Optional — quote vitrine linked book when present. */
    private Long bookId;

    /** Quote / memory text. Nullable for non-quote vitrines. */
    @Column(length = 500)
    private String quote;

    /** Display order within the user's showcase slots (0-based). */
    @Column(nullable = false)
    private int position = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (type == null || type.isBlank()) {
            type = ShowcaseType.QUOTE;
        }
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
