package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_user_created", columnList = "userId, createdAt"),
        @Index(name = "idx_notifications_user_unread", columnList = "userId, readAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Alıcı */
    @Column(nullable = false)
    private Long userId;

    /** Aksiyonu yapan (digest'te null olabilir) */
    private Long actorId;

    @Column(nullable = false, length = 40)
    private String type;

    private String actorUsername;
    private String actorAvatarUrl;

    private Long bookId;
    private String bookTitle;

    private Long targetCommentId;

    @Builder.Default
    private int count = 1;

    @Column(nullable = false)
    private String linkPath;

    private LocalDateTime readAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (count <= 0) {
            count = 1;
        }
    }
}
