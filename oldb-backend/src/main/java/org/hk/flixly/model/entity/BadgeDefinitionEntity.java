package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badge_definitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeDefinitionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    /** BOOKS_READ, REVIEWS, AUTHORS, COUNTRIES, LIBRARY */
    @Column(nullable = false)
    private String metric;

    @Column(nullable = false)
    private int goal;

    /** common, uncommon, rare, epic, legendary */
    @Column(nullable = false)
    private String rarity;

    private String icon;

    private String tag;

    private boolean legendaryTrack;
}
