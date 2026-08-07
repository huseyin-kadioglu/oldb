package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_activity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivityEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long bookId;
    /** Okumaya başlama tarihi (KPI için bitiş ile birlikte gerekir) */
    private LocalDate startDate;
    /** Okumayı bitirme tarihi */
    private LocalDate readDate;
    private double rating;
    private String comment;
    private String status;
    private LocalDate updateDate;
}
