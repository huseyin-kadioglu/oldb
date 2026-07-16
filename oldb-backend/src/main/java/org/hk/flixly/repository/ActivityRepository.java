package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<UserActivityEntity, Long> {
    List<UserActivityEntity> findAllByUserId(Long userId);

    Optional<UserActivityEntity> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);

    @Query("SELECT ua.bookId, AVG(ua.rating), COUNT(ua.id) FROM UserActivityEntity ua WHERE ua.rating > 0 GROUP BY ua.bookId")
    List<Object[]> findBookRatingStats();

    @Query("""
            SELECT ua.userId, MAX(ua.rating)
            FROM UserActivityEntity ua
            WHERE ua.bookId = :bookId
              AND ua.userId IN :userIds
              AND ua.rating IS NOT NULL
              AND ua.rating > 0
            GROUP BY ua.userId
            """)
    List<Object[]> findMaxRatingsByBookAndUsers(
            @Param("bookId") Long bookId,
            @Param("userIds") Collection<Long> userIds
    );

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
            SELECT book_id, COUNT(*) AS read_count
            FROM (
                SELECT DISTINCT user_id, book_id
                FROM user_activity
                WHERE status IN ('READ', 'COMPLETED')
            ) t
            GROUP BY book_id
            ORDER BY read_count DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findMostReadBookIdsAllTime(@Param("limit") int limit);

    @Query(value = """
            SELECT book_id, SUM(cnt)::bigint AS talk_count
            FROM (
                SELECT target_id AS book_id, COUNT(*) AS cnt
                FROM comments
                WHERE target_type = 'BOOK'
                  AND created_at >= :fromTs
                GROUP BY target_id
                UNION ALL
                SELECT book_id, COUNT(*) AS cnt
                FROM user_activity
                WHERE comment IS NOT NULL AND TRIM(comment) <> ''
                  AND COALESCE(update_date, read_date) >= :fromDate
                GROUP BY book_id
            ) t
            GROUP BY book_id
            ORDER BY talk_count DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findMostDiscussedBookIdsSince(
            @Param("fromTs") java.time.LocalDateTime fromTs,
            @Param("fromDate") LocalDate fromDate,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT r.book_id, (r.cnt - COALESCE(p.cnt, 0)) AS growth
            FROM (
                SELECT book_id, COUNT(*) AS cnt
                FROM (
                    SELECT DISTINCT user_id, book_id
                    FROM user_activity
                    WHERE status IN ('READ', 'COMPLETED')
                      AND read_date IS NOT NULL
                      AND read_date >= :recentFrom
                ) t
                GROUP BY book_id
            ) r
            LEFT JOIN (
                SELECT book_id, COUNT(*) AS cnt
                FROM (
                    SELECT DISTINCT user_id, book_id
                    FROM user_activity
                    WHERE status IN ('READ', 'COMPLETED')
                      AND read_date IS NOT NULL
                      AND read_date >= :prevFrom
                      AND read_date < :recentFrom
                ) t
                GROUP BY book_id
            ) p ON p.book_id = r.book_id
            WHERE r.cnt > COALESCE(p.cnt, 0)
            ORDER BY growth DESC, r.cnt DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findRisingBookIds(
            @Param("recentFrom") LocalDate recentFrom,
            @Param("prevFrom") LocalDate prevFrom,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT ua.id, ua.user_id, ua.book_id, ua.rating, ua.comment, ua.read_date, ua.status
            FROM user_activity ua
            WHERE ua.comment IS NOT NULL AND TRIM(ua.comment) <> ''
              AND COALESCE(ua.update_date, ua.read_date) >= :fromDate
            ORDER BY ua.rating DESC NULLS LAST,
                     LENGTH(ua.comment) DESC,
                     COALESCE(ua.update_date, ua.read_date) DESC NULLS LAST,
                     ua.id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findTopReviewsSince(@Param("fromDate") LocalDate fromDate, @Param("limit") int limit);

    /**
     * Quality popular activity reviews: multi-word, min length, preferably rated.
     * Columns: id, user_id, book_id, rating, comment, read_date, status
     */
    @Query(value = """
            SELECT ua.id, ua.user_id, ua.book_id, ua.rating, ua.comment, ua.read_date, ua.status
            FROM user_activity ua
            WHERE ua.comment IS NOT NULL
              AND CHAR_LENGTH(TRIM(ua.comment)) >= :minChars
              AND TRIM(ua.comment) LIKE '% %'
              AND COALESCE(ua.update_date, ua.read_date) >= :fromDate
              AND ua.rating IS NOT NULL
              AND ua.rating > 0
            ORDER BY ua.rating DESC NULLS LAST,
                     CHAR_LENGTH(TRIM(ua.comment)) DESC,
                     COALESCE(ua.update_date, ua.read_date) DESC NULLS LAST,
                     ua.id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findQualityTopReviewsSince(
            @Param("fromDate") LocalDate fromDate,
            @Param("minChars") int minChars,
            @Param("limit") int limit
    );

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

    @Query(value = """
            SELECT * FROM user_activity
            WHERE book_id = :bookId
              AND comment IS NOT NULL AND TRIM(comment) <> ''
            ORDER BY rating DESC NULLS LAST,
                     LENGTH(comment) DESC,
                     COALESCE(update_date, read_date) DESC NULLS LAST,
                     id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<UserActivityEntity> findTopReviewsByBookId(
            @Param("bookId") Long bookId,
            @Param("limit") int limit
    );
}
