package org.hk.flixly.service;

import org.hk.flixly.model.GenrePreferenceDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GenrePreferenceService {

    private final UserRepository userRepository;
    private final UserBookMapRepository bookMapRepository;
    private final BookRepository bookRepository;

    public GenrePreferenceService(
            UserRepository userRepository,
            UserBookMapRepository bookMapRepository,
            BookRepository bookRepository) {
        this.userRepository = userRepository;
        this.bookMapRepository = bookMapRepository;
        this.bookRepository = bookRepository;
    }

    public List<GenrePreferenceDto> forUsername(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + username));
        return forUserId(user.getId());
    }

    public List<GenrePreferenceDto> forUserId(Long userId) {
        Set<Long> bookIds = bookMapRepository.findByUserId(userId).stream()
                .filter(m -> BookActivityStatus.READ.equals(m.getStatus())
                        || BookActivityStatus.COMPLETED.equals(m.getStatus())
                        || BookActivityStatus.LIKE.equals(m.getStatus())
                        || BookActivityStatus.FAVOURITE.equals(m.getStatus()))
                .map(UserBookMapEntity::getBookId)
                .collect(Collectors.toSet());

        Map<String, Integer> counts = new LinkedHashMap<>();
        for (BookEntity book : bookRepository.findAllById(bookIds)) {
            if (book.getGenres() == null || book.getGenres().isBlank()) continue;
            for (String raw : book.getGenres().split(",")) {
                String g = raw.trim();
                if (g.isEmpty()) continue;
                counts.merge(g, 1, Integer::sum);
            }
        }

        int total = counts.values().stream().mapToInt(Integer::intValue).sum();
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(12)
                .map(e -> GenrePreferenceDto.builder()
                        .genre(e.getKey())
                        .count(e.getValue())
                        .percent(total == 0 ? 0 : (int) Math.round(100.0 * e.getValue() / total))
                        .build())
                .toList();
    }
}
