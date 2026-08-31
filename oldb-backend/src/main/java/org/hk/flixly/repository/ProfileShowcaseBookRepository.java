package org.hk.flixly.repository;

import org.hk.flixly.model.entity.ProfileShowcaseBookEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

public interface ProfileShowcaseBookRepository extends JpaRepository<ProfileShowcaseBookEntity, Long> {

    List<ProfileShowcaseBookEntity> findByShowcaseIdOrderByPositionAscIdAsc(Long showcaseId);

    List<ProfileShowcaseBookEntity> findByShowcaseIdInOrderByPositionAscIdAsc(Collection<Long> showcaseIds);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    void deleteByShowcaseId(Long showcaseId);
}
