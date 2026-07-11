package org.hk.flixly.repository;

import org.hk.flixly.model.entity.UserDailyReadCheckinEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserDailyReadCheckinRepository extends JpaRepository<UserDailyReadCheckinEntity, Long> {

    Optional<UserDailyReadCheckinEntity> findByUserIdAndCheckinDate(Long userId, LocalDate checkinDate);

    boolean existsByUserIdAndCheckinDate(Long userId, LocalDate checkinDate);

    List<UserDailyReadCheckinEntity> findByUserIdAndCheckinDateGreaterThanEqualOrderByCheckinDateDesc(
            Long userId, LocalDate fromDate);

    List<UserDailyReadCheckinEntity> findByUserIdOrderByCheckinDateDesc(Long userId);
}
