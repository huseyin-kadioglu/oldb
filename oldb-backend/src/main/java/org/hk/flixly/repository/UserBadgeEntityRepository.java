package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserBadgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBadgeEntityRepository extends JpaRepository<UserBadgeEntity, Long> {

    List<UserBadgeEntity> findByUserId(Long userId);

    Optional<UserBadgeEntity> findByUserIdAndBadgeCode(Long userId, String badgeCode);

    boolean existsByUserIdAndBadgeCode(Long userId, String badgeCode);

    long countByUserId(Long userId);
}
