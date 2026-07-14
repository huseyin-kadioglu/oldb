package org.hk.flixly.repository;

import org.hk.flixly.model.entity.QuoteEntryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuoteEntryRepository extends JpaRepository<QuoteEntryEntity, Long> {

    List<QuoteEntryEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<QuoteEntryEntity> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
