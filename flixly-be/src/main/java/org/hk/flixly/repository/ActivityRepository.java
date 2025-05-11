package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<UserActivityEntity, Long> {
    List<UserActivityEntity> findAllByUserId(Long userId);
    Optional<UserActivityEntity> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);
}
