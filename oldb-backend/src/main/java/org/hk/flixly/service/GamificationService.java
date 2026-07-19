package org.hk.flixly.service;

import org.hk.flixly.model.BadgeProgressDto;
import org.hk.flixly.model.ChallengeProgressDto;
import org.hk.flixly.model.FeaturedBadgeDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BadgeDefinitionEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.ChallengeDefinitionEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserBadgeEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BadgeDefinitionRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.ChallengeDefinitionRepository;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.CommentRepository;
import org.hk.flixly.repository.UserBadgeEntityRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final ChallengeDefinitionRepository challengeDefinitionRepository;
    private final ActivityRepository activityRepository;
    private final UserBookMapRepository bookMapRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final UserBadgeEntityRepository userBadgeRepository;

    public GamificationService(
            BadgeDefinitionRepository badgeDefinitionRepository,
            ChallengeDefinitionRepository challengeDefinitionRepository,
            ActivityRepository activityRepository,
            UserBookMapRepository bookMapRepository,
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            UserRepository userRepository,
            CommentRepository commentRepository,
            UserBadgeEntityRepository userBadgeRepository) {
        this.badgeDefinitionRepository = badgeDefinitionRepository;
        this.challengeDefinitionRepository = challengeDefinitionRepository;
        this.activityRepository = activityRepository;
        this.bookMapRepository = bookMapRepository;
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    /**
     * Metrikleri hesaplar, yeni kazanılan rozetleri sessizce persist eder.
     * Bildirim / toast / modal üretmez.
     */
    @Transactional
    public void evaluateAndPersist(Long userId) {
        if (userId == null) {
            return;
        }
        UserMetrics m = computeMetrics(userId);
        Map<String, LocalDateTime> earned = loadEarnedMap(userId);
        for (BadgeDefinitionEntity def : badgeDefinitionRepository.findAllByOrderByGoalAsc()) {
            int current = metricValue(def.getMetric(), m);
            if (current >= def.getGoal() && !earned.containsKey(def.getCode())) {
                userBadgeRepository.save(UserBadgeEntity.builder()
                        .userId(userId)
                        .badgeCode(def.getCode())
                        .earnedAt(LocalDateTime.now())
                        .build());
            }
        }
        clearInvalidFeatured(userId);
    }

    public List<BadgeProgressDto> getBadgesForUser(Long userId) {
        evaluateAndPersist(userId);
        return buildBadgeList(userId);
    }

    public List<BadgeProgressDto> getBadgesForUsername(String username) {
        UserEntity user = resolveUser(username);
        return getBadgesForUser(user.getId());
    }

    /** Başka kullanıcı profili için: yalnızca kazanılmış rozetler. */
    public List<BadgeProgressDto> getEarnedBadgesForUsername(String username) {
        UserEntity user = resolveUser(username);
        evaluateAndPersist(user.getId());
        return buildBadgeList(user.getId()).stream()
                .filter(BadgeProgressDto::isEarned)
                .toList();
    }

    public FeaturedBadgeDto getFeaturedBadge(Long userId) {
        UserEntity user = userRepository.findById(userId.intValue()).orElse(null);
        if (user == null || user.getFeaturedBadgeCode() == null || user.getFeaturedBadgeCode().isBlank()) {
            return null;
        }
        return toFeaturedDto(userId, user.getFeaturedBadgeCode());
    }

    public FeaturedBadgeDto getFeaturedBadgeForUsername(String username) {
        UserEntity user = resolveUser(username);
        return getFeaturedBadge(user.getId());
    }

    public long countEarned(Long userId) {
        return userBadgeRepository.countByUserId(userId);
    }

    @Transactional
    public FeaturedBadgeDto setFeaturedBadge(Long userId, String badgeCode) {
        if (badgeCode == null || badgeCode.isBlank()) {
            throw new IllegalArgumentException("Rozet kodu gerekli.");
        }
        String code = badgeCode.trim();
        BadgeDefinitionEntity def = badgeDefinitionRepository.findAll().stream()
                .filter(d -> code.equals(d.getCode()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Rozet bulunamadı."));

        evaluateAndPersist(userId);
        if (!userBadgeRepository.existsByUserIdAndBadgeCode(userId, code)) {
            throw new IllegalArgumentException("Yalnızca kazandığın rozetleri sergileyebilirsin.");
        }

        UserEntity user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı."));
        user.setFeaturedBadgeCode(code);
        userRepository.save(user);
        return toFeaturedDto(userId, def);
    }

    @Transactional
    public void clearFeaturedBadge(Long userId) {
        UserEntity user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı."));
        user.setFeaturedBadgeCode(null);
        userRepository.save(user);
    }

    public List<ChallengeProgressDto> getChallengesForUser(Long userId) {
        UserMetrics m = computeMetrics(userId);
        return challengeDefinitionRepository.findByActiveTrueOrderByIdAsc().stream()
                .map(def -> toChallenge(def, m))
                .toList();
    }

    public List<ChallengeProgressDto> getChallengesForUsername(String username) {
        UserEntity user = resolveUser(username);
        return getChallengesForUser(user.getId());
    }

    private List<BadgeProgressDto> buildBadgeList(Long userId) {
        UserMetrics m = computeMetrics(userId);
        Map<String, LocalDateTime> earned = loadEarnedMap(userId);
        UserEntity user = userRepository.findById(userId.intValue()).orElse(null);
        String featured = user != null ? user.getFeaturedBadgeCode() : null;

        return badgeDefinitionRepository.findAllByOrderByGoalAsc().stream()
                .map(def -> toBadge(def, m, earned.get(def.getCode()), featured))
                .toList();
    }

    private Map<String, LocalDateTime> loadEarnedMap(Long userId) {
        Map<String, LocalDateTime> map = new HashMap<>();
        for (UserBadgeEntity row : userBadgeRepository.findByUserId(userId)) {
            map.put(row.getBadgeCode(), row.getEarnedAt());
        }
        return map;
    }

    private void clearInvalidFeatured(Long userId) {
        UserEntity user = userRepository.findById(userId.intValue()).orElse(null);
        if (user == null || user.getFeaturedBadgeCode() == null || user.getFeaturedBadgeCode().isBlank()) {
            return;
        }
        if (!userBadgeRepository.existsByUserIdAndBadgeCode(userId, user.getFeaturedBadgeCode())) {
            user.setFeaturedBadgeCode(null);
            userRepository.save(user);
        }
    }

    private FeaturedBadgeDto toFeaturedDto(Long userId, String code) {
        BadgeDefinitionEntity def = badgeDefinitionRepository.findAll().stream()
                .filter(d -> code.equals(d.getCode()))
                .findFirst()
                .orElse(null);
        if (def == null) {
            return null;
        }
        return toFeaturedDto(userId, def);
    }

    private FeaturedBadgeDto toFeaturedDto(Long userId, BadgeDefinitionEntity def) {
        String earnedAt = userBadgeRepository.findByUserIdAndBadgeCode(userId, def.getCode())
                .map(UserBadgeEntity::getEarnedAt)
                .map(ISO::format)
                .orElse(null);
        return FeaturedBadgeDto.builder()
                .code(def.getCode())
                .title(def.getTitle())
                .description(def.getDescription())
                .icon(def.getIcon())
                .rarity(def.getRarity())
                .earnedAt(earnedAt)
                .build();
    }

    private UserEntity resolveUser(String identifier) {
        return userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + identifier));
    }

    private BadgeProgressDto toBadge(
            BadgeDefinitionEntity def,
            UserMetrics m,
            LocalDateTime earnedAt,
            String featuredCode
    ) {
        int current = metricValue(def.getMetric(), m);
        boolean earned = earnedAt != null || current >= def.getGoal();
        int pct = def.getGoal() <= 0 ? 0 : Math.min(100, (int) Math.round(100.0 * current / def.getGoal()));
        return BadgeProgressDto.builder()
                .id(def.getId())
                .code(def.getCode())
                .title(def.getTitle())
                .description(def.getDescription())
                .rarity(def.getRarity())
                .icon(def.getIcon())
                .tag(def.getTag())
                .goal(def.getGoal())
                .current(current)
                .percent(pct)
                .earned(earned)
                .legendaryTrack(def.isLegendaryTrack())
                .earnedAt(earnedAt != null ? ISO.format(earnedAt) : null)
                .featured(featuredCode != null && featuredCode.equals(def.getCode()))
                .build();
    }

    private ChallengeProgressDto toChallenge(ChallengeDefinitionEntity def, UserMetrics m) {
        int current = metricValue(def.getMetric(), m);
        int pct = def.getGoal() <= 0 ? 0 : Math.min(100, (int) Math.round(100.0 * current / def.getGoal()));
        return ChallengeProgressDto.builder()
                .id(def.getId())
                .code(def.getCode())
                .title(def.getTitle())
                .goal(def.getGoal())
                .progress(current)
                .percent(pct)
                .color(def.getColor())
                .build();
    }

    private int metricValue(String metric, UserMetrics m) {
        return switch (metric) {
            case "BOOKS_READ" -> m.booksRead;
            case "REVIEWS" -> m.reviews;
            case "AUTHORS" -> m.authors;
            case "COUNTRIES" -> m.countries;
            case "LIBRARY" -> m.library;
            case "BOOKS_YEAR" -> m.booksThisYear;
            case "AUTHORS_YEAR" -> m.authorsThisYear;
            case "COUNTRIES_YEAR" -> m.countriesThisYear;
            case "COMMENTS_WRITTEN" -> m.commentsWritten;
            case "COMMENT_LIKES" -> m.commentLikes;
            default -> 0;
        };
    }

    private UserMetrics computeMetrics(Long userId) {
        List<UserBookMapEntity> maps = bookMapRepository.findByUserId(userId);
        List<UserActivityEntity> activities = activityRepository.findAllByUserId(userId);

        Set<Long> readBookIds = maps.stream()
                .filter(m -> BookActivityStatus.READ.equals(m.getStatus())
                        || BookActivityStatus.COMPLETED.equals(m.getStatus()))
                .map(UserBookMapEntity::getBookId)
                .collect(Collectors.toSet());

        int library = (int) maps.stream()
                .filter(m -> BookActivityStatus.LIBRARY.equals(m.getStatus()))
                .count();

        int reviews = (int) activities.stream()
                .filter(a -> a.getComment() != null && !a.getComment().isBlank())
                .count();

        int commentsWritten = (int) commentRepository.countByUserId(userId);
        int commentLikes = (int) commentRepository.sumLikesReceivedByUser(userId);

        Map<Long, BookEntity> books = bookRepository.findAllById(readBookIds).stream()
                .collect(Collectors.toMap(BookEntity::getId, b -> b, (a, b) -> a));

        Set<Long> authorIds = books.values().stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, AuthorEntity> authors = authorRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(AuthorEntity::getId, a -> a, (a, b) -> a));

        Set<String> countries = authors.values().stream()
                .map(AuthorEntity::getCountry)
                .filter(c -> c != null && !c.isBlank())
                .collect(Collectors.toSet());

        int year = LocalDate.now().getYear();
        Set<Long> readThisYear = new HashSet<>();
        for (UserActivityEntity a : activities) {
            if (a.getReadDate() != null
                    && a.getReadDate().getYear() == year
                    && (BookActivityStatus.READ.equals(a.getStatus())
                    || BookActivityStatus.COMPLETED.equals(a.getStatus()))) {
                readThisYear.add(a.getBookId());
            }
        }

        Set<Long> authorsThisYear = new HashSet<>();
        Set<String> countriesThisYear = new HashSet<>();
        for (Long bookId : readThisYear) {
            BookEntity book = books.get(bookId);
            if (book == null) {
                book = bookRepository.findById(bookId).orElse(null);
            }
            if (book == null || book.getAuthorId() == null) continue;
            authorsThisYear.add(book.getAuthorId());
            AuthorEntity author = authors.get(book.getAuthorId());
            if (author == null) {
                author = authorRepository.findById(book.getAuthorId()).orElse(null);
            }
            if (author != null && author.getCountry() != null && !author.getCountry().isBlank()) {
                countriesThisYear.add(author.getCountry());
            }
        }

        return new UserMetrics(
                readBookIds.size(),
                reviews,
                authorIds.size(),
                countries.size(),
                library,
                readThisYear.size(),
                authorsThisYear.size(),
                countriesThisYear.size(),
                commentsWritten,
                commentLikes
        );
    }

    private record UserMetrics(
            int booksRead,
            int reviews,
            int authors,
            int countries,
            int library,
            int booksThisYear,
            int authorsThisYear,
            int countriesThisYear,
            int commentsWritten,
            int commentLikes
    ) {
    }
}
