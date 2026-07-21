package org.hk.flixly.repository;

import org.hk.flixly.model.entity.BookEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface BookRepository extends JpaRepository<BookEntity, Long> {
    List<BookEntity> findAllByAuthorId(Long authorId);

    List<BookEntity> findAllByPublicationYear(Integer publishYear);

    BookEntity findByTitleAndPublicationYear(String title, int publicationYear);

    BookEntity findByOpenLibraryKey(String openLibraryKey);

    java.util.Optional<BookEntity> findFirstByIsbn(String isbn);

    long countByOpenLibraryKeyIsNotNull();

    @Query(value = """
            SELECT * FROM books
            WHERE isbn IS NOT NULL AND regexp_replace(isbn, '[^0-9Xx]', '', 'g') = :digits
            AND (:excludeId IS NULL OR id <> :excludeId)
            LIMIT 10
            """, nativeQuery = true)
    List<BookEntity> findByNormalizedIsbn(@Param("digits") String digits, @Param("excludeId") Long excludeId);

    @Query(value = """
            SELECT * FROM books
            WHERE author_id = :authorId
              AND lower(trim(both from title)) = lower(trim(both from :title))
              AND (:excludeId IS NULL OR id <> :excludeId)
            LIMIT 10
            """, nativeQuery = true)
    List<BookEntity> findByAuthorAndTitleIgnoreCase(
            @Param("authorId") Long authorId,
            @Param("title") String title,
            @Param("excludeId") Long excludeId);

    @Query(value = """
            SELECT * FROM books
            WHERE author_id = :authorId
              AND original_title IS NOT NULL
              AND lower(trim(both from original_title)) = lower(trim(both from :originalTitle))
              AND (:excludeId IS NULL OR id <> :excludeId)
            LIMIT 10
            """, nativeQuery = true)
    List<BookEntity> findByAuthorAndOriginalTitleIgnoreCase(
            @Param("authorId") Long authorId,
            @Param("originalTitle") String originalTitle,
            @Param("excludeId") Long excludeId);

    @Modifying
    @Transactional
    @Query("UPDATE BookEntity b SET b.weeklyPick = false WHERE b.weeklyPick = true AND (:keepId IS NULL OR b.id <> :keepId)")
    int clearWeeklyPicksExcept(@Param("keepId") Long keepId);

    @Query("SELECT b FROM BookEntity b WHERE b.weeklyPick = true")
    List<BookEntity> findAllWeeklyPicks();

    @Query("SELECT b FROM BookEntity b, AuthorEntity a WHERE b.authorId = a.id AND " +
           "(:nobelOnly = false OR a.wonNobelPrize = true) AND " +
           "(:yearFrom IS NULL OR b.publicationYear >= :yearFrom) AND " +
           "(:yearTo IS NULL OR b.publicationYear <= :yearTo)")
    List<BookEntity> findFiltered(@Param("nobelOnly") boolean nobelOnly,
                                  @Param("yearFrom") Integer yearFrom,
                                  @Param("yearTo") Integer yearTo);

    @Query(value = """
            SELECT * FROM books
            WHERE weekly_pick = true
            ORDER BY id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<BookEntity> findWeeklyPicks(@Param("limit") int limit);

    @Query(value = """
            SELECT * FROM books
            WHERE editor_choice = true
            ORDER BY id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<BookEntity> findEditorChoices(@Param("limit") int limit);

    @Query(value = """
            SELECT * FROM books
            WHERE new_release = true
            ORDER BY publication_year DESC, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<BookEntity> findNewReleases(@Param("limit") int limit);

    @Query(value = """
            SELECT * FROM books
            WHERE author_id = :authorId
            ORDER BY publication_year DESC NULLS LAST, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<BookEntity> findRecentByAuthorId(@Param("authorId") Long authorId, @Param("limit") int limit);

    @Query(value = """
            SELECT * FROM books
            WHERE genres IS NOT NULL
              AND lower(genres) LIKE lower(concat('%', :genre, '%'))
            ORDER BY publication_year DESC NULLS LAST, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<BookEntity> findByGenreContaining(@Param("genre") String genre, @Param("limit") int limit);
}
