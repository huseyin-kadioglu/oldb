package org.hk.flixly.repository;

import org.hk.flixly.model.entity.BotmCandidateEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BotmCandidateRepository extends JpaRepository<BotmCandidateEntity, Long> {
    List<BotmCandidateEntity> findByMonthIdOrderByVoteCountDescIdAsc(Long monthId);

    Optional<BotmCandidateEntity> findByMonthIdAndBookId(Long monthId, Long bookId);

    long countByMonthId(Long monthId);
}
