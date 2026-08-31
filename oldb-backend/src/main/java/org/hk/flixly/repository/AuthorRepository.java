package org.hk.flixly.repository;

import org.hk.flixly.model.entity.AuthorEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthorRepository extends JpaRepository<AuthorEntity, Long> {

    Optional<AuthorEntity> findByName(String name);

    Optional<AuthorEntity> findByOpenLibraryKey(String openLibraryKey);

    Optional<AuthorEntity> findFirstByNobelYear(Integer nobelYear);
}
