package org.hk.flixly.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "botm_candidates", uniqueConstraints = {
        @UniqueConstraint(name = "uk_botm_candidate", columnNames = {"monthId", "bookId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BotmCandidateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long monthId;

    @Column(nullable = false)
    private Long bookId;

    @Column(nullable = false)
    private int voteCount = 0;
}
