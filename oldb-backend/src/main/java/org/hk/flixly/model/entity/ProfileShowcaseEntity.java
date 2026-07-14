package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile_showcases", indexes = {
        @Index(name = "idx_showcase_user", columnList = "userId")
}, uniqueConstraints = {
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

    @Column(nullable = false)
    private Long bookId;

    /** Personal quote / memory shown next to the book. */
    @Column(nullable = false, length = 500)
    private String quote;

    /** Display order within the user's showcase slots (0-based). */
    @Column(nullable = false)
    private int position = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
