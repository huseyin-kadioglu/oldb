package org.hk.flixly.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hk.flixly.model.entity.BookEntity;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
public class ProfileInfoDTO {
    private String username;
    private String email;
    private String bio;
    private String location;
    private String profileName;
    private double pagePerDay;
    private Integer bookRead;
    private Integer bookReadThisYear;
    private Integer bookReadThisMonth;
    private Integer totalPagesRead;
    private Integer totalPagesReadThisYear;
    private Integer totalPagesReadThisMonth;
    private Double pagePerDayThisMonth;
    private List<BookEntity> favoriteBooks;
    private List<BookEntity> readList;
    private List<BookEntity> completedBooks;
    private List<BookEntity> readBooks;
    private List<BookEntity> droppedBooks;
    private List<BookEntity> libraryBooks;
    private List<BookEntity> shoppingBooks;
    private List<ContinueReadingDto> continueReading;
    private List<ChallengeProgressDto> challenges;
    private List<BadgeProgressDto> earnedBadges;
    private List<GenrePreferenceDto> genrePreferences;
    private List<UserActivityWithBookDTO> recentActivity;
    private List<ReviewWithBookInfoDto> reviews;
    private Integer contributionPoint;

}
