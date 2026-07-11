package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "user_book_map")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBookMapEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long bookId;
    private String status; // READ, READLIST, LIBRARY, DROPPED, LIKE, FAVOURITE
    /** LIBRARY durumunda: PHYSICAL veya PDF */
    private String libraryFormat;
    /** Okuma ilerlemesi (sayfa) — READLIST / devam eden okumalar */
    private Integer currentPage;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}