package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<UserActivityEntity, Long> {
    List<UserActivityEntity> findAllByUserId(Long userId);
    Optional<UserActivityEntity> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);

    @Query("SELECT ua.bookId, AVG(ua.rating), COUNT(ua.id) FROM UserActivityEntity ua WHERE ua.rating > 0 GROUP BY ua.bookId")
    List<Object[]> findBookRatingStats();

    @Query("SELECT ua.bookId, AVG(ua.rating), COUNT(ua.id) FROM UserActivityEntity ua WHERE ua.bookId = :bookId AND ua.rating > 0")
    Object[] findRatingStatsByBookId(Long bookId);
}
