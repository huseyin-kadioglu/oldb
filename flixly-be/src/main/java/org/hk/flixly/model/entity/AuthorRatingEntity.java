package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "author_ratings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "author_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorRatingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(nullable = false)
    private double rating; // 1-5
}
