package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "author_approvals")
@Getter
@Setter
public class AuthorApprovalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
    private String portrait;
    private Integer birthYear;
    private Integer deathYear;
    private Long authorId;  // Yazarın ID'si


    @Column(length = 2000)
    private String description;

    private String contributedUser;  // Katkıda bulunan kullanıcının ID'si

    private String status; // örn: PENDING, APPROVED, REJECTED

    private LocalDateTime createdAt = LocalDateTime.now();

    // getter/setter metodları
}
