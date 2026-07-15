package org.hk.flixly.model.enums;

import java.util.Locale;

public final class ShowcaseType {
    public static final String QUOTE = "QUOTE";
    public static final String FAVORITE_BOOKS = "FAVORITE_BOOKS";

    private ShowcaseType() {
    }

    public static String normalize(String raw) {
        if (raw == null || raw.isBlank()) {
            return QUOTE;
        }
        String value = raw.trim().toUpperCase(Locale.ROOT);
        if (QUOTE.equals(value) || FAVORITE_BOOKS.equals(value)) {
            return value;
        }
        throw new IllegalArgumentException("Geçersiz vitrin türü");
    }

    public static boolean isFavoriteBooks(String type) {
        return FAVORITE_BOOKS.equals(normalize(type));
    }
}
