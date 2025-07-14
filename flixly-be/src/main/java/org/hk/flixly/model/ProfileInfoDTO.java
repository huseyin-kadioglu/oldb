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
    private String profileName;
    private double pagePerDay;
    private Integer bookRead;
    private Integer bookReadThisYear;
    private List<BookEntity> favoriteBooks;
    private List<BookEntity> readList;
    private List<UserActivityWithBookDTO> recentActivity;
    private List<ReviewWithBookInfoDto> reviews;

}
