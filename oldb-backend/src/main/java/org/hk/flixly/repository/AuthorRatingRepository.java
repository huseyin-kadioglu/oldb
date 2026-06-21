package org.hk.flixly.repository;

import org.hk.flixly.model.entity.AuthorRatingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AuthorRatingRepository extends JpaRepository<AuthorRatingEntity, Long> {

    Optional<AuthorRatingEntity> findByUserIdAndAuthorId(Long userId, Long authorId);

    @Query("SELECT AVG(ar.rating), COUNT(ar.id) FROM AuthorRatingEntity ar WHERE ar.authorId = :authorId")
    Object[] findRatingStatsByAuthorId(@Param("authorId") Long authorId);
}
