package org.hk.flixly.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserActivityEntity;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
public class ProfileInfoDTO {
    private String username;
    private double pagePerDay;
    private Integer bookRead;
    private Integer bookReadThisYear;
    private List<BookEntity> favoriteBooks;
    private List<UserActivityEntity> recentActivity;

}
