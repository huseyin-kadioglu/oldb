package org.hk.flixly.repository;

import org.hk.flixly.model.entity.ProfileShowcaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileShowcaseRepository extends JpaRepository<ProfileShowcaseEntity, Long> {

    List<ProfileShowcaseEntity> findByUserIdOrderByPositionAscIdAsc(Long userId);

    long countByUserId(Long userId);

    Optional<ProfileShowcaseEntity> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    boolean existsByUserIdAndBookIdAndIdNot(Long userId, Long bookId, Long id);
}
