package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "user_book_map")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBookMapEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long bookId;
    private String status; // COMPLETED, DROPPED, LIKED, FAVOURITE, READLIST
}