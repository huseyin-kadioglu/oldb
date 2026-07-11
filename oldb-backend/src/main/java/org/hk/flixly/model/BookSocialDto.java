package org.hk.flixly.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookSocialDto {
    @Builder.Default
    private List<FriendReadingDto> friendsReading = new ArrayList<>();
    @Builder.Default
    private List<BookReviewSnippetDto> topReviews = new ArrayList<>();
    @Builder.Default
    private List<BookDto> authorOtherBooks = new ArrayList<>();
}
