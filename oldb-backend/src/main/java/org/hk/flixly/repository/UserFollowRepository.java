package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserFollowEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserFollowRepository extends JpaRepository<UserFollowEntity, Long> {

    Optional<UserFollowEntity> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    List<UserFollowEntity> findByFollowerIdOrderByCreatedAtDesc(Long followerId);

    List<UserFollowEntity> findByFollowingIdOrderByCreatedAtDesc(Long followingId);

    long countByFollowerId(Long followerId);

    long countByFollowingId(Long followingId);

    @Query("SELECT f.followingId FROM UserFollowEntity f WHERE f.followerId = :followerId")
    List<Long> findFollowingIds(@Param("followerId") Long followerId);
}
