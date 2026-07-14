package org.hk.flixly.repository;

import org.hk.flixly.model.entity.BotmMonthEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BotmMonthRepository extends JpaRepository<BotmMonthEntity, Long> {
    Optional<BotmMonthEntity> findByYearValueAndMonthValue(int yearValue, int monthValue);
}
