package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_badge", columnNames = {"user_id", "badge_code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBadgeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "badge_code", nullable = false, length = 64)
    private String badgeCode;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;

    @PrePersist
    void onCreate() {
        if (earnedAt == null) {
            earnedAt = LocalDateTime.now();
        }
    }
}
