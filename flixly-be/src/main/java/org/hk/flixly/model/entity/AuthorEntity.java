package org.hk.flixly.model.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "authors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
    private String portrait;
    private Integer birthYear;
    private Integer deathYear;
    private String description;

}