package org.hk.flixly.service;

import org.hk.flixly.model.BotmCandidateDto;
import org.hk.flixly.model.BotmStatusDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.model.entity.BotmCandidateEntity;
import org.hk.flixly.model.entity.BotmMonthEntity;
import org.hk.flixly.model.entity.BotmVoteEntity;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.BotmCandidateRepository;
import org.hk.flixly.repository.BotmMonthRepository;
import org.hk.flixly.repository.BotmVoteRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BotmService {

    private static final int POLL_START_DAY = 25;
    private static final int CANDIDATE_COUNT = 5;

    private final BotmMonthRepository monthRepository;
    private final BotmCandidateRepository candidateRepository;
    private final BotmVoteRepository voteRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final UserRepository userRepository;

    public BotmService(
            BotmMonthRepository monthRepository,
            BotmCandidateRepository candidateRepository,
            BotmVoteRepository voteRepository,
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            UserRepository userRepository) {
        this.monthRepository = monthRepository;
        this.candidateRepository = candidateRepository;
        this.voteRepository = voteRepository;
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BotmStatusDto getCurrent(UserDetails userDetails) {
        LocalDate today = LocalDate.now();
        syncPhases(today);

        YearMonth focus;
        if (today.getDayOfMonth() >= POLL_START_DAY) {
            focus = YearMonth.from(today).plusMonths(1);
            BotmMonthEntity pollMonth = ensureMonth(focus.getYear(), focus.getMonthValue(), BotmMonthEntity.PHASE_POLL);
            ensureCandidates(pollMonth);
            return toStatus(pollMonth, resolveUserId(userDetails));
        }

        focus = YearMonth.from(today);
        BotmMonthEntity reading = ensureMonth(focus.getYear(), focus.getMonthValue(), BotmMonthEntity.PHASE_READING);
        finalizeWinnerIfNeeded(reading);
        if (reading.getWinnerBookId() == null) {
            // No winner yet — show upcoming poll for next month early, or previous
            YearMonth next = focus.plusMonths(1);
            BotmMonthEntity upcoming = ensureMonth(next.getYear(), next.getMonthValue(), BotmMonthEntity.PHASE_POLL);
            ensureCandidates(upcoming);
            BotmStatusDto dto = toStatus(upcoming, resolveUserId(userDetails));
            dto.setLabel("Henüz ayın kitabı seçilmedi — sıradaki ay için oy ver");
            return dto;
        }
        reading.setPhase(BotmMonthEntity.PHASE_READING);
        monthRepository.save(reading);
        return toStatus(reading, resolveUserId(userDetails));
    }

    @Transactional
    public BotmStatusDto vote(Long bookId, UserDetails userDetails) {
        UserEntity user = requireUser(userDetails);
        LocalDate today = LocalDate.now();
        if (today.getDayOfMonth() < POLL_START_DAY) {
            // Allow voting only in poll window OR if current active view is POLL (no winner yet)
            BotmStatusDto current = getCurrent(userDetails);
            if (!BotmMonthEntity.PHASE_POLL.equals(current.getPhase())) {
                throw new IllegalArgumentException("Oy verme dönemi ayın son haftasında açılır");
            }
        }

        YearMonth pollYm = today.getDayOfMonth() >= POLL_START_DAY
                ? YearMonth.from(today).plusMonths(1)
                : YearMonth.from(today).plusMonths(1);
        // If early fallback poll for next month
        BotmMonthEntity month = ensureMonth(pollYm.getYear(), pollYm.getMonthValue(), BotmMonthEntity.PHASE_POLL);
        ensureCandidates(month);
        if (!BotmMonthEntity.PHASE_POLL.equals(month.getPhase())) {
            throw new IllegalArgumentException("Bu dönem için oylama kapalı");
        }

        BotmCandidateEntity candidate = candidateRepository.findByMonthIdAndBookId(month.getId(), bookId)
                .orElseThrow(() -> new IllegalArgumentException("Aday kitap bulunamadı"));

        var existing = voteRepository.findByMonthIdAndUserId(month.getId(), user.getId());
        if (existing.isPresent()) {
            BotmVoteEntity vote = existing.get();
            if (vote.getBookId().equals(bookId)) {
                return toStatus(month, user.getId());
            }
            candidateRepository.findByMonthIdAndBookId(month.getId(), vote.getBookId()).ifPresent(prev -> {
                prev.setVoteCount(Math.max(0, prev.getVoteCount() - 1));
                candidateRepository.save(prev);
            });
            vote.setBookId(bookId);
            voteRepository.save(vote);
        } else {
            voteRepository.save(BotmVoteEntity.builder()
                    .monthId(month.getId())
                    .userId(user.getId())
                    .bookId(bookId)
                    .build());
        }
        candidate.setVoteCount(candidate.getVoteCount() + 1);
        candidateRepository.save(candidate);
        return toStatus(month, user.getId());
    }

    private void syncPhases(LocalDate today) {
        // Close previous month's poll when new month starts: finalize winner
        YearMonth previous = YearMonth.from(today).minusMonths(1);
        monthRepository.findByYearValueAndMonthValue(previous.getYear(), previous.getMonthValue())
                .ifPresent(this::finalizeWinnerIfNeeded);
    }

    private void finalizeWinnerIfNeeded(BotmMonthEntity month) {
        if (month.getWinnerBookId() != null) {
            if (BotmMonthEntity.PHASE_POLL.equals(month.getPhase())) {
                month.setPhase(BotmMonthEntity.PHASE_READING);
                monthRepository.save(month);
            }
            return;
        }
        List<BotmCandidateEntity> candidates =
                candidateRepository.findByMonthIdOrderByVoteCountDescIdAsc(month.getId());
        if (candidates.isEmpty()) {
            return;
        }
        BotmCandidateEntity top = candidates.get(0);
        if (top.getVoteCount() <= 0 && month.getPhase().equals(BotmMonthEntity.PHASE_POLL)) {
            // still polling with no votes — keep open until month rolls
            YearMonth ym = YearMonth.of(month.getYearValue(), month.getMonthValue());
            if (!YearMonth.now().isAfter(ym.minusMonths(1)) && LocalDate.now().getDayOfMonth() < POLL_START_DAY
                    && YearMonth.now().equals(ym)) {
                // we're IN the reading month without votes — pick first candidate as default
            } else if (YearMonth.now().isBefore(ym)) {
                return;
            }
        }
        // When current calendar month >= the poll's target month, lock winner
        YearMonth target = YearMonth.of(month.getYearValue(), month.getMonthValue());
        if (!YearMonth.now().isBefore(target)) {
            month.setWinnerBookId(top.getBookId());
            month.setPhase(BotmMonthEntity.PHASE_READING);
            monthRepository.save(month);
        }
    }

    private BotmMonthEntity ensureMonth(int year, int month, String defaultPhase) {
        return monthRepository.findByYearValueAndMonthValue(year, month)
                .orElseGet(() -> monthRepository.save(BotmMonthEntity.builder()
                        .yearValue(year)
                        .monthValue(month)
                        .phase(defaultPhase)
                        .build()));
    }

    private void ensureCandidates(BotmMonthEntity month) {
        if (candidateRepository.countByMonthId(month.getId()) > 0) {
            return;
        }
        LinkedHashSet<Long> bookIds = new LinkedHashSet<>();
        for (BookEntity b : bookRepository.findEditorChoices(CANDIDATE_COUNT)) {
            bookIds.add(b.getId());
        }
        for (BookEntity b : bookRepository.findNewReleases(CANDIDATE_COUNT)) {
            if (bookIds.size() >= CANDIDATE_COUNT) {
                break;
            }
            bookIds.add(b.getId());
        }
        if (bookIds.isEmpty()) {
            bookRepository.findAll().stream().limit(CANDIDATE_COUNT).forEach(b -> bookIds.add(b.getId()));
        }
        for (Long bookId : bookIds) {
            if (candidateRepository.countByMonthId(month.getId()) >= CANDIDATE_COUNT) {
                break;
            }
            candidateRepository.save(BotmCandidateEntity.builder()
                    .monthId(month.getId())
                    .bookId(bookId)
                    .voteCount(0)
                    .build());
        }
    }

    private BotmStatusDto toStatus(BotmMonthEntity month, Long viewerUserId) {
        String monthName = java.time.Month.of(month.getMonthValue())
                .getDisplayName(TextStyle.FULL, Locale.forLanguageTag("tr"));
        String label;
        if (BotmMonthEntity.PHASE_POLL.equals(month.getPhase())) {
            label = monthName + " " + month.getYearValue() + " — oyunu kullan";
        } else {
            label = monthName + " " + month.getYearValue() + " — ayın kitabı";
        }

        Long myVote = null;
        if (viewerUserId != null) {
            myVote = voteRepository.findByMonthIdAndUserId(month.getId(), viewerUserId)
                    .map(BotmVoteEntity::getBookId)
                    .orElse(null);
        }

        List<BotmCandidateEntity> candidates =
                candidateRepository.findByMonthIdOrderByVoteCountDescIdAsc(month.getId());
        Set<Long> bookIds = new LinkedHashSet<>();
        candidates.forEach(c -> bookIds.add(c.getBookId()));
        if (month.getWinnerBookId() != null) {
            bookIds.add(month.getWinnerBookId());
        }
        Map<Long, BookEntity> books = bookRepository.findAllById(bookIds).stream()
                .collect(Collectors.toMap(BookEntity::getId, Function.identity()));
        Set<Long> authorIds = books.values().stream()
                .map(BookEntity::getAuthorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, AuthorEntity> authors = authorIds.isEmpty()
                ? Map.of()
                : authorRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(AuthorEntity::getId, Function.identity()));

        List<BotmCandidateDto> candidateDtos = new ArrayList<>();
        for (BotmCandidateEntity c : candidates) {
            BookEntity book = books.get(c.getBookId());
            if (book == null) {
                continue;
            }
            AuthorEntity author = book.getAuthorId() != null ? authors.get(book.getAuthorId()) : null;
            candidateDtos.add(BotmCandidateDto.builder()
                    .bookId(book.getId())
                    .title(book.getTitle())
                    .authorName(author != null ? author.getName() : null)
                    .coverUrl(book.getCoverUrl())
                    .voteCount(c.getVoteCount())
                    .votedByMe(myVote != null && myVote.equals(book.getId()))
                    .build());
        }

        BookEntity winner = month.getWinnerBookId() != null ? books.get(month.getWinnerBookId()) : null;
        AuthorEntity winnerAuthor = winner != null && winner.getAuthorId() != null
                ? authors.get(winner.getAuthorId()) : null;

        return BotmStatusDto.builder()
                .year(month.getYearValue())
                .month(month.getMonthValue())
                .phase(month.getPhase())
                .label(label)
                .myVotedBookId(myVote)
                .winnerBookId(month.getWinnerBookId())
                .winnerTitle(winner != null ? winner.getTitle() : null)
                .winnerAuthorName(winnerAuthor != null ? winnerAuthor.getName() : null)
                .winnerCoverUrl(winner != null ? winner.getCoverUrl() : null)
                .candidates(candidateDtos)
                .build();
    }

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        return userRepository.findByEmail(userDetails.getUsername()).map(UserEntity::getId).orElse(null);
    }

    private UserEntity requireUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("Giriş gerekli");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
    }
}
