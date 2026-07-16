package org.hk.flixly.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.repository.AuthorRepository;
import org.hk.flixly.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Open Library Search API üzerinden katalog doldurur.
 * Statik seed yerine gerçek metadata + kapak URL'leri kullanır.
 */
@Service
public class OpenLibraryImportService {

    private static final Logger log = LoggerFactory.getLogger(OpenLibraryImportService.class);
    private static final String SEARCH = "https://openlibrary.org/search.json";
    private static final String COVERS = "https://covers.openlibrary.org/b";

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${catalog.openlibrary.limit-per-query:60}")
    private int limitPerQuery;

    public OpenLibraryImportService(BookRepository bookRepository, AuthorRepository authorRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.restClient = RestClient.builder()
                .defaultHeader("User-Agent", "OLDB-BookApp/1.0 (catalog-import)")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public ImportResult importCatalog() {
        List<String> queries = List.of(
                "subject:fiction&sort=editions",
                "subject:literature&sort=editions",
                "language:tur&sort=editions",
                "subject:nobel+prize&sort=editions",
                "q=Orhan+Pamuk",
                "q=Yaşar+Kemal",
                "q=Sabahattin+Ali",
                "q=Elif+Shafak",
                "q=Dostoyevsky",
                "q=Kafka",
                "q=Orwell+1984",
                "q=Murakami",
                "q=Tolkien",
                "q=Jane+Austen",
                "q=Gabriel+Garcia+Marquez"
        );

        int authorsAdded = 0;
        int booksAdded = 0;
        int booksUpdated = 0;
        Map<String, AuthorEntity> authorCache = new LinkedHashMap<>();

        for (String query : queries) {
            try {
                JsonNode docs = fetchSearchDocs(query, limitPerQuery);
                if (docs == null || !docs.isArray()) continue;

                for (JsonNode doc : docs) {
                    try {
                        Result r = upsertDoc(doc, authorCache);
                        authorsAdded += r.authorAdded ? 1 : 0;
                        booksAdded += r.bookAdded ? 1 : 0;
                        booksUpdated += r.bookUpdated ? 1 : 0;
                    } catch (Exception e) {
                        log.debug("Doküman atlandı: {}", e.getMessage());
                    }
                }
                Thread.sleep(200);
            } catch (Exception e) {
                log.warn("Open Library sorgu başarısız ({}): {}", query, e.getMessage());
            }
        }

        log.info("Open Library import: +{} yazar, +{} kitap, {} güncellendi (toplam kitap={})",
                authorsAdded, booksAdded, booksUpdated, bookRepository.count());
        return new ImportResult(authorsAdded, booksAdded, booksUpdated, bookRepository.count(), authorRepository.count());
    }

    private JsonNode fetchSearchDocs(String query, int limit) throws Exception {
        String url = SEARCH + "?" + query + "&limit=" + limit
                + "&fields=key,title,author_name,author_key,first_publish_year,cover_i,isbn,number_of_pages_median,language,edition_count,subject";
        String body = restClient.get().uri(url).retrieve().body(String.class);
        if (body == null || body.isBlank()) return null;
        JsonNode root = objectMapper.readTree(body);
        return root.get("docs");
    }

    private Result upsertDoc(JsonNode doc, Map<String, AuthorEntity> authorCache) {
        String workKey = text(doc, "key");
        if (workKey == null || workKey.isBlank()) return Result.empty();
        if (!workKey.startsWith("/works/")) {
            workKey = "/works/" + workKey.replace("/works/", "");
        }

        String title = text(doc, "title");
        if (title == null || title.isBlank()) return Result.empty();

        AuthorEntity author = resolveAuthor(doc, authorCache);
        boolean authorAdded = author != null && author.getId() != null
                && authorCache.containsKey(authorKey(doc))
                && authorCache.get(authorKey(doc)) == author;

        // authorAdded tracking: check if newly saved
        String aKey = authorKey(doc);
        boolean wasNewAuthor = false;
        if (author != null && aKey != null) {
            wasNewAuthor = Boolean.TRUE.equals(authorCache.get(aKey + "#new"));
            authorCache.remove(aKey + "#new");
        }

        BookEntity existing = bookRepository.findByOpenLibraryKey(workKey);
        if (existing == null) {
            // fallback: title + year
            int year = doc.hasNonNull("first_publish_year") ? doc.get("first_publish_year").asInt(0) : 0;
            if (year > 0) {
                existing = bookRepository.findByTitleAndPublicationYear(title, year);
            }
        }

        String isbn = firstIsbn(doc);
        String cover = coverUrl(doc, isbn);
        String genres = extractGenres(doc);
        String language = extractLanguage(doc);
        Integer pages = doc.hasNonNull("number_of_pages_median")
                ? doc.get("number_of_pages_median").asInt() : null;
        int year = doc.hasNonNull("first_publish_year") ? doc.get("first_publish_year").asInt(0) : 0;

        if (existing == null) {
            BookEntity book = new BookEntity();
            book.setTitle(title);
            book.setOriginalTitle(title);
            book.setOpenLibraryKey(workKey);
            book.setIsbn(isbn);
            book.setCoverUrl(cover);
            book.setPageCount(pages);
            book.setPublicationYear(year);
            book.setAuthorId(author != null ? author.getId() : null);
            book.setWonNobelPrize(false);
            book.setNewRelease(year >= java.time.Year.now().getValue() - 2);
            book.setGenres(genres);
            book.setLanguage(language);
            bookRepository.save(book);
            return new Result(wasNewAuthor, true, false);
        }

        boolean updated = false;
        if (existing.getOpenLibraryKey() == null) {
            existing.setOpenLibraryKey(workKey);
            updated = true;
        }
        if ((existing.getCoverUrl() == null || existing.getCoverUrl().isBlank()) && cover != null) {
            existing.setCoverUrl(cover);
            updated = true;
        }
        if (existing.getIsbn() == null && isbn != null) {
            existing.setIsbn(isbn);
            updated = true;
        }
        if (existing.getPageCount() == null && pages != null) {
            existing.setPageCount(pages);
            updated = true;
        }
        if (existing.getAuthorId() == null && author != null) {
            existing.setAuthorId(author.getId());
            updated = true;
        }
        if ((existing.getGenres() == null || existing.getGenres().isBlank()) && genres != null) {
            existing.setGenres(genres);
            updated = true;
        }
        if ((existing.getLanguage() == null || existing.getLanguage().isBlank()) && language != null) {
            existing.setLanguage(language);
            updated = true;
        }
        if (updated) {
            bookRepository.save(existing);
        }
        return new Result(wasNewAuthor, false, updated);
    }

    private static String extractGenres(JsonNode doc) {
        JsonNode subjects = doc.get("subject");
        if (subjects == null || !subjects.isArray() || subjects.isEmpty()) return null;
        java.util.LinkedHashSet<String> set = new java.util.LinkedHashSet<>();
        for (JsonNode s : subjects) {
            String v = s.asText();
            if (v == null || v.isBlank()) continue;
            // çok uzun/gürültülü subject'leri ele
            if (v.length() > 40) continue;
            set.add(v.trim());
            if (set.size() >= 5) break;
        }
        return set.isEmpty() ? null : String.join(", ", set);
    }

    private static String extractLanguage(JsonNode doc) {
        JsonNode langs = doc.get("language");
        if (langs == null || !langs.isArray() || langs.isEmpty()) {
            return null;
        }
        String raw = langs.get(0).asText("");
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String code = raw.replace("/languages/", "").trim().toLowerCase(java.util.Locale.ROOT);
        return code.isBlank() ? null : code;
    }

    private AuthorEntity resolveAuthor(JsonNode doc, Map<String, AuthorEntity> cache) {
        String olKey = null;
        JsonNode keys = doc.get("author_key");
        if (keys != null && keys.isArray() && !keys.isEmpty()) {
            olKey = "/authors/" + keys.get(0).asText();
        }
        String name = null;
        JsonNode names = doc.get("author_name");
        if (names != null && names.isArray() && !names.isEmpty()) {
            name = names.get(0).asText();
        }
        if (name == null || name.isBlank()) {
            name = "Bilinmeyen Yazar";
        }

        String cacheKey = olKey != null ? olKey : name;
        if (cache.containsKey(cacheKey)) {
            return cache.get(cacheKey);
        }

        AuthorEntity author = null;
        if (olKey != null) {
            author = authorRepository.findByOpenLibraryKey(olKey).orElse(null);
        }
        if (author == null) {
            author = authorRepository.findByName(name).orElse(null);
        }
        if (author == null) {
            author = new AuthorEntity();
            author.setName(name);
            author.setOpenLibraryKey(olKey);
            author.setPortrait("https://ui-avatars.com/api/?name="
                    + URLEncoder.encode(name, StandardCharsets.UTF_8)
                    + "&background=1a1a1a&color=d4af37&size=256");
            author = authorRepository.save(author);
            cache.put(cacheKey + "#new", author);
        } else if (olKey != null && author.getOpenLibraryKey() == null) {
            author.setOpenLibraryKey(olKey);
            author = authorRepository.save(author);
        }
        cache.put(cacheKey, author);
        return author;
    }

    private static String authorKey(JsonNode doc) {
        JsonNode keys = doc.get("author_key");
        if (keys != null && keys.isArray() && !keys.isEmpty()) {
            return "/authors/" + keys.get(0).asText();
        }
        JsonNode names = doc.get("author_name");
        if (names != null && names.isArray() && !names.isEmpty()) {
            return names.get(0).asText();
        }
        return null;
    }

    private static String firstIsbn(JsonNode doc) {
        JsonNode isbns = doc.get("isbn");
        if (isbns == null || !isbns.isArray()) return null;
        for (JsonNode n : isbns) {
            String v = n.asText();
            if (v != null && (v.length() == 10 || v.length() == 13)) return v;
        }
        return isbns.size() > 0 ? isbns.get(0).asText() : null;
    }

    private static String coverUrl(JsonNode doc, String isbn) {
        if (doc.hasNonNull("cover_i")) {
            return COVERS + "/id/" + doc.get("cover_i").asInt() + "-L.jpg";
        }
        if (isbn != null && !isbn.isBlank()) {
            return COVERS + "/isbn/" + isbn + "-L.jpg";
        }
        return null;
    }

    private static String text(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
    }

    public record ImportResult(int authorsAdded, int booksAdded, int booksUpdated, long totalBooks, long totalAuthors) {
    }

    private record Result(boolean authorAdded, boolean bookAdded, boolean bookUpdated) {
        static Result empty() {
            return new Result(false, false, false);
        }
    }
}
