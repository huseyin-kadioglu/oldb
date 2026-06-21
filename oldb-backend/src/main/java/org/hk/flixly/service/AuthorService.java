package org.hk.flixly.service;

import org.hk.flixly.model.AuthorApprovalDto;
import org.hk.flixly.model.AuthorDto;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.AuthorRatingEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.repository.AuthorRatingRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final BookService bookService;
    private final AuthorRatingRepository authorRatingRepository;

    public AuthorService(AuthorRepository authorRepository, BookService bookService,
                         AuthorRatingRepository authorRatingRepository) {
        this.authorRepository = authorRepository;
        this.bookService = bookService;
        this.authorRatingRepository = authorRatingRepository;
    }

    public AuthorDto findById(Long id) {
        return findById(id, null);
    }

    public AuthorDto findById(Long id, Long userId) {
        AuthorEntity authorEntity = authorRepository.findById(id).orElseThrow();
        List<BookEntity> writtenByAuthor = bookService.getBooksByAuthorId(id);

        AuthorDto authorResponse = new AuthorDto();
        authorResponse.setId(authorEntity.getId());
        authorResponse.setName(authorEntity.getName());
        authorResponse.setBirthYear(authorEntity.getBirthYear());
        authorResponse.setDeathYear(authorEntity.getDeathYear());
        authorResponse.setDescription(authorEntity.getDescription());
        authorResponse.setPortrait(authorEntity.getPortrait());
        authorResponse.setCountry(authorEntity.getCountry());
        authorResponse.setBookWrittenBy(writtenByAuthor);

        // Rating stats
        Object[] ratingStats = authorRatingRepository.findRatingStatsByAuthorId(id);
        if (ratingStats != null && ratingStats[0] != null) {
            double avg = ((Number) ratingStats[0]).doubleValue();
            long count = ((Number) ratingStats[1]).longValue();
            authorResponse.setAverageRating(new BigDecimal(avg).setScale(1, RoundingMode.HALF_UP).doubleValue());
            authorResponse.setRatingCount(count);
        }

        // User's own rating
        if (userId != null) {
            authorRatingRepository.findByUserIdAndAuthorId(userId, id)
                    .ifPresent(r -> authorResponse.setUserRating(r.getRating()));
        }

        return authorResponse;
    }

    public List<AuthorEntity> findAll() {
        return authorRepository.findAll();
    }

    public void rateAuthor(Long authorId, Long userId, double rating) {
        AuthorRatingEntity entity = authorRatingRepository
                .findByUserIdAndAuthorId(userId, authorId)
                .orElse(new AuthorRatingEntity());
        entity.setUserId(userId);
        entity.setAuthorId(authorId);
        entity.setRating(rating);
        authorRatingRepository.save(entity);
    }

    public void createApprovedAuthor(AuthorApprovalDto dto) {
        AuthorEntity authorEntity = new AuthorEntity();
        authorEntity.setName(dto.getName());
        authorEntity.setPortrait(dto.getPortrait());
        authorEntity.setDescription(dto.getDescription());
        authorEntity.setBirthYear(dto.getBirthYear());
        authorEntity.setDeathYear(dto.getDeathYear());
        authorRepository.save(authorEntity);
    }
}
