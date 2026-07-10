package org.hk.flixly.config;

import org.hk.flixly.model.entity.BadgeDefinitionEntity;
import org.hk.flixly.model.entity.ChallengeDefinitionEntity;
import org.hk.flixly.repository.BadgeDefinitionRepository;
import org.hk.flixly.repository.BookRepository;
import org.hk.flixly.repository.ChallengeDefinitionRepository;
import org.hk.flixly.service.OpenLibraryImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Boş katalogda Open Library'den veri çeker.
 * Rozet / hedef tanımlarını DB'ye yazar (ilerleme kullanıcı verisinden hesaplanır).
 */
@Component
public class CatalogBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogBootstrap.class);

    private final BookRepository bookRepository;
    private final OpenLibraryImportService openLibraryImportService;
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final ChallengeDefinitionRepository challengeDefinitionRepository;

    @Value("${catalog.openlibrary.import-on-empty:true}")
    private boolean importOnEmpty;

    @Value("${catalog.openlibrary.min-books:40}")
    private long minBooks;

    public CatalogBootstrap(
            BookRepository bookRepository,
            OpenLibraryImportService openLibraryImportService,
            BadgeDefinitionRepository badgeDefinitionRepository,
            ChallengeDefinitionRepository challengeDefinitionRepository) {
        this.bookRepository = bookRepository;
        this.openLibraryImportService = openLibraryImportService;
        this.badgeDefinitionRepository = badgeDefinitionRepository;
        this.challengeDefinitionRepository = challengeDefinitionRepository;
    }

    @Override
    public void run(String... args) {
        seedBadgeDefinitions();
        seedChallengeDefinitions();

        long olCount = bookRepository.countByOpenLibraryKeyIsNotNull();
        if (importOnEmpty && olCount < minBooks) {
            log.info("Open Library katalogu yetersiz ({} < {}) — import başlıyor...", olCount, minBooks);
            try {
                openLibraryImportService.importCatalog();
            } catch (Exception e) {
                log.error("Open Library import başarısız: {}", e.getMessage(), e);
            }
        } else {
            log.info("Katalog hazır: {} kitap ({} Open Library)", bookRepository.count(), olCount);
        }
    }

    private void seedBadgeDefinitions() {
        List<BadgeDefinitionEntity> wanted = List.of(
                badge("FIRST_BOOK", "İlk Adım", "İlk kitabını logla", "BOOKS_READ", 1, "common", "📖", "Kilometre taşı", false),
                badge("BOOKS_10", "Onluk", "10 kitap oku", "BOOKS_READ", 10, "common", "📚", "Kilometre taşı", false),
                badge("BOOKS_50", "Ellilik", "50 kitap oku", "BOOKS_READ", 50, "uncommon", "🏅", "Kilometre taşı", false),
                badge("BOOKS_100", "Yüzyıllık", "100 kitap oku", "BOOKS_READ", 100, "rare", "🏆", "Kilometre taşı", false),
                badge("BOOKS_500", "Kütüphaneci", "500 kitap oku", "BOOKS_READ", 500, "legendary", "🏛️", "Kilometre taşı", true),
                badge("REVIEWS_10", "Eleştirmen", "10 inceleme yaz", "REVIEWS", 10, "rare", "⭐", "Topluluk", false),
                badge("REVIEWS_100", "Hami", "100 inceleme yaz", "REVIEWS", 100, "legendary", "💛", "Topluluk", true),
                badge("AUTHORS_5", "Yazar Tutkunu", "5 farklı yazar oku", "AUTHORS", 5, "common", "✒️", "Keşif", false),
                badge("AUTHORS_50", "Kaşif", "50 farklı yazar oku", "AUTHORS", 50, "legendary", "🧭", "Keşif", true),
                badge("COUNTRIES_5", "Dünya Okuru", "5 ülke edebiyatı oku", "COUNTRIES", 5, "uncommon", "🌍", "Keşif", false),
                badge("LIBRARY_25", "Sahip", "Kütüphanene 25 kitap ekle", "LIBRARY", 25, "uncommon", "📦", "Koleksiyon", false),
                badge("COMMENT_1", "İlk Söz", "İlk yorumunu yaz", "COMMENTS_WRITTEN", 1, "common", "💬", "Topluluk", false),
                badge("COMMENT_10", "Söz Ustası", "10 yorum yaz", "COMMENTS_WRITTEN", 10, "uncommon", "🗣️", "Topluluk", false),
                badge("COMMENT_50", "Forum Yıldızı", "50 yorum yaz", "COMMENTS_WRITTEN", 50, "rare", "📢", "Topluluk", false),
                badge("LIKED_5", "Beğenilen", "Yorumların 5 beğeni alsın", "COMMENT_LIKES", 5, "uncommon", "👍", "Topluluk", false),
                badge("LIKED_25", "Popüler Kalem", "Yorumların 25 beğeni alsın", "COMMENT_LIKES", 25, "rare", "✨", "Topluluk", false),
                badge("LIKED_100", "Topluluk Favorisi", "Yorumların 100 beğeni alsın", "COMMENT_LIKES", 100, "legendary", "🌟", "Topluluk", true)
        );
        int added = 0;
        for (BadgeDefinitionEntity def : wanted) {
            if (badgeDefinitionRepository.findByCode(def.getCode()).isEmpty()) {
                badgeDefinitionRepository.save(def);
                added++;
            }
        }
        if (added > 0) {
            log.info("Rozet tanımları eklendi: {}", added);
        }
    }

    private void seedChallengeDefinitions() {
        if (challengeDefinitionRepository.count() > 0) return;

        List<ChallengeDefinitionEntity> challenges = List.of(
                challenge("YEAR_52", "52 Kitap Oku", "BOOKS_YEAR", 52, "#d4af37"),
                challenge("YEAR_10_AUTHORS", "10 Yazar Keşfet", "AUTHORS_YEAR", 10, "#00e054"),
                challenge("YEAR_5_COUNTRIES", "5 Ülke Edebiyatı", "COUNTRIES_YEAR", 5, "#64c8ff")
        );
        challengeDefinitionRepository.saveAll(challenges);
        log.info("Hedef tanımları yüklendi: {}", challenges.size());
    }

    private static BadgeDefinitionEntity badge(
            String code, String title, String desc, String metric, int goal,
            String rarity, String icon, String tag, boolean legendary) {
        return BadgeDefinitionEntity.builder()
                .code(code).title(title).description(desc).metric(metric)
                .goal(goal).rarity(rarity).icon(icon).tag(tag).legendaryTrack(legendary)
                .build();
    }

    private static ChallengeDefinitionEntity challenge(
            String code, String title, String metric, int goal, String color) {
        return ChallengeDefinitionEntity.builder()
                .code(code).title(title).metric(metric).goal(goal).color(color).active(true)
                .build();
    }
}
