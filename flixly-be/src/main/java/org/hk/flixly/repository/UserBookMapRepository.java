package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserBookMapEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBookMapRepository extends JpaRepository<UserBookMapEntity, Long> {
    List<UserBookMapEntity> findByUserId(Long userId);

    Optional<UserBookMapEntity> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);
}
