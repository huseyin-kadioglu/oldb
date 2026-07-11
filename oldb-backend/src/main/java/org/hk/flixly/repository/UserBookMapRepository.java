package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserBookMapEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserBookMapRepository extends JpaRepository<UserBookMapEntity, Long> {
    List<UserBookMapEntity> findByUserId(Long userId);

    @Query("SELECT ub.bookId, ub.status, COUNT(ub.userId) FROM UserBookMapEntity ub GROUP BY ub.bookId, ub.status")
    List<Object[]> findBookStatusCounts();

    @Query("""
            SELECT ub.bookId, COUNT(ub)
            FROM UserBookMapEntity ub
            WHERE ub.bookId IN :bookIds AND ub.status = :status
            GROUP BY ub.bookId
            """)
    List<Object[]> countByBookIdsAndStatus(
            @Param("bookIds") Collection<Long> bookIds,
            @Param("status") String status
    );

    Optional<UserBookMapEntity> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);

    List<UserBookMapEntity> findByUserIdAndBookId(Long userId, Long bookId);

    @Query("""
            SELECT DISTINCT ub.userId
            FROM UserBookMapEntity ub
            WHERE ub.bookId = :bookId AND ub.status IN :statuses
            """)
    List<Long> findDistinctUserIdsByBookIdAndStatuses(
            @Param("bookId") Long bookId,
            @Param("statuses") Collection<String> statuses
    );

    @Query("""
            SELECT ub FROM UserBookMapEntity ub
            WHERE ub.bookId = :bookId
              AND ub.userId IN :userIds
              AND ub.status IN :statuses
            """)
    List<UserBookMapEntity> findByBookIdAndUserIdInAndStatusIn(
            @Param("bookId") Long bookId,
            @Param("userIds") Collection<Long> userIds,
            @Param("statuses") Collection<String> statuses
    );
}
