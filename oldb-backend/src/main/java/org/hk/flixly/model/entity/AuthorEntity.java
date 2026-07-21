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

    @Column(length = 4000)
    private String description;

    private String country;

    /** Nobel Edebiyat Ödülü sahibi mi (ödül yazara verilir, kitaba değil) */
    @Column(nullable = false)
    private boolean wonNobelPrize = false;

    /** Nobel aldığı yıl, örn. 1957 */
    private Integer nobelYear;

    /** Open Library author key, e.g. /authors/OL23919A */
    @Column(unique = true)
    private String openLibraryKey;
}
