package org.hk.flixly.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReadCheckinDto {
    private boolean checkedInToday;
    private int readingStreak;
    /** ISO local date client sent / used (yyyy-MM-dd) */
    private String today;
}
