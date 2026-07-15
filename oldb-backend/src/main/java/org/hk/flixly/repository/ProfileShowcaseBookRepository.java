package org.hk.flixly.repository;

import org.hk.flixly.model.entity.ProfileShowcaseBookEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProfileShowcaseBookRepository extends JpaRepository<ProfileShowcaseBookEntity, Long> {

    List<ProfileShowcaseBookEntity> findByShowcaseIdOrderByPositionAscIdAsc(Long showcaseId);

    List<ProfileShowcaseBookEntity> findByShowcaseIdInOrderByPositionAscIdAsc(Collection<Long> showcaseIds);

    void deleteByShowcaseId(Long showcaseId);
}
