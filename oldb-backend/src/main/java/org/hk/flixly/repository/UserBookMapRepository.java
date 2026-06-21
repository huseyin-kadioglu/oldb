package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserBookMapEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserBookMapRepository extends JpaRepository<UserBookMapEntity, Long> {
    List<UserBookMapEntity> findByUserId(Long userId);

    @Query("SELECT ub.bookId, ub.status, COUNT(ub.userId) FROM UserBookMapEntity ub GROUP BY ub.bookId, ub.status")
    List<Object[]> findBookStatusCounts();

    Optional<UserBookMapEntity> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);
}
