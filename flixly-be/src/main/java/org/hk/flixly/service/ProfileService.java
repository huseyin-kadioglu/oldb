package org.hk.flixly.service;

import lombok.AllArgsConstructor;
import org.hk.flixly.controller.UpdateProfileRequest;
import org.hk.flixly.model.ProfileInfoDTO;
import org.hk.flixly.model.ReviewWithBookInfoDto;
import org.hk.flixly.model.UserActivityWithBookDTO;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
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

    public static long daysSinceStartOfYear() {
        LocalDate now = LocalDate.now();
        LocalDate startOfYear = LocalDate.of(now.getYear(), 1, 1);
        return ChronoUnit.DAYS.between(startOfYear, now);
    }

    public ProfileInfoDTO getProfileInfo(UserDetails userDetails) {

        String username = userDetails.getUsername();
        UserEntity userEntity = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));


        ProfileInfoDTO response = new ProfileInfoDTO();
        response.setUsername(username);
        response.setProfileName(userEntity.getProfilName());
        response.setBio(userEntity.getBio());
        response.setLocation(userEntity.getLocation());

        // Kullanıcının kitap etkileşimleri
        List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(userEntity.getId());

        // Etkileşime girilen kitap ID'leri
        List<Long> bookIds = userBookMaps.stream()
                .map(UserBookMapEntity::getBookId)
                .distinct()
                .toList();

        // Kitap ID -> BookEntity
        List<BookEntity> bookEntities = bookRepository.findAllById(bookIds);
        Map<Long, BookEntity> bookIdToEntityMap = bookEntities.stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity()));

        // Tüm authorId'leri toplayalım
        Set<Long> authorIds = bookEntities.stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Author ID -> AuthorEntity map'i
        List<AuthorEntity> authors = authorRepository.findAllById(authorIds);
        Map<Long, AuthorEntity> authorIdToEntityMap = authors.stream()
                .collect(Collectors.toMap(AuthorEntity::getId, Function.identity()));

        // Status -> List<BookEntity> map'i
        Map<String, List<BookEntity>> statusBookListMap = userBookMaps.stream()
                .collect(Collectors.groupingBy(
                        UserBookMapEntity::getStatus,
                        Collectors.mapping(
                                map -> bookIdToEntityMap.get(map.getBookId()),
                                Collectors.toList()
                        )
                ));

        response.setFavoriteBooks(statusBookListMap.getOrDefault("FAVOURITE", Collections.emptyList()));
        response.setReadList(statusBookListMap.getOrDefault("READLIST", Collections.emptyList()));

        // Aktivite listesi
        List<UserActivityEntity> userActivities = activityRepository.findAllByUserId(userEntity.getId());
        List<UserActivityWithBookDTO> recentActivityList = new ArrayList<>();

        for (UserActivityEntity activity : userActivities) {
            BookEntity book = bookIdToEntityMap.get(activity.getBookId());
            if (book == null) continue;

            UserActivityWithBookDTO recentActivity = new UserActivityWithBookDTO();
            recentActivity.setBookId(activity.getBookId());
            recentActivity.setBookTitle(book.getTitle());
            recentActivity.setCoverUrl(book.getCoverUrl());
            recentActivity.setReadDate(activity.getReadDate());
            recentActivity.setUserId(activity.getUserId());
            recentActivity.setRating(activity.getRating());
            recentActivity.setComment(activity.getComment());
            recentActivity.setStatus(activity.getStatus());
            recentActivity.setUpdateDate(activity.getUpdateDate());

            recentActivityList.add(recentActivity);
        }

        response.setRecentActivity(recentActivityList);

        int totalBooksRead = userActivities.size();
        int booksReadThisYear = 0;
        AtomicInteger totalPagesReadThisYear = new AtomicInteger(0);
        LocalDate firstReadDate = null;

        try {
            for (UserActivityEntity activity : userActivities) {
                if (activity.getReadDate() == null) continue;

                if (activity.getReadDate().getYear() == LocalDate.now().getYear()) {
                    booksReadThisYear++;

                    BookEntity book = bookIdToEntityMap.get(activity.getBookId());
                    if (book != null) {
                        totalPagesReadThisYear.addAndGet(book.getPageCount());

                        if (firstReadDate == null || activity.getReadDate().isBefore(firstReadDate)) {
                            firstReadDate = activity.getReadDate();
                        }
                    }
                }
            }

            response.setBookRead(totalBooksRead);
            response.setBookReadThisYear(booksReadThisYear);

            long daysThisYear = daysSinceStartOfYear();
            double averagePagesPerDay = (daysThisYear > 0)
                    ? (double) totalPagesReadThisYear.get() / daysThisYear
                    : 0;

            BigDecimal rounded = new BigDecimal(averagePagesPerDay)
                    .setScale(2, RoundingMode.HALF_UP);
            response.setPagePerDay(rounded.doubleValue());

            // Review'lar
            List<ReviewWithBookInfoDto> reviews = new ArrayList<>();

            for (UserActivityEntity activity : userActivities) {
                if (activity.getReadDate() == null ||
                        activity.getComment() == null ||
                        activity.getComment().isBlank()) {
                    continue;
                }

                BookEntity book = bookIdToEntityMap.get(activity.getBookId());
                if (book == null) continue;

                ReviewWithBookInfoDto review = new ReviewWithBookInfoDto();
                review.setBookId(book.getId());
                review.setTitle(book.getTitle());
                review.setCoverUrl(book.getCoverUrl());
                review.setYear(book.getPublicationYear());
                review.setReadDate(activity.getReadDate());
                review.setComment(activity.getComment());

                // Author adı authorId üzerinden alınıyor
                if (book.getAuthorId() != null) {
                    AuthorEntity author = authorIdToEntityMap.get(book.getAuthorId());
                    review.setAuthorName(author != null ? author.getName() : "Unknown");
                } else {
                    review.setAuthorName("Unknown");
                }

                reviews.add(review);
            }

            response.setReviews(reviews);

        } catch (Exception e) {
            response.setBookRead(0);
            response.setBookReadThisYear(0);
        }

        return response;
    }

    public ProfileInfoDTO getProfileInfo(String userName, UserDetails userDetails) {

        String username = userName;
        UserEntity userEntity = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));


        ProfileInfoDTO response = new ProfileInfoDTO();
        response.setUsername(username);
        response.setProfileName(userEntity.getProfilName());
        response.setBio(userEntity.getBio());
        response.setLocation(userEntity.getLocation());

        // Kullanıcının kitap etkileşimleri
        List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(userEntity.getId());

        // Etkileşime girilen kitap ID'leri
        List<Long> bookIds = userBookMaps.stream()
                .map(UserBookMapEntity::getBookId)
                .distinct()
                .toList();

        // Kitap ID -> BookEntity
        List<BookEntity> bookEntities = bookRepository.findAllById(bookIds);
        Map<Long, BookEntity> bookIdToEntityMap = bookEntities.stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity()));

        // Tüm authorId'leri toplayalım
        Set<Long> authorIds = bookEntities.stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Author ID -> AuthorEntity map'i
        List<AuthorEntity> authors = authorRepository.findAllById(authorIds);
        Map<Long, AuthorEntity> authorIdToEntityMap = authors.stream()
                .collect(Collectors.toMap(AuthorEntity::getId, Function.identity()));

        // Status -> List<BookEntity> map'i
        Map<String, List<BookEntity>> statusBookListMap = userBookMaps.stream()
                .collect(Collectors.groupingBy(
                        UserBookMapEntity::getStatus,
                        Collectors.mapping(
                                map -> bookIdToEntityMap.get(map.getBookId()),
                                Collectors.toList()
                        )
                ));

        response.setFavoriteBooks(statusBookListMap.getOrDefault("FAVOURITE", Collections.emptyList()));
        response.setReadList(statusBookListMap.getOrDefault("READLIST", Collections.emptyList()));

        // Aktivite listesi
        List<UserActivityEntity> userActivities = activityRepository.findAllByUserId(userEntity.getId());
        List<UserActivityWithBookDTO> recentActivityList = new ArrayList<>();

        for (UserActivityEntity activity : userActivities) {
            BookEntity book = bookIdToEntityMap.get(activity.getBookId());
            if (book == null) continue;

            UserActivityWithBookDTO recentActivity = new UserActivityWithBookDTO();
            recentActivity.setBookId(activity.getBookId());
            recentActivity.setBookTitle(book.getTitle());
            recentActivity.setCoverUrl(book.getCoverUrl());
            recentActivity.setReadDate(activity.getReadDate());
            recentActivity.setUserId(activity.getUserId());
            recentActivity.setRating(activity.getRating());
            recentActivity.setComment(activity.getComment());
            recentActivity.setStatus(activity.getStatus());
            recentActivity.setUpdateDate(activity.getUpdateDate());

            recentActivityList.add(recentActivity);
        }

        response.setRecentActivity(recentActivityList);

        int totalBooksRead = userActivities.size();
        int booksReadThisYear = 0;
        AtomicInteger totalPagesReadThisYear = new AtomicInteger(0);
        LocalDate firstReadDate = null;

        try {
            for (UserActivityEntity activity : userActivities) {
                if (activity.getReadDate() == null) continue;

                if (activity.getReadDate().getYear() == LocalDate.now().getYear()) {
                    booksReadThisYear++;

                    BookEntity book = bookIdToEntityMap.get(activity.getBookId());
                    if (book != null) {
                        totalPagesReadThisYear.addAndGet(book.getPageCount());

                        if (firstReadDate == null || activity.getReadDate().isBefore(firstReadDate)) {
                            firstReadDate = activity.getReadDate();
                        }
                    }
                }
            }

            response.setBookRead(totalBooksRead);
            response.setBookReadThisYear(booksReadThisYear);

            long daysThisYear = daysSinceStartOfYear();
            double averagePagesPerDay = (daysThisYear > 0)
                    ? (double) totalPagesReadThisYear.get() / daysThisYear
                    : 0;

            BigDecimal rounded = new BigDecimal(averagePagesPerDay)
                    .setScale(2, RoundingMode.HALF_UP);
            response.setPagePerDay(rounded.doubleValue());

            // Review'lar
            List<ReviewWithBookInfoDto> reviews = new ArrayList<>();

            for (UserActivityEntity activity : userActivities) {
                if (activity.getReadDate() == null ||
                        activity.getComment() == null ||
                        activity.getComment().isBlank()) {
                    continue;
                }

                BookEntity book = bookIdToEntityMap.get(activity.getBookId());
                if (book == null) continue;

                ReviewWithBookInfoDto review = new ReviewWithBookInfoDto();
                review.setBookId(book.getId());
                review.setTitle(book.getTitle());
                review.setCoverUrl(book.getCoverUrl());
                review.setYear(book.getPublicationYear());
                review.setReadDate(activity.getReadDate());
                review.setComment(activity.getComment());

                // Author adı authorId üzerinden alınıyor
                if (book.getAuthorId() != null) {
                    AuthorEntity author = authorIdToEntityMap.get(book.getAuthorId());
                    review.setAuthorName(author != null ? author.getName() : "Unknown");
                } else {
                    review.setAuthorName("Unknown");
                }

                reviews.add(review);
            }

            response.setReviews(reviews);

        } catch (Exception e) {
            response.setBookRead(0);
            response.setBookReadThisYear(0);
        }

        return response;
    }

    public ProfileInfoDTO updateProfileByEmail(String email, UpdateProfileRequest request) {

        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getBio() != null) {
            userEntity.setBio(request.getBio());
        }

        if (request.getLocation() != null) {
            userEntity.setLocation(request.getLocation());
        }

        userRepository.save(userEntity);

        return buildProfileInfo(userEntity);
    }

    private ProfileInfoDTO buildProfileInfo(UserEntity userEntity) {

        ProfileInfoDTO response = new ProfileInfoDTO();
        response.setUsername(userEntity.getUsername());      // profil username
        response.setProfileName(userEntity.getProfilName()); // gösterilen ad
        response.setBio(userEntity.getBio());
        response.setLocation(userEntity.getLocation());

        // 👉 buradan sonrası senin mevcut logic
        // books, reviews, stats vs.

        return response;
    }


}
