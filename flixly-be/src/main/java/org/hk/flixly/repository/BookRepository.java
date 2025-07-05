package org.hk.flixly.repository;

import org.hk.flixly.model.entity.BookEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<BookEntity, Long> {
    List<BookEntity> findAllByAuthorId(Long authorId);

    List<BookEntity> findAllByPublicationYear(Integer publishYear);

    BookEntity findByTitleAndPublicationYear(String title, int publicationYear);
}
