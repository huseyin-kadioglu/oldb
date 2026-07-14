package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BotmCandidateDto {
    private Long bookId;
    private String title;
    private String authorName;
    private String coverUrl;
    private int voteCount;
    private boolean votedByMe;
}
