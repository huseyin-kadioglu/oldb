package org.hk.flixly.repository;

import org.hk.flixly.model.entity.BadgeDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BadgeDefinitionRepository extends JpaRepository<BadgeDefinitionEntity, Long> {
    Optional<BadgeDefinitionEntity> findByCode(String code);

    List<BadgeDefinitionEntity> findAllByOrderByGoalAsc();
}
