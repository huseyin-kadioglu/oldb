package org.hk.flixly.model.enums;

import java.util.Set;

/**
 * Kullanıcı-kitap ilişki durumları.
 *
 * LIBRARY  — fiziksel/dijital olarak sahip olunan kitap
 * SHOPPING — alınacak kitaplar (alışveriş listesi)
 * READLIST — okunacaklar listesi
 * FAVOURITE — yalnızca profil üzerinden
 */
public final class BookActivityStatus {

    public static final String READ = "READ";
    public static final String READLIST = "READLIST";
    public static final String LIBRARY = "LIBRARY";
    public static final String SHOPPING = "SHOPPING";
    public static final String DROPPED = "DROPPED";
    public static final String LIKE = "LIKE";
    public static final String FAVOURITE = "FAVOURITE";
    public static final String COMPLETED = "COMPLETED";

    /** Okuma yaşam döngüsü — aynı anda yalnızca biri */
    public static final Set<String> EXCLUSIVE_READING = Set.of(READ, READLIST, DROPPED, COMPLETED);

    /** Bağımsız durumlar — diğerleriyle birlikte olabilir */
    public static final Set<String> INDEPENDENT = Set.of(LIBRARY, SHOPPING, LIKE, FAVOURITE);

    private BookActivityStatus() {
    }

    public static boolean isExclusiveReading(String status) {
        return status != null && EXCLUSIVE_READING.contains(status);
    }
}
