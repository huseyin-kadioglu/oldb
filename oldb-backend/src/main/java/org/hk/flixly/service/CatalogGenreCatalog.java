package org.hk.flixly.service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/** Sabit tür sözlüğü — storage hâlâ virgüllü string; normalize ile çoğalma azaltılır. */
public final class CatalogGenreCatalog {

    private static final Map<String, String> CANONICAL = new LinkedHashMap<>();

    static {
        add("Kurgu", "Fiction", "Roman", "fiction");
        add("Kurgu Dışı", "Nonfiction", "Non-fiction", "non fiction");
        add("Gizem", "Mystery", "Polisiye");
        add("Bilimkurgu", "Science Fiction", "Sci-Fi", "Sci Fi", "Bilim Kurgu");
        add("Fantastik", "Fantasy");
        add("Romantik", "Romance");
        add("Korku", "Horror");
        add("Gerilim", "Thriller", "Suspense");
        add("Biyografi", "Biography", "Memoir", "Anı");
        add("Tarih", "History");
        add("Şiir", "Poetry");
        add("Felsefe", "Philosophy");
        add("Klasik", "Classic", "Classics");
        add("Genç Yetişkin", "Young Adult", "YA");
        add("Çocuk", "Children", "Kids");
        add("Kişisel Gelişim", "Self-Help", "Self Help");
        add("Drama", "Play");
        add("Macera", "Adventure");
        add("Suç", "Crime");
        add("Edebiyat", "Literary Fiction");
        add("Deneme", "Essay", "Essays");
        add("Din", "Religion");
        add("Bilim", "Science");
        add("Sanat", "Art");
        add("Mizah", "Humor", "Comedy");
    }

    private CatalogGenreCatalog() {
    }

    private static void add(String canonical, String... aliases) {
        CANONICAL.put(normKey(canonical), canonical);
        for (String a : aliases) {
            CANONICAL.put(normKey(a), canonical);
        }
    }

    public static List<String> allCanonical() {
        return CANONICAL.values().stream().distinct().sorted().collect(Collectors.toList());
    }

    public static List<String> search(String q) {
        if (q == null || q.isBlank()) {
            return allCanonical();
        }
        String key = normKey(q);
        return allCanonical().stream()
                .filter(g -> normKey(g).contains(key) || CANONICAL.entrySet().stream()
                        .anyMatch(e -> e.getValue().equals(g) && e.getKey().contains(key)))
                .limit(20)
                .toList();
    }

    public static String canonicalizeOne(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String trimmed = raw.trim();
        String mapped = CANONICAL.get(normKey(trimmed));
        if (mapped != null) return mapped;
        // Title-case fallback for unknown
        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT) + trimmed.substring(1);
    }

    public static String canonicalizeCsv(String csv) {
        if (csv == null || csv.isBlank()) return null;
        List<String> out = new ArrayList<>();
        for (String part : csv.split("[,;|/]")) {
            String c = canonicalizeOne(part);
            if (c != null && out.stream().noneMatch(x -> x.equalsIgnoreCase(c))) {
                out.add(c);
            }
        }
        return out.isEmpty() ? null : String.join(", ", out);
    }

    public static String normalizeIsbn(String isbn) {
        if (isbn == null) return "";
        return isbn.replaceAll("[^0-9Xx]", "").toUpperCase(Locale.ROOT);
    }

    public static String normalizeTitle(String title) {
        if (title == null) return "";
        String n = Normalizer.normalize(title.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return n.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ").trim();
    }

    private static String normKey(String s) {
        if (s == null) return "";
        String n = Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return n.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9ğüşıöç]+", "");
    }
}
