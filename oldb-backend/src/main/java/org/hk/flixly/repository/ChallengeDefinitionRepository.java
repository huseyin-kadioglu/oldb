package org.hk.flixly.repository;

import org.hk.flixly.model.entity.ChallengeDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChallengeDefinitionRepository extends JpaRepository<ChallengeDefinitionEntity, Long> {
    List<ChallengeDefinitionEntity> findByActiveTrueOrderByIdAsc();
}
