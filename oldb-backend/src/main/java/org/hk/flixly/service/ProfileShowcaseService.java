package org.hk.flixly.service;

import org.hk.flixly.model.ProfileShowcaseDto;
import org.hk.flixly.model.ShowcaseBookDto;
import org.hk.flixly.model.ShowcaseRequest;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.ProfileShowcaseBookEntity;
import org.hk.flixly.model.entity.ProfileShowcaseEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.model.enums.ShowcaseType;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.ProfileShowcaseBookRepository;
import org.hk.flixly.repository.ProfileShowcaseRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProfileShowcaseService {

    public static final int LIMIT_FREE = 1;
    public static final int LIMIT_PRO = 3;
    public static final int FAV_BOOKS_FREE = 5;
    public static final int FAV_BOOKS_PRO = 5;
    public static final String DEFAULT_FAVORITE_TITLE = "Favori kitaplarım";

    private static final int QUOTE_MAX = 500;
    private static final int TITLE_MAX = 60;
    private static final int DESCRIPTION_MAX = 120;

    private final ProfileShowcaseRepository showcaseRepository;
    private final ProfileShowcaseBookRepository showcaseBookRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final UserBookMapRepository userBookMapRepository;
    private final ActivityRepository activityRepository;

    public ProfileShowcaseService(
            ProfileShowcaseRepository showcaseRepository,
            ProfileShowcaseBookRepository showcaseBookRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            UserBookMapRepository userBookMapRepository,
            ActivityRepository activityRepository) {
        this.showcaseRepository = showcaseRepository;
        this.showcaseBookRepository = showcaseBookRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.userBookMapRepository = userBookMapRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional
    public List<ProfileShowcaseDto> listForUser(Long userId) {
        List<ProfileShowcaseEntity> entities =
                showcaseRepository.findByUserIdOrderByPositionAscIdAsc(userId);
        return toDtos(entities, userId);
    }

    public int showcaseLimitForRole(String role) {
        return UserRole.isProPlan(role) ? LIMIT_PRO : LIMIT_FREE;
    }

    public int favoriteBooksLimitForRole(String role) {
        return UserRole.isProPlan(role) ? FAV_BOOKS_PRO : FAV_BOOKS_FREE;
    }

    @Transactional
    public ProfileShowcaseDto create(ShowcaseRequest request, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        String type = ShowcaseType.normalize(request != null ? request.getType() : null);

        int limit = showcaseLimitForRole(user.getRole());
        long count = showcaseRepository.countByUserId(user.getId());
        if (count >= limit) {
            throw new IllegalArgumentException("Tüm vitrin haklarını kullandın.");
        }
        if (showcaseRepository.existsByUserIdAndType(user.getId(), type)) {
            throw new IllegalArgumentException("Bu vitrin türünden zaten bir tane var.");
        }

        ProfileShowcaseEntity entity = ProfileShowcaseEntity.builder()
                .userId(user.getId())
                .type(type)
                .position((int) count)
                .build();

        if (ShowcaseType.isFavoriteBooks(type)) {
            entity.setTitle(normalizeTitle(request.getTitle(), true));
            entity.setDescription(normalizeDescription(request.getDescription()));
            entity.setQuote(null);
            entity.setBookId(null);
            entity = showcaseRepository.save(entity);
            replaceFavoriteBooks(entity, user, request.getBookIds());
        } else {
            String quote = normalizeQuote(request.getQuote());
            BookEntity book = resolveOptionalBook(request.getBookId());
            if (book != null && showcaseRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
                throw new IllegalArgumentException("Bu kitap zaten bir vitrinde.");
            }
            entity.setQuote(quote);
            entity.setBookId(book != null ? book.getId() : null);
            entity.setTitle(normalizeTitle(request.getTitle(), false));
            entity.setDescription(normalizeDescription(request.getDescription()));
            entity = showcaseRepository.save(entity);
        }
        return toDtos(List.of(entity), user.getId()).get(0);
    }

    @Transactional
    public ProfileShowcaseDto update(Long id, ShowcaseRequest request, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        ProfileShowcaseEntity entity = showcaseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Vitrin bulunamadı"));

        String type = entity.getType() != null ? entity.getType() : ShowcaseType.QUOTE;
        // Type is immutable after create
        if (request.getType() != null
                && !type.equalsIgnoreCase(ShowcaseType.normalize(request.getType()))) {
            throw new IllegalArgumentException("Vitrin türü değiştirilemez.");
        }

        if (ShowcaseType.isFavoriteBooks(type)) {
            if (request.getTitle() != null) {
                entity.setTitle(normalizeTitle(request.getTitle(), true));
            }
            if (request.getDescription() != null) {
                entity.setDescription(normalizeDescription(request.getDescription()));
            }
            entity.setQuote(null);
            entity.setBookId(null);
            entity = showcaseRepository.save(entity);
            if (request.getBookIds() != null) {
                replaceFavoriteBooks(entity, user, request.getBookIds());
            }
        } else {
            if (request.getQuote() != null) {
                entity.setQuote(normalizeQuote(request.getQuote()));
            }
            if (request.getTitle() != null) {
                entity.setTitle(normalizeTitle(request.getTitle(), false));
            }
            if (request.getDescription() != null) {
                entity.setDescription(normalizeDescription(request.getDescription()));
            }
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
                        throw new IllegalArgumentException("Bu kitap zaten bir vitrinde.");
                    }
                    entity.setBookId(book != null ? book.getId() : null);
                }
            }
            entity = showcaseRepository.save(entity);
        }
        return toDtos(List.of(entity), user.getId()).get(0);
    }

    @Transactional
    public void delete(Long id, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        ProfileShowcaseEntity entity = showcaseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Vitrin bulunamadı"));
        showcaseBookRepository.deleteByShowcaseId(entity.getId());
        showcaseRepository.delete(entity);
        reindexPositions(user.getId());
    }

    @Transactional
    public List<ProfileShowcaseDto> reorder(List<Long> ids, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        List<ProfileShowcaseEntity> existing =
                showcaseRepository.findByUserIdOrderByPositionAscIdAsc(user.getId());
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("Geçersiz sıralama");
        }
        if (ids.size() != existing.size()) {
            throw new IllegalArgumentException("Geçersiz sıralama");
        }
        Set<Long> owned = existing.stream().map(ProfileShowcaseEntity::getId).collect(Collectors.toSet());
        if (!owned.equals(new HashSet<>(ids))) {
            throw new IllegalArgumentException("Geçersiz sıralama");
        }
        Map<Long, ProfileShowcaseEntity> byId = existing.stream()
                .collect(Collectors.toMap(ProfileShowcaseEntity::getId, e -> e));
        for (int i = 0; i < ids.size(); i++) {
            ProfileShowcaseEntity e = byId.get(ids.get(i));
            e.setPosition(i);
        }
        showcaseRepository.saveAll(existing);
        return listForUser(user.getId());
    }

    private void replaceFavoriteBooks(ProfileShowcaseEntity entity, UserEntity user, List<Long> bookIds) {
        int maxBooks = favoriteBooksLimitForRole(user.getRole());
        LinkedHashSet<Long> ordered = new LinkedHashSet<>();
        if (bookIds != null) {
            for (Long bookId : bookIds) {
                if (bookId != null) {
                    ordered.add(bookId);
                }
            }
        }
        if (ordered.size() > maxBooks) {
            throw new IllegalArgumentException(
                    "Bu vitrinde en fazla " + maxBooks + " kitap gösterebilirsin.");
        }

        for (Long bookId : ordered) {
            if (!bookRepository.existsById(bookId)) {
                throw new IllegalArgumentException("Kitap bulunamadı");
            }
            ensureFavourite(user.getId(), bookId);
        }

        List<ProfileShowcaseBookEntity> existing =
                showcaseBookRepository.findByShowcaseIdOrderByPositionAscIdAsc(entity.getId());
        Map<Long, ProfileShowcaseBookEntity> byBookId = new HashMap<>();
        for (ProfileShowcaseBookEntity row : existing) {
            byBookId.put(row.getBookId(), row);
        }

        List<ProfileShowcaseBookEntity> toSave = new ArrayList<>();
        int pos = 0;
        for (Long bookId : ordered) {
            ProfileShowcaseBookEntity row = byBookId.remove(bookId);
            if (row == null) {
                row = ProfileShowcaseBookEntity.builder()
                        .showcaseId(entity.getId())
                        .bookId(bookId)
                        .position(pos)
                        .build();
            } else {
                row.setPosition(pos);
            }
            pos++;
            toSave.add(row);
        }

        if (!byBookId.isEmpty()) {
            showcaseBookRepository.deleteAll(byBookId.values());
        }
        if (!toSave.isEmpty()) {
            showcaseBookRepository.saveAll(toSave);
        }
        showcaseBookRepository.flush();
    }

    /** Vitrine seçilen kitabın favori rafta olduğundan emin ol (yoksa ekle). */
    private void ensureFavourite(Long userId, Long bookId) {
        boolean already = userBookMapRepository
                .findByUserIdAndBookIdAndStatus(userId, bookId, BookActivityStatus.FAVOURITE)
                .isPresent();
        if (already) {
            return;
        }

        UserBookMapEntity map = UserBookMapEntity.builder()
                .userId(userId)
                .bookId(bookId)
                .status(BookActivityStatus.FAVOURITE)
                .build();
        userBookMapRepository.save(map);

        boolean hasActivity = activityRepository
                .findByUserIdAndBookIdAndStatus(userId, bookId, BookActivityStatus.FAVOURITE)
                .isPresent();
        if (!hasActivity) {
            UserActivityEntity activity = new UserActivityEntity();
            activity.setUserId(userId);
            activity.setBookId(bookId);
            activity.setStatus(BookActivityStatus.FAVOURITE);
            activity.setUpdateDate(LocalDate.now());
            activityRepository.save(activity);
        }
    }

    private void reindexPositions(Long userId) {
        List<ProfileShowcaseEntity> remaining =
                showcaseRepository.findByUserIdOrderByPositionAscIdAsc(userId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPosition(i);
        }
        showcaseRepository.saveAll(remaining);
    }

    private List<ProfileShowcaseDto> toDtos(List<ProfileShowcaseEntity> entities, Long userId) {
        if (entities.isEmpty()) {
            return List.of();
        }

        Set<Long> favouriteIds = userBookMapRepository.findByUserId(userId).stream()
                .filter(m -> BookActivityStatus.FAVOURITE.equals(m.getStatus()))
                .map(org.hk.flixly.model.entity.UserBookMapEntity::getBookId)
                .collect(Collectors.toSet());

        List<Long> showcaseIds = entities.stream().map(ProfileShowcaseEntity::getId).toList();
        Map<Long, List<ProfileShowcaseBookEntity>> booksByShowcase = new HashMap<>();
        for (ProfileShowcaseBookEntity link :
                showcaseBookRepository.findByShowcaseIdInOrderByPositionAscIdAsc(showcaseIds)) {
            booksByShowcase.computeIfAbsent(link.getShowcaseId(), k -> new ArrayList<>()).add(link);
        }

        // Prune favorited books that were removed from favourites
        for (ProfileShowcaseEntity e : entities) {
            String type = e.getType() != null ? e.getType() : ShowcaseType.QUOTE;
            if (!ShowcaseType.FAVORITE_BOOKS.equals(type)) {
                continue;
            }
            List<ProfileShowcaseBookEntity> links = booksByShowcase.getOrDefault(e.getId(), List.of());
            List<ProfileShowcaseBookEntity> stale = links.stream()
                    .filter(l -> !favouriteIds.contains(l.getBookId()))
                    .toList();
            if (!stale.isEmpty()) {
                showcaseBookRepository.deleteAll(stale);
                List<ProfileShowcaseBookEntity> kept = new ArrayList<>(links);
                kept.removeAll(stale);
                for (int i = 0; i < kept.size(); i++) {
                    kept.get(i).setPosition(i);
                }
                if (!kept.isEmpty()) {
                    showcaseBookRepository.saveAll(kept);
                }
                booksByShowcase.put(e.getId(), kept);
            }
        }

        Set<Long> bookIds = new HashSet<>();
        for (ProfileShowcaseEntity e : entities) {
            if (e.getBookId() != null) {
                bookIds.add(e.getBookId());
            }
            for (ProfileShowcaseBookEntity link : booksByShowcase.getOrDefault(e.getId(), List.of())) {
                bookIds.add(link.getBookId());
            }
        }
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

        List<ProfileShowcaseDto> result = new ArrayList<>();
        for (ProfileShowcaseEntity e : entities) {
            ensureLegacyType(e);
            String type = e.getType() != null ? e.getType() : ShowcaseType.QUOTE;
            if (ShowcaseType.FAVORITE_BOOKS.equals(type)) {
                List<ShowcaseBookDto> showcaseBooks = new ArrayList<>();
                for (ProfileShowcaseBookEntity link : booksByShowcase.getOrDefault(e.getId(), List.of())) {
                    BookEntity book = books.get(link.getBookId());
                    if (book == null) {
                        continue;
                    }
                    String authorName = null;
                    if (book.getAuthorId() != null) {
                        AuthorEntity author = authors.get(book.getAuthorId());
                        if (author != null) {
                            authorName = author.getName();
                        }
                    }
                    showcaseBooks.add(ShowcaseBookDto.builder()
                            .bookId(book.getId())
                            .title(book.getTitle())
                            .authorName(authorName)
                            .coverUrl(book.getCoverUrl())
                            .position(link.getPosition())
                            .build());
                }
                String title = e.getTitle() != null && !e.getTitle().isBlank()
                        ? e.getTitle()
                        : DEFAULT_FAVORITE_TITLE;
                result.add(ProfileShowcaseDto.builder()
                        .id(e.getId())
                        .type(ShowcaseType.FAVORITE_BOOKS)
                        .title(title)
                        .description(e.getDescription())
                        .quote(null)
                        .position(e.getPosition())
                        .books(showcaseBooks)
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .build());
            } else {
                BookEntity book = e.getBookId() != null ? books.get(e.getBookId()) : null;
                String authorName = null;
                if (book != null && book.getAuthorId() != null) {
                    AuthorEntity author = authors.get(book.getAuthorId());
                    if (author != null) {
                        authorName = author.getName();
                    }
                }
                result.add(ProfileShowcaseDto.builder()
                        .id(e.getId())
                        .type(ShowcaseType.QUOTE)
                        .title(e.getTitle())
                        .description(e.getDescription())
                        .bookId(e.getBookId())
                        .bookTitle(book != null ? book.getTitle() : null)
                        .authorName(authorName)
                        .coverUrl(book != null ? book.getCoverUrl() : null)
                        .quote(e.getQuote())
                        .position(e.getPosition())
                        .books(List.of())
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .build());
            }
        }
        return result;
    }

    private void ensureLegacyType(ProfileShowcaseEntity e) {
        if (e.getType() == null || e.getType().isBlank()) {
            e.setType(ShowcaseType.QUOTE);
            showcaseRepository.save(e);
        }
    }

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

    private static String normalizeTitle(String raw, boolean favoriteBooks) {
        if (raw == null) {
            return null;
        }
        String cleaned = sanitizePlainText(raw);
        if (cleaned.length() > TITLE_MAX) {
            throw new IllegalArgumentException("Başlık en fazla " + TITLE_MAX + " karakter olabilir");
        }
        return cleaned.isEmpty() ? null : cleaned;
    }

    private static String normalizeDescription(String raw) {
        if (raw == null) {
            return null;
        }
        String cleaned = sanitizePlainText(raw);
        if (cleaned.length() > DESCRIPTION_MAX) {
            throw new IllegalArgumentException("Açıklama en fazla " + DESCRIPTION_MAX + " karakter olabilir");
        }
        return cleaned.isEmpty() ? null : cleaned;
    }

    private static String sanitizePlainText(String raw) {
        return raw.replaceAll("(?is)<script.*?>.*?</script>", "")
                .replaceAll("(?i)<[^>]*>", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private UserEntity requireUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("Giriş gerekli");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
    }
}
