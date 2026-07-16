package org.hk.flixly.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.hk.flixly.model.DiscoverBookDto;
import org.hk.flixly.model.DiscoverPageDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class DiscoverService {

    public static final int DEFAULT_PAGE_SIZE = 24;
    private static final int MAX_PAGE_SIZE = 48;

    @PersistenceContext
    private EntityManager entityManager;

    public DiscoverPageDto discover(
            String q,
            String genre,
            Long authorId,
            String author,
            Double minRating,
            Integer yearFrom,
            Integer yearTo,
            Integer minPages,
            Integer maxPages,
            String language,
            Boolean editorChoice,
            Boolean weeklyPick,
            Boolean newRelease,
            String sort,
            int page,
            int size
    ) {
        int safePage = Math.max(0, page);
        int safeSize = size <= 0 ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        String sortKey = normalizeSort(sort);

        StringBuilder where = new StringBuilder(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (q != null && !q.trim().isEmpty()) {
            String pattern = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
            where.append("""
                     AND (
                       lower(b.title) LIKE ?
                       OR lower(COALESCE(b.original_title, '')) LIKE ?
                       OR lower(COALESCE(a.name, '')) LIKE ?
                     )
                    """);
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
        }

        if (genre != null && !genre.trim().isEmpty()) {
            where.append(" AND lower(COALESCE(b.genres, '')) LIKE ? ");
            params.add("%" + genre.trim().toLowerCase(Locale.ROOT) + "%");
        }

        if (authorId != null) {
            where.append(" AND b.author_id = ? ");
            params.add(authorId);
        } else if (author != null && !author.trim().isEmpty()) {
            where.append(" AND lower(COALESCE(a.name, '')) LIKE ? ");
            params.add("%" + author.trim().toLowerCase(Locale.ROOT) + "%");
        }

        if (yearFrom != null) {
            where.append(" AND b.publication_year >= ? ");
            params.add(yearFrom);
        }
        if (yearTo != null) {
            where.append(" AND b.publication_year <= ? ");
            params.add(yearTo);
        }
        if (minPages != null) {
            where.append(" AND COALESCE(b.page_count, 0) >= ? ");
            params.add(minPages);
        }
        if (maxPages != null) {
            where.append(" AND COALESCE(b.page_count, 0) <= ? ");
            params.add(maxPages);
        }
        if (language != null && !language.trim().isEmpty()) {
            where.append(" AND lower(COALESCE(b.language, '')) = ? ");
            params.add(language.trim().toLowerCase(Locale.ROOT));
        }
        if (Boolean.TRUE.equals(editorChoice)) {
            where.append(" AND b.editor_choice = true ");
        }
        if (Boolean.TRUE.equals(weeklyPick)) {
            where.append(" AND b.weekly_pick = true ");
        }
        if (Boolean.TRUE.equals(newRelease)) {
            where.append(" AND b.new_release = true ");
        }

        if (minRating != null && minRating > 0) {
            where.append(" AND COALESCE(r.avg_rating, 0) >= ? ");
            params.add(minRating);
        }

        String from = """
                FROM books b
                LEFT JOIN authors a ON a.id = b.author_id
                LEFT JOIN (
                  SELECT book_id,
                         AVG(rating)::float AS avg_rating,
                         COUNT(*) AS rating_count
                  FROM user_activity
                  WHERE rating IS NOT NULL AND rating > 0
                  GROUP BY book_id
                ) r ON r.book_id = b.id
                LEFT JOIN (
                  SELECT book_id, COUNT(*) AS read_count
                  FROM user_book_map
                  WHERE status IN ('READ', 'COMPLETED')
                  GROUP BY book_id
                ) rc ON rc.book_id = b.id
                LEFT JOIN (
                  SELECT book_id, COUNT(*) AS favorite_count
                  FROM user_book_map
                  WHERE status = 'FAVOURITE'
                  GROUP BY book_id
                ) fc ON fc.book_id = b.id
                """;

        String orderBy = switch (sortKey) {
            case "highestRating" -> " COALESCE(r.avg_rating, 0) DESC NULLS LAST, COALESCE(r.rating_count, 0) DESC, b.title ASC ";
            case "mostFavorited" -> " COALESCE(fc.favorite_count, 0) DESC, COALESCE(r.rating_count, 0) DESC, b.title ASC ";
            case "newest" -> " b.id DESC ";
            case "yearDesc" -> " b.publication_year DESC NULLS LAST, b.title ASC ";
            case "yearAsc" -> " b.publication_year ASC NULLS LAST, b.title ASC ";
            case "titleAsc" -> " b.title ASC ";
            case "titleDesc" -> " b.title DESC ";
            default -> " COALESCE(rc.read_count, 0) DESC, COALESCE(r.avg_rating, 0) DESC, COALESCE(r.rating_count, 0) DESC, b.title ASC ";
        };

        String countSql = "SELECT COUNT(*) " + from + where;
        Query countQuery = entityManager.createNativeQuery(countSql);
        bindParams(countQuery, params);
        long totalElements = ((Number) countQuery.getSingleResult()).longValue();
        int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / safeSize);
        if (totalPages > 0 && safePage >= totalPages) {
            safePage = totalPages - 1;
        }

        String dataSql = """
                SELECT b.id,
                       b.title,
                       a.name AS author_name,
                       b.author_id,
                       b.cover_url,
                       b.publication_year,
                       b.genres,
                       COALESCE(r.avg_rating, 0) AS avg_rating,
                       COALESCE(r.rating_count, 0) AS rating_count,
                       COALESCE(rc.read_count, 0) AS read_count,
                       COALESCE(fc.favorite_count, 0) AS favorite_count,
                       b.editor_choice,
                       b.weekly_pick,
                       b.new_release
                """ + from + where + " ORDER BY " + orderBy + " LIMIT ? OFFSET ? ";

        List<Object> dataParams = new ArrayList<>(params);
        dataParams.add(safeSize);
        dataParams.add(safePage * safeSize);

        Query dataQuery = entityManager.createNativeQuery(dataSql);
        bindParams(dataQuery, dataParams);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = dataQuery.getResultList();
        List<DiscoverBookDto> content = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            content.add(DiscoverBookDto.builder()
                    .id(toLong(row[0]))
                    .title(toString(row[1]))
                    .authorName(toString(row[2]))
                    .authorId(toLong(row[3]))
                    .coverUrl(toString(row[4]))
                    .publicationYear(toInt(row[5]))
                    .genres(toString(row[6]))
                    .averageRating(toDouble(row[7]))
                    .ratingCount(toLong(row[8]))
                    .readCount(toLong(row[9]))
                    .favoriteCount(toLong(row[10]))
                    .editorChoice(toBool(row[11]))
                    .weeklyPick(toBool(row[12]))
                    .newRelease(toBool(row[13]))
                    .build());
        }

        return DiscoverPageDto.builder()
                .content(content)
                .page(safePage)
                .size(safeSize)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(safePage <= 0)
                .last(totalPages == 0 || safePage >= totalPages - 1)
                .availableGenres(loadAvailableGenres())
                .availableLanguages(loadAvailableLanguages())
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<String> loadAvailableGenres() {
        Query query = entityManager.createNativeQuery("""
                SELECT DISTINCT trim(g) AS genre
                FROM books b,
                     unnest(string_to_array(COALESCE(b.genres, ''), ',')) AS g
                WHERE trim(g) <> ''
                ORDER BY genre ASC
                LIMIT 80
                """);
        List<Object> rows = query.getResultList();
        Set<String> genres = new LinkedHashSet<>();
        for (Object row : rows) {
            if (row != null) {
                String g = row.toString().trim();
                if (!g.isEmpty()) {
                    genres.add(g);
                }
            }
        }
        return new ArrayList<>(genres);
    }

    @SuppressWarnings("unchecked")
    private List<String> loadAvailableLanguages() {
        Query query = entityManager.createNativeQuery("""
                SELECT DISTINCT lower(trim(language)) AS lang
                FROM books
                WHERE language IS NOT NULL AND trim(language) <> ''
                ORDER BY lang ASC
                LIMIT 40
                """);
        List<Object> rows = query.getResultList();
        Set<String> langs = new LinkedHashSet<>();
        for (Object row : rows) {
            if (row != null) {
                String lang = row.toString().trim();
                if (!lang.isEmpty()) {
                    langs.add(lang);
                }
            }
        }
        return new ArrayList<>(langs);
    }

    private static String normalizeSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return "mostRead";
        }
        return switch (sort.trim()) {
            case "highestRating", "mostFavorited", "newest",
                 "yearDesc", "yearAsc", "titleAsc", "titleDesc", "mostRead" -> sort.trim();
            case "az" -> "titleAsc";
            case "za" -> "titleDesc";
            default -> "mostRead";
        };
    }

    private static void bindParams(Query query, List<Object> params) {
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }
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

    private static int toInt(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number n) {
            return n.intValue();
        }
        return Integer.parseInt(value.toString());
    }

    private static double toDouble(Object value) {
        if (value == null) {
            return 0d;
        }
        if (value instanceof Number n) {
            return n.doubleValue();
        }
        return Double.parseDouble(value.toString());
    }

    private static boolean toBool(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean b) {
            return b;
        }
        if (value instanceof Number n) {
            return n.intValue() != 0;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private static String toString(Object value) {
        return value == null ? null : value.toString();
    }
}
