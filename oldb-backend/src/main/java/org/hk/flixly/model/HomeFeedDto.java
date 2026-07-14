package org.hk.flixly.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeFeedDto {
    @Builder.Default
    private List<CommunityBookDto> stoaPicks = new ArrayList<>();

    @Builder.Default
    private List<CommunityBookDto> newReleases = new ArrayList<>();

    /** Most discussed books (comments + reviews) in the recent window. */
    @Builder.Default
    private List<CommunityBookDto> discussed = new ArrayList<>();

    /** All-time most completed/read books. */
    @Builder.Default
    private List<CommunityBookDto> allTimeMostRead = new ArrayList<>();

    /** This month's top liked reviews/comments (cover + text). */
    @Builder.Default
    private List<CommunityReviewDto> popularReviews = new ArrayList<>();

    private CommunityStatsDto communityStats;
}
