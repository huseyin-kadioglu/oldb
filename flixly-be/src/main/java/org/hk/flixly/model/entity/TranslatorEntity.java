package org.hk.flixly.model.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "translators")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranslatorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}