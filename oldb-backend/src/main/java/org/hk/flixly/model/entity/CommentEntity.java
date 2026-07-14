package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments", indexes = {
        @Index(name = "idx_comments_target", columnList = "targetType,targetId")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_comments_user_target", columnNames = {"userId", "targetType", "targetId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    /** BOOK or AUTHOR */
    @Column(nullable = false, length = 16)
    private String targetType;

    @Column(nullable = false)
    private Long targetId;

    @Column(nullable = false, length = 2000)
    private String body;

    /** True when the whole comment body should be hidden until revealed. */
    @Column(nullable = false)
    @Builder.Default
    private boolean spoiler = false;

    @Column(nullable = false)
    private int likeCount = 0;

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
