package org.hk.flixly.service;

import org.hk.flixly.model.ProfileInfoDTO;
import org.hk.flixly.model.ReviewWithBookInfoDto;
import org.hk.flixly.model.UserActivityWithBookDTO;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.repository.ActivityRepository;
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
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final UserBookMapRepository bookMapRepository;
    private final ActivityRepository activityRepository;

    public ProfileService(BookRepository bookRepository, UserRepository userRepository, UserBookMapRepository bookMapRepository, ActivityRepository activityRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.bookMapRepository = bookMapRepository;
        this.activityRepository = activityRepository;
    }

    public static long daysSinceStartOfYear() {
        LocalDate now = LocalDate.now();
        LocalDate startOfYear = LocalDate.of(now.getYear(), 1, 1);
        return ChronoUnit.DAYS.between(startOfYear, now);
    }

    public ProfileInfoDTO getProfileInfo(UserDetails userDetails) {

        String username = userDetails.getUsername();
        UserEntity userEntity = userRepository.findByEmail(username).orElseThrow();

        ProfileInfoDTO response = new ProfileInfoDTO();
        response.setUsername(username);

        // favourite books
        List<UserBookMapEntity> userBookMaps = bookMapRepository.findByUserId(userEntity.getId());

        // Kullanıcının etkileşime girdiği tüm kitapların id'leri.
        List<Long> bookIds = userBookMaps.stream()
                .map(UserBookMapEntity::getBookId)
                .distinct()
                .toList();

        // Kullanıcının etkileşime girdiği tüm kitapların bilgileri.
        List<BookEntity> bookEntities = bookRepository.findAllById(bookIds);

        // kitap id'leri ile kitapların bilgilerini çekebileceğim map.
        Map<Long, BookEntity> bookIdToEntityMap = bookEntities.stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity()));

        // status bilgisiyle tüm kitap listesini çekebileceğim map.
        Map<String, List<BookEntity>> statusBookListMap = userBookMaps.stream()
                .collect(Collectors.groupingBy(
                        UserBookMapEntity::getStatus,
                        Collectors.mapping(
                                map -> bookIdToEntityMap.get(map.getBookId()),
                                Collectors.toList()
                        )
                ));

        List<BookEntity> favouriteBooks = statusBookListMap.get("FAVOURITE");
        response.setFavoriteBooks(favouriteBooks);

        List<BookEntity> readList = statusBookListMap.getOrDefault("READLIST", Collections.emptyList());
        response.setReadList(readList);

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

        Integer booksReadThisYear = 0;
        AtomicInteger totalPagesReadThisYear = new AtomicInteger(0);

        LocalDate firstReadDate = null;

        try {
            for (UserActivityEntity activity : userActivities) {
                if (activity.getReadDate() == null) continue;
                if (activity.getReadDate().getYear() == LocalDate.now().getYear()) {
                    booksReadThisYear++;

                    BookEntity book = bookIdToEntityMap.get(activity.getBookId());
                    totalPagesReadThisYear.addAndGet(book.getPageCount());

                    if (firstReadDate == null || activity.getReadDate().isBefore(firstReadDate)) {
                        firstReadDate = activity.getReadDate();
                    }
                }
            }
            response.setBookRead(totalBooksRead);
            response.setBookReadThisYear(booksReadThisYear);

            long daysThisYear = daysSinceStartOfYear();

            double averagePagesPerDay = (daysThisYear > 0) ? (double) totalPagesReadThisYear.get() / daysThisYear : 0;
            BigDecimal rounded = new BigDecimal(averagePagesPerDay).setScale(2, RoundingMode.HALF_UP);
            response.setPagePerDay(rounded.doubleValue());

            List<ReviewWithBookInfoDto> reviews = new ArrayList<>();

            for (UserActivityEntity activity : userActivities) {
                if (activity.getReadDate() == null || activity.getComment() == null || activity.getComment().isBlank()) {
                    continue;
                }

                BookEntity book = bookIdToEntityMap.get(activity.getBookId());
                if (book == null) continue;

                ReviewWithBookInfoDto review = new ReviewWithBookInfoDto();
                review.setBookId(book.getId());
                review.setTitle(book.getTitle());
                review.setCoverUrl(book.getCoverUrl());
                review.setYear(book.getPublicationYear());
                //review.setAuthorName(book.getAuthor() != null ? book.getAuthor().getName() : "");
                review.setReadDate(activity.getReadDate());
                review.setComment(activity.getComment());

                reviews.add(review);
            }

            response.setReviews(reviews);

        } catch (Exception e) {
            response.setBookRead(0);
            response.setBookReadThisYear(0);
        }


        return response;
    }
}
