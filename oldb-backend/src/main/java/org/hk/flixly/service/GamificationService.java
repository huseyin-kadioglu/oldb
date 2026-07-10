package org.hk.flixly.service;

import org.hk.flixly.model.BadgeProgressDto;
import org.hk.flixly.model.ChallengeProgressDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BadgeDefinitionEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.ChallengeDefinitionEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BadgeDefinitionRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.ChallengeDefinitionRepository;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.CommentRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final ChallengeDefinitionRepository challengeDefinitionRepository;
    private final ActivityRepository activityRepository;
    private final UserBookMapRepository bookMapRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public GamificationService(
            BadgeDefinitionRepository badgeDefinitionRepository,
            ChallengeDefinitionRepository challengeDefinitionRepository,
            ActivityRepository activityRepository,
            UserBookMapRepository bookMapRepository,
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            UserRepository userRepository,
            CommentRepository commentRepository) {
        this.badgeDefinitionRepository = badgeDefinitionRepository;
        this.challengeDefinitionRepository = challengeDefinitionRepository;
        this.activityRepository = activityRepository;
        this.bookMapRepository = bookMapRepository;
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    public List<BadgeProgressDto> getBadgesForUser(Long userId) {
        UserMetrics m = computeMetrics(userId);
        return badgeDefinitionRepository.findAllByOrderByGoalAsc().stream()
                .map(def -> toBadge(def, m))
                .toList();
    }

    public List<BadgeProgressDto> getBadgesForUsername(String username) {
        UserEntity user = resolveUser(username);
        return getBadgesForUser(user.getId());
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

    private UserEntity resolveUser(String identifier) {
        return userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + identifier));
    }

    private BadgeProgressDto toBadge(BadgeDefinitionEntity def, UserMetrics m) {
        int current = metricValue(def.getMetric(), m, false);
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
                .earned(current >= def.getGoal())
                .legendaryTrack(def.isLegendaryTrack())
                .build();
    }

    private ChallengeProgressDto toChallenge(ChallengeDefinitionEntity def, UserMetrics m) {
        int current = metricValue(def.getMetric(), m, true);
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

    private int metricValue(String metric, UserMetrics m, boolean yearScoped) {
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
        // also count READ maps without activity date as not this-year — only dated activities

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
