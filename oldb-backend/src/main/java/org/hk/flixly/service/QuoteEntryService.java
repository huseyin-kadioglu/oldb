package org.hk.flixly.service;

import org.hk.flixly.model.QuoteEntryDto;
import org.hk.flixly.model.QuoteRequest;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.QuoteEntryEntity;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.QuoteEntryRepository;
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
public class QuoteEntryService {

    private static final int BODY_MAX = 800;
    private static final int PAGE_NOTE_MAX = 64;

    private final QuoteEntryRepository quoteRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;

    public QuoteEntryService(
            QuoteEntryRepository quoteRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            AuthorRepository authorRepository) {
        this.quoteRepository = quoteRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
    }

    public List<QuoteEntryDto> listForUser(Long userId) {
        return toDtos(quoteRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    public List<QuoteEntryDto> listForUsername(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
        return listForUser(user.getId());
    }

    @Transactional
    public QuoteEntryDto create(QuoteRequest request, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        String body = normalizeBody(request.getBody());
        String pageNote = normalizePageNote(request.getPageNote());
        BookEntity book = resolveOptionalBook(request.getBookId());

        QuoteEntryEntity entity = QuoteEntryEntity.builder()
                .userId(user.getId())
                .bookId(book != null ? book.getId() : null)
                .body(body)
                .pageNote(pageNote)
                .build();
        entity = quoteRepository.save(entity);
        return toDto(entity, book, resolveAuthorName(book));
    }

    @Transactional
    public QuoteEntryDto update(Long id, QuoteRequest request, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        QuoteEntryEntity entity = quoteRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alıntı bulunamadı"));

        if (request.getBody() != null) {
            entity.setBody(normalizeBody(request.getBody()));
        }
        if (request.getPageNote() != null) {
            entity.setPageNote(normalizePageNote(request.getPageNote()));
        }
        // Always accept bookId from client (null clears)
        Long requested = request.getBookId();
        if (!Objects.equals(requested, entity.getBookId())) {
            BookEntity book = resolveOptionalBook(requested);
            entity.setBookId(book != null ? book.getId() : null);
        }

        entity = quoteRepository.save(entity);
        BookEntity book = entity.getBookId() != null
                ? bookRepository.findById(entity.getBookId()).orElse(null)
                : null;
        return toDto(entity, book, resolveAuthorName(book));
    }

    @Transactional
    public void delete(Long id, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        QuoteEntryEntity entity = quoteRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alıntı bulunamadı"));
        quoteRepository.delete(entity);
    }

    private List<QuoteEntryDto> toDtos(List<QuoteEntryEntity> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }
        Set<Long> bookIds = entities.stream()
                .map(QuoteEntryEntity::getBookId)
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
                AuthorEntity a = authors.get(book.getAuthorId());
                if (a != null) {
                    authorName = a.getName();
                }
            }
            return toDto(e, book, authorName);
        }).toList();
    }

    private QuoteEntryDto toDto(QuoteEntryEntity e, BookEntity book, String authorName) {
        return QuoteEntryDto.builder()
                .id(e.getId())
                .bookId(e.getBookId())
                .bookTitle(book != null ? book.getTitle() : null)
                .authorName(authorName)
                .coverUrl(book != null ? book.getCoverUrl() : null)
                .body(e.getBody())
                .pageNote(e.getPageNote())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private String resolveAuthorName(BookEntity book) {
        if (book == null || book.getAuthorId() == null) {
            return null;
        }
        return authorRepository.findById(book.getAuthorId()).map(AuthorEntity::getName).orElse(null);
    }

    private BookEntity resolveOptionalBook(Long bookId) {
        if (bookId == null) {
            return null;
        }
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Kitap bulunamadı"));
    }

    private static String normalizeBody(String raw) {
        String body = raw == null ? "" : raw.trim();
        if (body.length() < 2) {
            throw new IllegalArgumentException("Alıntı en az 2 karakter olmalı");
        }
        if (body.length() > BODY_MAX) {
            throw new IllegalArgumentException("Alıntı en fazla " + BODY_MAX + " karakter olabilir");
        }
        return body;
    }

    private static String normalizePageNote(String raw) {
        if (raw == null) {
            return null;
        }
        String note = raw.trim();
        if (note.isEmpty()) {
            return null;
        }
        if (note.length() > PAGE_NOTE_MAX) {
            throw new IllegalArgumentException("Sayfa notu çok uzun");
        }
        return note;
    }

    private UserEntity requireUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("Giriş gerekli");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
    }
}
