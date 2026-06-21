package org.hk.flixly.repository;

import org.hk.flixly.model.entity.BookEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<BookEntity, Long> {
    List<BookEntity> findAllByAuthorId(Long authorId);

    List<BookEntity> findAllByPublicationYear(Integer publishYear);

    BookEntity findByTitleAndPublicationYear(String title, int publicationYear);

    @Query("SELECT b FROM BookEntity b WHERE " +
           "(:nobelOnly = false OR b.isWonNobelPrize = true) AND " +
           "(:yearFrom IS NULL OR b.publicationYear >= :yearFrom) AND " +
           "(:yearTo IS NULL OR b.publicationYear <= :yearTo)")
    List<BookEntity> findFiltered(@Param("nobelOnly") boolean nobelOnly,
                                  @Param("yearFrom") Integer yearFrom,
                                  @Param("yearTo") Integer yearTo);
}
