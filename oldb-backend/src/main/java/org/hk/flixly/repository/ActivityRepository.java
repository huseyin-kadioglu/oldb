package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<UserActivityEntity, Long> {
    List<UserActivityEntity> findAllByUserId(Long userId);

    Optional<UserActivityEntity> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);

    @Query("SELECT ua.bookId, AVG(ua.rating), COUNT(ua.id) FROM UserActivityEntity ua WHERE ua.rating > 0 GROUP BY ua.bookId")
    List<Object[]> findBookRatingStats();

    @Query("SELECT ua.bookId, AVG(ua.rating), COUNT(ua.id) FROM UserActivityEntity ua WHERE ua.bookId = :bookId AND ua.rating > 0")
    Object[] findRatingStatsByBookId(Long bookId);

    @Query(value = """
            SELECT
              CASE
                WHEN rating < 1.5 THEN 1
                WHEN rating < 2.5 THEN 2
                WHEN rating < 3.5 THEN 3
                WHEN rating < 4.5 THEN 4
                ELSE 5
              END AS star,
              COUNT(*) AS cnt
            FROM user_activity
            WHERE book_id = :bookId AND rating > 0
            GROUP BY star
            ORDER BY star DESC
            """, nativeQuery = true)
    List<Object[]> findRatingDistributionByBookId(@Param("bookId") Long bookId);

    @Query(value = """
            SELECT ua.id, ua.user_id, ua.book_id, ua.rating, ua.comment, ua.read_date, ua.status
            FROM user_activity ua
            WHERE ua.comment IS NOT NULL AND TRIM(ua.comment) <> ''
            ORDER BY COALESCE(ua.read_date, ua.update_date) DESC NULLS LAST, ua.id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findRecentReviews(@Param("limit") int limit);

    @Query(value = """
            SELECT COUNT(*) FROM (
                SELECT DISTINCT user_id, book_id
                FROM user_activity
                WHERE status IN ('READ', 'COMPLETED')
                  AND read_date IS NOT NULL
                  AND read_date >= :fromDate
            ) t
            """, nativeQuery = true)
    long countBooksReadSince(@Param("fromDate") LocalDate fromDate);

    @Query(value = """
            SELECT COUNT(DISTINCT user_id)
            FROM user_activity
            WHERE status IN ('READ', 'COMPLETED')
              AND read_date IS NOT NULL
              AND read_date >= :fromDate
            """, nativeQuery = true)
    long countDistinctReadersSince(@Param("fromDate") LocalDate fromDate);

    @Query(value = """
            SELECT book_id, COUNT(*) AS read_count
            FROM (
                SELECT DISTINCT user_id, book_id
                FROM user_activity
                WHERE status IN ('READ', 'COMPLETED')
                  AND read_date IS NOT NULL
                  AND read_date >= :fromDate
            ) t
            GROUP BY book_id
            ORDER BY read_count DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findMostReadBookIdsSince(@Param("fromDate") LocalDate fromDate, @Param("limit") int limit);

    @Query(value = """
            SELECT * FROM user_activity
            WHERE user_id IN (:userIds)
            ORDER BY COALESCE(update_date, read_date) DESC NULLS LAST, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<UserActivityEntity> findRecentByUserIds(@Param("userIds") List<Long> userIds, @Param("limit") int limit);

    @Query(value = """
            SELECT * FROM user_activity
            ORDER BY COALESCE(update_date, read_date) DESC NULLS LAST, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<UserActivityEntity> findRecentAll(@Param("limit") int limit);
}
