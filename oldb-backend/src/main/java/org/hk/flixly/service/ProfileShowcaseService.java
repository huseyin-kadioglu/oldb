package org.hk.flixly.service;

import org.hk.flixly.model.ProfileShowcaseDto;
import org.hk.flixly.model.ShowcaseRequest;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.ProfileShowcaseEntity;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.ProfileShowcaseRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProfileShowcaseService {

    public static final int LIMIT_FREE = 1;
    public static final int LIMIT_PRO = 3;
    private static final int QUOTE_MAX = 500;

    private final ProfileShowcaseRepository showcaseRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;

    public ProfileShowcaseService(
            ProfileShowcaseRepository showcaseRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            AuthorRepository authorRepository) {
        this.showcaseRepository = showcaseRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
    }

    public List<ProfileShowcaseDto> listForUser(Long userId) {
        List<ProfileShowcaseEntity> entities =
                showcaseRepository.findByUserIdOrderByPositionAscIdAsc(userId);
        return toDtos(entities);
    }

    public int showcaseLimitForRole(String role) {
        return UserRole.isProPlan(role) ? LIMIT_PRO : LIMIT_FREE;
    }

    @Transactional
    public ProfileShowcaseDto create(ShowcaseRequest request, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        String quote = normalizeQuote(request.getQuote());
        BookEntity book = resolveOptionalBook(request.getBookId());

        int limit = showcaseLimitForRole(user.getRole());
        long count = showcaseRepository.countByUserId(user.getId());
        if (count >= limit) {
            if (limit == LIMIT_FREE) {
                throw new IllegalArgumentException(
                        "Ücretsiz üyelikte 1 alıntı hakkın var. PRO ile 3’e çıkar.");
            }
            throw new IllegalArgumentException("En fazla " + limit + " alıntı ekleyebilirsin.");
        }
        if (book != null && showcaseRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
            throw new IllegalArgumentException("Bu kitap zaten alıntı defterinde.");
        }

        ProfileShowcaseEntity entity = ProfileShowcaseEntity.builder()
                .userId(user.getId())
                .bookId(book != null ? book.getId() : null)
                .quote(quote)
                .position((int) count)
                .build();
        entity = showcaseRepository.save(entity);
        return toDto(entity, book, resolveAuthorName(book));
    }

    @Transactional
    public ProfileShowcaseDto update(Long id, ShowcaseRequest request, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        ProfileShowcaseEntity entity = showcaseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alıntı bulunamadı"));

        if (request.getQuote() != null) {
            entity.setQuote(normalizeQuote(request.getQuote()));
        }

        // Always accept bookId from client: null clears the linked book
        Long requestedBookId = request.getBookId();
        Long currentBookId = entity.getBookId();
        if (!Objects.equals(requestedBookId, currentBookId)) {
            if (requestedBookId == null) {
                entity.setBookId(null);
            } else {
                BookEntity book = resolveOptionalBook(requestedBookId);
                if (book != null
                        && showcaseRepository.existsByUserIdAndBookIdAndIdNot(
                        user.getId(), book.getId(), id)) {
                    throw new IllegalArgumentException("Bu kitap zaten alıntı defterinde.");
                }
                entity.setBookId(book != null ? book.getId() : null);
            }
        }

        entity = showcaseRepository.save(entity);
        BookEntity book = entity.getBookId() != null
                ? bookRepository.findById(entity.getBookId()).orElse(null)
                : null;
        return toDto(entity, book, resolveAuthorName(book));
    }

    @Transactional
    public void delete(Long id, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        ProfileShowcaseEntity entity = showcaseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alıntı bulunamadı"));
        showcaseRepository.delete(entity);
        reindexPositions(user.getId());
    }

    private void reindexPositions(Long userId) {
        List<ProfileShowcaseEntity> remaining =
                showcaseRepository.findByUserIdOrderByPositionAscIdAsc(userId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPosition(i);
        }
        showcaseRepository.saveAll(remaining);
    }

    private List<ProfileShowcaseDto> toDtos(List<ProfileShowcaseEntity> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }
        Set<Long> bookIds = entities.stream()
                .map(ProfileShowcaseEntity::getBookId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, BookEntity> books = bookIds.isEmpty()
                ? Map.of()
                : bookRepository.findAllById(bookIds).stream()
                .collect(Collectors.toMap(BookEntity::getId, b -> b));
        Set<Long> authorIds = books.values().stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, AuthorEntity> authors = authorIds.isEmpty()
                ? Map.of()
                : authorRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(AuthorEntity::getId, a -> a));

        return entities.stream().map(e -> {
            BookEntity book = e.getBookId() != null ? books.get(e.getBookId()) : null;
            String authorName = null;
            if (book != null && book.getAuthorId() != null) {
                AuthorEntity author = authors.get(book.getAuthorId());
                if (author != null) {
                    authorName = author.getName();
                }
            }
            return toDto(e, book, authorName);
        }).toList();
    }

    private ProfileShowcaseDto toDto(ProfileShowcaseEntity e, BookEntity book, String authorName) {
        return ProfileShowcaseDto.builder()
                .id(e.getId())
                .bookId(e.getBookId())
                .bookTitle(book != null ? book.getTitle() : null)
                .authorName(authorName)
                .coverUrl(book != null ? book.getCoverUrl() : null)
                .quote(e.getQuote())
                .position(e.getPosition())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private String resolveAuthorName(BookEntity book) {
        if (book == null || book.getAuthorId() == null) {
            return null;
        }
        return authorRepository.findById(book.getAuthorId())
                .map(AuthorEntity::getName)
                .orElse(null);
    }

    /** Null bookId → quote-only showcase. */
    private BookEntity resolveOptionalBook(Long bookId) {
        if (bookId == null) {
            return null;
        }
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Kitap bulunamadı"));
    }

    private static String normalizeQuote(String raw) {
        String quote = raw == null ? "" : raw.trim();
        if (quote.length() < 2) {
            throw new IllegalArgumentException("Alıntı/anı en az 2 karakter olmalı");
        }
        if (quote.length() > QUOTE_MAX) {
            throw new IllegalArgumentException("Alıntı en fazla " + QUOTE_MAX + " karakter olabilir");
        }
        return quote;
    }

    private UserEntity requireUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("Giriş gerekli");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
    }
}
