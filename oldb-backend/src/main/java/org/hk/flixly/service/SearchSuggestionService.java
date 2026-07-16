package org.hk.flixly.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.hk.flixly.model.SearchAuthorSuggestionDto;
import org.hk.flixly.model.SearchBookSuggestionDto;
import org.hk.flixly.model.SearchSuggestionsDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class SearchSuggestionService {

    private static final int MAX_BOOKS = 5;
    private static final int MAX_AUTHORS = 3;

    @PersistenceContext
    private EntityManager entityManager;

    public SearchSuggestionsDto suggest(String rawQuery) {
        String q = rawQuery == null ? "" : rawQuery.trim();
        if (q.length() < 2) {
            return SearchSuggestionsDto.builder().build();
        }

        String pattern = "%" + q.toLowerCase(Locale.ROOT) + "%";
        String exact = q.toLowerCase(Locale.ROOT);
        String prefix = q.toLowerCase(Locale.ROOT) + "%";

        List<SearchBookSuggestionDto> books = fetchBooks(exact, prefix, pattern);
        List<SearchAuthorSuggestionDto> authors = fetchAuthors(exact, prefix, pattern);

        return SearchSuggestionsDto.builder()
                .books(books)
                .authors(authors)
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<SearchBookSuggestionDto> fetchBooks(String exact, String prefix, String pattern) {
        Query query = entityManager.createNativeQuery("""
                SELECT b.id,
                       b.title,
                       a.name AS author_name,
                       b.cover_url
                FROM books b
                LEFT JOIN authors a ON a.id = b.author_id
                WHERE lower(b.title) LIKE :pattern
                   OR lower(COALESCE(b.original_title, '')) LIKE :pattern
                   OR lower(COALESCE(a.name, '')) LIKE :pattern
                ORDER BY
                  CASE
                    WHEN lower(b.title) = :exact THEN 0
                    WHEN lower(COALESCE(b.original_title, '')) = :exact THEN 1
                    WHEN lower(b.title) LIKE :prefix THEN 2
                    WHEN lower(COALESCE(a.name, '')) LIKE :prefix THEN 3
                    ELSE 4
                  END,
                  b.title ASC
                LIMIT :limit
                """);
        query.setParameter("pattern", pattern);
        query.setParameter("exact", exact);
        query.setParameter("prefix", prefix);
        query.setParameter("limit", MAX_BOOKS);

        List<Object[]> rows = query.getResultList();
        List<SearchBookSuggestionDto> out = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            out.add(SearchBookSuggestionDto.builder()
                    .id(toLong(row[0]))
                    .title(toString(row[1]))
                    .authorName(toString(row[2]))
                    .coverUrl(toString(row[3]))
                    .build());
        }
        return out;
    }

    @SuppressWarnings("unchecked")
    private List<SearchAuthorSuggestionDto> fetchAuthors(String exact, String prefix, String pattern) {
        Query query = entityManager.createNativeQuery("""
                SELECT a.id,
                       a.name,
                       a.portrait,
                       (SELECT COUNT(*) FROM books b WHERE b.author_id = a.id) AS book_count
                FROM authors a
                WHERE lower(a.name) LIKE :pattern
                ORDER BY
                  CASE
                    WHEN lower(a.name) = :exact THEN 0
                    WHEN lower(a.name) LIKE :prefix THEN 1
                    ELSE 2
                  END,
                  a.name ASC
                LIMIT :limit
                """);
        query.setParameter("pattern", pattern);
        query.setParameter("exact", exact);
        query.setParameter("prefix", prefix);
        query.setParameter("limit", MAX_AUTHORS);

        List<Object[]> rows = query.getResultList();
        List<SearchAuthorSuggestionDto> out = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            out.add(SearchAuthorSuggestionDto.builder()
                    .id(toLong(row[0]))
                    .name(toString(row[1]))
                    .imageUrl(toString(row[2]))
                    .bookCount(toLong(row[3]))
                    .build());
        }
        return out;
    }

    private static Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number n) {
            return n.longValue();
        }
        return Long.parseLong(value.toString());
    }

    private static String toString(Object value) {
        return value == null ? null : value.toString();
    }
}
