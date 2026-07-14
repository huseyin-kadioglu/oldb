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
}
