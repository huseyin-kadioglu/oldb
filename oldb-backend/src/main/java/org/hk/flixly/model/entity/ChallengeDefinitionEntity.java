package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "challenge_definitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeDefinitionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String title;

    /** BOOKS_YEAR, AUTHORS_YEAR, COUNTRIES_YEAR */
    @Column(nullable = false)
    private String metric;

    @Column(nullable = false)
    private int goal;

    private String color;

    private boolean active;
}
