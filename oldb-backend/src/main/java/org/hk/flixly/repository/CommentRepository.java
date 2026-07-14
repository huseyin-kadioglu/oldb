package org.hk.flixly.repository;

import org.hk.flixly.model.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

    List<CommentEntity> findByTargetTypeAndTargetIdOrderByUpdatedAtDesc(String targetType, Long targetId);

    Optional<CommentEntity> findByUserIdAndTargetTypeAndTargetId(Long userId, String targetType, Long targetId);

    List<CommentEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(c.likeCount), 0) FROM CommentEntity c WHERE c.userId = :userId")
    long sumLikesReceivedByUser(@Param("userId") Long userId);

    /**
     * Quality popular reviews: multi-word body, min length, min likes.
     * Prefer non-spoilers, then likes, then freshness.
     * Columns: id, user_id, target_id, body, like_count, created_at, spoiler, rating
     */
    @Query(value = """
            SELECT c.id, c.user_id, c.target_id, c.body, c.like_count, c.created_at, c.spoiler,
                   (
                     SELECT MAX(ua.rating)
                     FROM user_activity ua
                     WHERE ua.user_id = c.user_id
                       AND ua.book_id = c.target_id
                       AND ua.rating IS NOT NULL
                       AND ua.rating > 0
                   ) AS rating
            FROM comments c
            WHERE c.target_type = 'BOOK'
              AND c.created_at >= :fromTs
              AND c.like_count >= :minLikes
              AND CHAR_LENGTH(TRIM(c.body)) >= :minChars
              AND TRIM(c.body) LIKE '% %'
            ORDER BY CASE WHEN c.spoiler THEN 1 ELSE 0 END,
                     c.like_count DESC,
                     c.created_at DESC,
                     c.id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findQualityPopularBookCommentsSince(
            @Param("fromTs") java.time.LocalDateTime fromTs,
            @Param("minChars") int minChars,
            @Param("minLikes") int minLikes,
            @Param("limit") int limit
    );
}
