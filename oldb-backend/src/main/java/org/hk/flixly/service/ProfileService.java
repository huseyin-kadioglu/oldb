package org.hk.flixly.service;

import lombok.AllArgsConstructor;
import org.hk.flixly.controller.UpdateProfileRequest;
import org.hk.flixly.model.*;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.repository.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProfileService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final UserRepository userRepository;
    private final UserBookMapRepository bookMapRepository;
    private final ActivityRepository activityRepository;
    private final PasswordEncoder passwordEncoder;
    private final GamificationService gamificationService;
    private final GenrePreferenceService genrePreferenceService;
    private final AvatarStorageService avatarStorageService;
    private final DailyReadCheckinService dailyReadCheckinService;
    private final ProfileShowcaseService profileShowcaseService;

    public ProfileInfoDTO getProfileInfo(UserDetails userDetails) {
        UserEntity user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return buildProfileInfo(user);
    }

    public ProfileInfoDTO getProfileInfo(String identifier, UserDetails userDetails) {
        UserEntity user = resolveUser(identifier);
        return buildProfileInfo(user);
    }

    private UserEntity resolveUser(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Kullanıcı bulunamadı");
        }
        return userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + identifier));
    }

    private ProfileInfoDTO buildProfileInfo(UserEntity userEntity) {
        ProfileInfoDTO response = new ProfileInfoDTO();
        response.setUsername(userEntity.getProfilName());
        response.setProfileName(userEntity.getProfilName());
        response.setEmail(userEntity.getEmail());
        response.setBio(userEntity.getBio());
        response.setLocation(userEntity.getLocation());
        response.setContributionPoint(userEntity.getContributionPoint());
        String role = userEntity.getRole() != null ? userEntity.getRole() : UserRole.USER.name();
        response.setRole(role);
        response.setScoreBypass(UserRole.bypassesContributionGates(role));
        response.setAvatarUrl(userEntity.getAvatarUrl());
        response.setPendingAvatarUrl(userEntity.getPendingAvatarUrl());
        // Avatar kimlik özelliği — herkes yükleyebilir; admin onayı gerekir
        response.setCanUploadAvatar(true);
        response.setYearlyBookGoal(userEntity.getYearlyBookGoal());
        response.setShowcases(profileShowcaseService.listForUser(userEntity.getId()));
        response.setShowcaseLimit(profileShowcaseService.showcaseLimitForRole(role));

        List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(userEntity.getId());

        List<Long> bookIds = userBookMaps.stream()
                .map(UserBookMapEntity::getBookId)
                .distinct()
                .toList();

        List<BookEntity> bookEntities = bookRepository.findAllById(bookIds);
        Map<Long, BookEntity> bookIdToEntityMap = bookEntities.stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity()));

        Set<Long> authorIds = bookEntities.stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, AuthorEntity> authorIdToEntityMap = authorRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(AuthorEntity::getId, Function.identity()));

        Map<String, List<BookEntity>> statusBookListMap = userBookMaps.stream()
                .collect(Collectors.groupingBy(
                        UserBookMapEntity::getStatus,
                        Collectors.mapping(
                                map -> bookIdToEntityMap.get(map.getBookId()),
                                Collectors.filtering(Objects::nonNull, Collectors.toList())
                        )
                ));

        response.setFavoriteBooks(statusBookListMap.getOrDefault(BookActivityStatus.FAVOURITE, Collections.emptyList()));
        response.setReadList(statusBookListMap.getOrDefault(BookActivityStatus.READLIST, Collections.emptyList()));
        List<BookEntity> readBooks = mergeReadLists(statusBookListMap);
        response.setReadBooks(readBooks);
        response.setCompletedBooks(readBooks);
        response.setLibraryBooks(statusBookListMap.getOrDefault(BookActivityStatus.LIBRARY, Collections.emptyList()));
        response.setShoppingBooks(statusBookListMap.getOrDefault(BookActivityStatus.SHOPPING, Collections.emptyList()));
        response.setDroppedBooks(statusBookListMap.getOrDefault(BookActivityStatus.DROPPED, Collections.emptyList()));

        List<UserActivityEntity> userActivities = activityRepository.findAllByUserId(userEntity.getId());
        response.setRecentActivity(buildRecentActivities(userActivities, bookIdToEntityMap, authorIdToEntityMap));
        response.setReviews(buildReviews(userActivities, bookIdToEntityMap, authorIdToEntityMap));
        applyReadingStats(response, userActivities, bookIdToEntityMap, readBooks.size());
        response.setAverageRating(computeAverageRating(userActivities));
        response.setReadingStreak(dailyReadCheckinService.streakForUser(userEntity.getId()));
        response.setMostFrequentRating(computeMostFrequentRating(userActivities));

        response.setContinueReading(buildContinueReading(userBookMaps, bookIdToEntityMap, authorIdToEntityMap, userActivities));
        try {
            response.setChallenges(gamificationService.getChallengesForUser(userEntity.getId()));
            gamificationService.evaluateAndPersist(userEntity.getId());
            response.setEarnedBadgeCount((int) gamificationService.countEarned(userEntity.getId()));
            response.setFeaturedBadge(gamificationService.getFeaturedBadge(userEntity.getId()));
            response.setEarnedBadges(Collections.emptyList());
        } catch (Exception ignored) {
            response.setChallenges(Collections.emptyList());
            response.setEarnedBadges(Collections.emptyList());
            response.setEarnedBadgeCount(0);
            response.setFeaturedBadge(null);
        }
        try {
            response.setGenrePreferences(genrePreferenceService.forUserId(userEntity.getId()));
        } catch (Exception ignored) {
            response.setGenrePreferences(Collections.emptyList());
        }

        // null-safe lists for FE
        if (response.getFavoriteBooks() == null) response.setFavoriteBooks(Collections.emptyList());
        if (response.getReadList() == null) response.setReadList(Collections.emptyList());
        if (response.getReadBooks() == null) response.setReadBooks(Collections.emptyList());
        if (response.getLibraryBooks() == null) response.setLibraryBooks(Collections.emptyList());
        if (response.getShoppingBooks() == null) response.setShoppingBooks(Collections.emptyList());
        if (response.getDroppedBooks() == null) response.setDroppedBooks(Collections.emptyList());
        if (response.getContinueReading() == null) response.setContinueReading(Collections.emptyList());
        if (response.getRecentActivity() == null) response.setRecentActivity(Collections.emptyList());
        if (response.getReviews() == null) response.setReviews(Collections.emptyList());

        return response;
    }

    private List<ContinueReadingDto> buildContinueReading(
            List<UserBookMapEntity> maps,
            Map<Long, BookEntity> books,
            Map<Long, AuthorEntity> authors,
            List<UserActivityEntity> activities) {
        Map<Long, LocalDate> lastActivityByBook = new HashMap<>();
        for (UserActivityEntity activity : activities) {
            if (activity.getBookId() == null) continue;
            LocalDate touch = activity.getUpdateDate() != null ? activity.getUpdateDate() : activity.getReadDate();
            if (touch == null) continue;
            LocalDate existing = lastActivityByBook.get(activity.getBookId());
            if (existing == null || touch.isAfter(existing)) {
                lastActivityByBook.put(activity.getBookId(), touch);
            }
        }

        List<UserBookMapEntity> readlist = maps.stream()
                .filter(m -> BookActivityStatus.READLIST.equals(m.getStatus()))
                .sorted(Comparator.comparing(
                        (UserBookMapEntity m) -> m.getCurrentPage() != null && m.getCurrentPage() > 0 ? 0 : 1)
                        .thenComparing(m -> Optional.ofNullable(m.getCurrentPage()).orElse(0), Comparator.reverseOrder()))
                .toList();

        List<ContinueReadingDto> result = new ArrayList<>();
        for (UserBookMapEntity m : readlist) {
            if (result.size() >= 5) break;
            BookEntity book = books.get(m.getBookId());
            if (book == null) continue;
            AuthorEntity author = book.getAuthorId() != null ? authors.get(book.getAuthorId()) : null;
            Integer total = book.getPageCount();
            Integer current = m.getCurrentPage();
            Integer pct = (total != null && total > 0 && current != null && current > 0)
                    ? Math.min(100, (int) Math.round(100.0 * current / total))
                    : null;
            java.time.LocalDateTime lastUpdated = m.getUpdatedAt();
            if (lastUpdated == null) {
                LocalDate fallback = lastActivityByBook.get(m.getBookId());
                if (fallback != null) {
                    lastUpdated = fallback.atStartOfDay();
                }
            }
            result.add(ContinueReadingDto.builder()
                    .id(book.getId())
                    .title(book.getTitle())
                    .coverUrl(book.getCoverUrl())
                    .authorId(book.getAuthorId())
                    .authorName(author != null ? author.getName() : null)
                    .pageCount(total)
                    .currentPage(current)
                    .progressPercent(pct)
                    .lastUpdated(lastUpdated)
                    .build());
        }
        return result;
    }

    private static List<BookEntity> mergeReadLists(Map<String, List<BookEntity>> statusBookListMap) {
        List<BookEntity> read = new ArrayList<>(statusBookListMap.getOrDefault(BookActivityStatus.READ, Collections.emptyList()));
        for (BookEntity book : statusBookListMap.getOrDefault(BookActivityStatus.COMPLETED, Collections.emptyList())) {
            if (read.stream().noneMatch(b -> b.getId().equals(book.getId()))) {
                read.add(book);
            }
        }
        return read;
    }

    private List<UserActivityWithBookDTO> buildRecentActivities(
            List<UserActivityEntity> activities,
            Map<Long, BookEntity> bookMap,
            Map<Long, AuthorEntity> authorMap) {

        return activities.stream()
                .sorted(Comparator.comparing(
                        UserActivityEntity::getUpdateDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(activity -> {
                    BookEntity book = bookMap.get(activity.getBookId());
                    if (book == null) return null;

                    UserActivityWithBookDTO dto = new UserActivityWithBookDTO();
                    dto.setBookId(activity.getBookId());
                    dto.setBookTitle(book.getTitle());
                    dto.setCoverUrl(book.getCoverUrl());
                    dto.setReadDate(activity.getReadDate());
                    dto.setUserId(activity.getUserId());
                    dto.setRating(activity.getRating());
                    dto.setComment(activity.getComment());
                    dto.setStatus(activity.getStatus());
                    dto.setUpdateDate(activity.getUpdateDate());

                    if (book.getAuthorId() != null) {
                        AuthorEntity author = authorMap.get(book.getAuthorId());
                        dto.setAuthorName(author != null ? author.getName() : null);
                    }
                    return dto;
                })
                .filter(Objects::nonNull)
                .toList();
    }

    private List<ReviewWithBookInfoDto> buildReviews(
            List<UserActivityEntity> activities,
            Map<Long, BookEntity> bookMap,
            Map<Long, AuthorEntity> authorMap) {

        List<ReviewWithBookInfoDto> reviews = new ArrayList<>();
        for (UserActivityEntity activity : activities) {
            if (activity.getReadDate() == null
                    || activity.getComment() == null
                    || activity.getComment().isBlank()) {
                continue;
            }
            BookEntity book = bookMap.get(activity.getBookId());
            if (book == null) continue;

            ReviewWithBookInfoDto review = new ReviewWithBookInfoDto();
            review.setBookId(book.getId());
            review.setTitle(book.getTitle());
            review.setCoverUrl(book.getCoverUrl());
            review.setYear(book.getPublicationYear());
            review.setReadDate(activity.getReadDate());
            review.setComment(activity.getComment());
            review.setRating(activity.getRating());

            if (book.getAuthorId() != null) {
                AuthorEntity author = authorMap.get(book.getAuthorId());
                review.setAuthorName(author != null ? author.getName() : "Bilinmeyen");
            } else {
                review.setAuthorName("Bilinmeyen");
            }
            reviews.add(review);
        }
        return reviews;
    }

    private void applyReadingStats(
            ProfileInfoDTO response,
            List<UserActivityEntity> activities,
            Map<Long, BookEntity> bookMap,
            int totalBooksRead) {

        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();

        Map<Long, UserActivityEntity> latestReadByBook = new LinkedHashMap<>();
        for (UserActivityEntity activity : activities) {
            if (!isReadStatus(activity.getStatus()) || activity.getReadDate() == null) {
                continue;
            }
            UserActivityEntity existing = latestReadByBook.get(activity.getBookId());
            if (existing == null || activity.getReadDate().isAfter(existing.getReadDate())) {
                latestReadByBook.put(activity.getBookId(), activity);
            }
        }

        int pagesAll = 0;
        int pagesThisYear = 0;
        int pagesThisMonth = 0;
        int booksThisYear = 0;
        int booksThisMonth = 0;
        LocalDate firstReadThisYear = null;

        for (UserActivityEntity activity : latestReadByBook.values()) {
            BookEntity book = bookMap.get(activity.getBookId());
            int pages = book != null && book.getPageCount() != null ? book.getPageCount() : 0;
            LocalDate readDate = activity.getReadDate();

            pagesAll += pages;

            if (readDate.getYear() == currentYear) {
                booksThisYear++;
                pagesThisYear += pages;
                if (firstReadThisYear == null || readDate.isBefore(firstReadThisYear)) {
                    firstReadThisYear = readDate;
                }
            }
            if (readDate.getYear() == currentYear && readDate.getMonthValue() == currentMonth) {
                booksThisMonth++;
                pagesThisMonth += pages;
            }
        }

        response.setBookRead(totalBooksRead);
        response.setBookReadThisYear(booksThisYear);
        response.setBookReadThisMonth(booksThisMonth);
        response.setTotalPagesRead(pagesAll);
        response.setTotalPagesReadThisYear(pagesThisYear);
        response.setTotalPagesReadThisMonth(pagesThisMonth);

        long daysThisYear = ChronoUnit.DAYS.between(LocalDate.of(currentYear, 1, 1), now) + 1;
        if (firstReadThisYear != null) {
            long daysSinceFirstRead = ChronoUnit.DAYS.between(firstReadThisYear, now) + 1;
            daysThisYear = Math.max(daysSinceFirstRead, 1);
        }

        long daysThisMonth = now.getDayOfMonth();

        response.setPagePerDay(round(pagesThisYear / (double) Math.max(daysThisYear, 1)));
        response.setPagePerDayThisMonth(round(pagesThisMonth / (double) Math.max(daysThisMonth, 1)));
    }

    private static boolean isReadStatus(String status) {
        return BookActivityStatus.READ.equals(status) || BookActivityStatus.COMPLETED.equals(status);
    }

    private static Double computeMostFrequentRating(List<UserActivityEntity> activities) {
        Map<Double, Integer> counts = new HashMap<>();
        for (UserActivityEntity activity : activities) {
            if (activity.getRating() <= 0) continue;
            double rounded = Math.round(activity.getRating() * 2) / 2.0;
            counts.merge(rounded, 1, Integer::sum);
        }
        if (counts.isEmpty()) return null;
        return counts.entrySet().stream()
                .max(Comparator
                        .<Map.Entry<Double, Integer>>comparingInt(Map.Entry::getValue)
                        .thenComparingDouble(Map.Entry::getKey))
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    private static Double computeAverageRating(List<UserActivityEntity> activities) {
        Map<Long, Double> latestRatingByBook = new HashMap<>();
        for (UserActivityEntity activity : activities) {
            if (activity.getBookId() == null || activity.getRating() <= 0) {
                continue;
            }
            latestRatingByBook.put(activity.getBookId(), activity.getRating());
        }
        if (latestRatingByBook.isEmpty()) {
            return null;
        }
        double sum = latestRatingByBook.values().stream().mapToDouble(Double::doubleValue).sum();
        return round(sum / latestRatingByBook.size());
    }

    /**
     * Bugün (veya dün) biten ardışık günlerde aktivite/okuma varsa streak sayar.
     */
    private static int computeReadingStreak(List<UserActivityEntity> activities) {
        Set<LocalDate> activeDays = new HashSet<>();
        for (UserActivityEntity activity : activities) {
            if (activity.getReadDate() != null) {
                activeDays.add(activity.getReadDate());
            }
            if (activity.getUpdateDate() != null) {
                activeDays.add(activity.getUpdateDate());
            }
        }
        if (activeDays.isEmpty()) {
            return 0;
        }

        LocalDate cursor = LocalDate.now();
        if (!activeDays.contains(cursor)) {
            cursor = cursor.minusDays(1);
            if (!activeDays.contains(cursor)) {
                return 0;
            }
        }

        int streak = 0;
        while (activeDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private static double round(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    public ProfileInfoDTO updateProfileByEmail(String email, UpdateProfileRequest request) {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (request.getBio() != null) {
            userEntity.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            userEntity.setLocation(request.getLocation());
        }
        if (request.getYearlyBookGoal() != null) {
            int goal = request.getYearlyBookGoal();
            if (goal < 0) {
                throw new IllegalArgumentException("Yıllık hedef negatif olamaz");
            }
            userEntity.setYearlyBookGoal(goal == 0 ? null : goal);
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            throw new IllegalArgumentException(
                    "Profil fotoğrafı için dosya yükleme kullanın (URL / base64 desteklenmiyor)");
        }

        userRepository.save(userEntity);
        return buildProfileInfo(userEntity);
    }

    public ProfileInfoDTO uploadAvatar(String email, MultipartFile file) throws IOException {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        String storedPath = avatarStorageService.store(userEntity.getId(), file);
        // Herkes yükler; görünür olması için admin onayı gerekir
        userEntity.setPendingAvatarUrl(storedPath);
        userRepository.save(userEntity);
        return buildProfileInfo(userEntity);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mevcut şifre hatalı");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<BookEntity> getBookListByStatus(String identifier, String status) {
        UserEntity userEntity = resolveUser(identifier);

        List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(userEntity.getId());

        String normalized = status.toUpperCase();
        if ("COMPLETED".equals(normalized)) {
            normalized = BookActivityStatus.READ;
        }
        if ("FAVORITES".equals(normalized)) {
            normalized = BookActivityStatus.FAVOURITE;
        }

        final String filterStatus = normalized;
        List<Long> bookIds = userBookMaps.stream()
                .filter(ub -> filterStatus.equalsIgnoreCase(ub.getStatus())
                        || (BookActivityStatus.READ.equals(filterStatus)
                        && BookActivityStatus.COMPLETED.equalsIgnoreCase(ub.getStatus())))
                .map(UserBookMapEntity::getBookId)
                .distinct()
                .toList();

        return bookRepository.findAllById(bookIds);
    }
}
