package org.hk.flixly.service;

import org.hk.flixly.model.DailyReadCheckinDto;
import org.hk.flixly.model.ReadCheckinHistoryDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.UserDailyReadCheckinEntity;
import org.hk.flixly.repository.UserDailyReadCheckinRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class DailyReadCheckinService {

    private final UserDailyReadCheckinRepository checkinRepository;
    private final UserRepository userRepository;

    public DailyReadCheckinService(
            UserDailyReadCheckinRepository checkinRepository,
            UserRepository userRepository) {
        this.checkinRepository = checkinRepository;
        this.userRepository = userRepository;
    }

    public DailyReadCheckinDto getStatus(UserDetails userDetails, String clientDate) {
        UserEntity user = requireUser(userDetails);
        LocalDate today = parseClientDate(clientDate);
        boolean checked = checkinRepository.existsByUserIdAndCheckinDate(user.getId(), today);
        return DailyReadCheckinDto.builder()
                .checkedInToday(checked)
                .readingStreak(computeStreak(user.getId(), today))
                .today(today.toString())
                .build();
    }

    @Transactional
    public DailyReadCheckinDto setToday(UserDetails userDetails, String clientDate, boolean checkedIn) {
        UserEntity user = requireUser(userDetails);
        LocalDate today = parseClientDate(clientDate);

        if (checkedIn) {
            if (!checkinRepository.existsByUserIdAndCheckinDate(user.getId(), today)) {
                checkinRepository.save(UserDailyReadCheckinEntity.builder()
                        .userId(user.getId())
                        .checkinDate(today)
                        .build());
            }
        } else {
            checkinRepository.findByUserIdAndCheckinDate(user.getId(), today)
                    .ifPresent(checkinRepository::delete);
        }

        return DailyReadCheckinDto.builder()
                .checkedInToday(checkedIn)
                .readingStreak(computeStreak(user.getId(), today))
                .today(today.toString())
                .build();
    }

    /** Public contribution history for profile heatmap. */
    public ReadCheckinHistoryDto getHistory(String username, String rangeParam) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        String range = normalizeRange(rangeParam);
        LocalDate today = LocalDate.now();
        LocalDate from;
        LocalDate to = today;

        switch (range) {
            case "month" -> {
                YearMonth ym = YearMonth.from(today);
                from = ym.atDay(1);
                to = today;
            }
            case "year" -> {
                from = today.minusWeeks(51).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                to = today;
            }
            default -> {
                range = "week";
                from = today.minusDays(6);
                to = today;
            }
        }

        List<UserDailyReadCheckinEntity> rows =
                checkinRepository.findByUserIdAndCheckinDateGreaterThanEqualOrderByCheckinDateDesc(
                        user.getId(), from);

        List<String> dates = new ArrayList<>();
        for (UserDailyReadCheckinEntity row : rows) {
            LocalDate d = row.getCheckinDate();
            if (d != null && !d.isAfter(to) && !d.isBefore(from)) {
                dates.add(d.toString());
            }
        }

        return ReadCheckinHistoryDto.builder()
                .range(range)
                .from(from.toString())
                .to(to.toString())
                .dates(dates)
                .readingStreak(computeStreak(user.getId(), today))
                .totalDays(dates.size())
                .build();
    }

    public int streakForUser(Long userId) {
        return computeStreak(userId, LocalDate.now());
    }

    public int streakForUser(Long userId, LocalDate today) {
        return computeStreak(userId, today);
    }

    private int computeStreak(Long userId, LocalDate today) {
        LocalDate from = today.minusDays(400);
        List<UserDailyReadCheckinEntity> rows =
                checkinRepository.findByUserIdAndCheckinDateGreaterThanEqualOrderByCheckinDateDesc(userId, from);
        Set<LocalDate> days = new HashSet<>();
        for (UserDailyReadCheckinEntity row : rows) {
            days.add(row.getCheckinDate());
        }
        if (days.isEmpty()) {
            return 0;
        }

        LocalDate cursor = today;
        if (!days.contains(cursor)) {
            cursor = cursor.minusDays(1);
            if (!days.contains(cursor)) {
                return 0;
            }
        }

        int streak = 0;
        while (days.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private static String normalizeRange(String rangeParam) {
        if (rangeParam == null || rangeParam.isBlank()) {
            return "week";
        }
        return switch (rangeParam.trim().toLowerCase(Locale.ROOT)) {
            case "month", "year", "week" -> rangeParam.trim().toLowerCase(Locale.ROOT);
            default -> "week";
        };
    }

    private static LocalDate parseClientDate(String clientDate) {
        if (clientDate == null || clientDate.isBlank()) {
            return LocalDate.now();
        }
        return LocalDate.parse(clientDate.trim());
    }

    private UserEntity requireUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }
}
