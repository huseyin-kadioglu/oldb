package org.hk.flixly.repository;

import org.hk.flixly.model.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query(value = """
            SELECT * FROM notifications
            WHERE user_id = :userId
            ORDER BY created_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<NotificationEntity> findRecentByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    long countByUserIdAndReadAtIsNull(Long userId);

    Optional<NotificationEntity> findByIdAndUserId(Long id, Long userId);

    @Query("""
            SELECT n FROM NotificationEntity n
            WHERE n.userId = :userId
              AND n.type = :type
              AND n.bookId = :bookId
              AND n.readAt IS NULL
              AND n.createdAt >= :since
            """)
    Optional<NotificationEntity> findOpenSameBook(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("bookId") Long bookId,
            @Param("since") LocalDateTime since
    );

    @Query("""
            SELECT n FROM NotificationEntity n
            WHERE n.userId = :userId
              AND n.type = :type
              AND n.bookId = :bookId
              AND n.createdAt >= :since
            """)
    Optional<NotificationEntity> findRecentWeeklyPick(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("bookId") Long bookId,
            @Param("since") LocalDateTime since
    );

    @Modifying(clearAutomatically = true)
    @Query("UPDATE NotificationEntity n SET n.readAt = :now WHERE n.userId = :userId AND n.readAt IS NULL")
    int markAllRead(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE NotificationEntity n SET n.readAt = :now WHERE n.userId = :userId AND n.id IN :ids AND n.readAt IS NULL")
    int markReadByIds(
            @Param("userId") Long userId,
            @Param("ids") Collection<Long> ids,
            @Param("now") LocalDateTime now
    );
}
