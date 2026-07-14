package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "botm_months", uniqueConstraints = {
        @UniqueConstraint(name = "uk_botm_year_month", columnNames = {"yearValue", "monthValue"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BotmMonthEntity {

    public static final String PHASE_POLL = "POLL";
    public static final String PHASE_READING = "READING";
    public static final String PHASE_CLOSED = "CLOSED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int yearValue;

    @Column(nullable = false)
    private int monthValue;

    /** POLL | READING | CLOSED */
    @Column(nullable = false, length = 16)
    private String phase;

    private Long winnerBookId;

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
