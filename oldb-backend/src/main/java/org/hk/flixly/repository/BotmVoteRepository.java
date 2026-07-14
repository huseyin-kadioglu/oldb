package org.hk.flixly.repository;

import org.hk.flixly.model.entity.BotmVoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BotmVoteRepository extends JpaRepository<BotmVoteEntity, Long> {
    Optional<BotmVoteEntity> findByMonthIdAndUserId(Long monthId, Long userId);
}
