package org.hk.flixly.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BotmStatusDto {
    private int year;
    private int month;
    /** POLL | READING | CLOSED */
    private String phase;
    private String label;
    private Long myVotedBookId;

    private Long winnerBookId;
    private String winnerTitle;
    private String winnerAuthorName;
    private String winnerCoverUrl;

    @Builder.Default
    private List<BotmCandidateDto> candidates = new ArrayList<>();
}
