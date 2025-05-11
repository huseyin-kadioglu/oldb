package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<UserActivityEntity, Long> {
    List<UserActivityEntity> findAllByUserId(Long userId);
}
