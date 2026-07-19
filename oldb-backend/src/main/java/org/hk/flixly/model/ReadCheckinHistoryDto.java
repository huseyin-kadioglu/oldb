package org.hk.flixly.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadCheckinHistoryDto {
    /** week | month | year */
    private String range;
    /** yyyy-MM-dd */
    private String from;
    /** yyyy-MM-dd */
    private String to;
    @Builder.Default
    private List<String> dates = new ArrayList<>();
    private int readingStreak;
    private int totalDays;
}
