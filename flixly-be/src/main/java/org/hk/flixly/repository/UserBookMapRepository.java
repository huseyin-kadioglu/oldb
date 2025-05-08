package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserBookMapEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBookMapRepository extends JpaRepository<UserBookMapEntity, Long> {
    List<UserBookMapEntity> findByUserId(Long userId);
}
