package org.hk.flixly.model;

import jakarta.persistence.*;
import lombok.*;
import org.hk.flixly.model.enums.ReadingStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_library")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLibraryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long bookId;

    private LocalDateTime addedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReadingStatus status;
}