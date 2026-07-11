package org.hk.flixly.model.enums;

import java.util.Locale;
import java.util.Set;

/**
 * Üye rolleri.
 * <ul>
 *   <li>{@link #USER} — varsayılan; katkı puanı eşikleri geçerli</li>
 *   <li>{@link #PRO} — ileride ücretli plan; puan kapılarını bypass eder</li>
 *   <li>{@link #MODERATOR} — moderasyon + puan kapılarını bypass</li>
 *   <li>{@link #ADMIN} — kurucu/CEO; tüm yetkiler</li>
 * </ul>
 */
public enum UserRole {
    USER,
    PRO,
    MODERATOR,
    ADMIN;

    private static final Set<UserRole> SCORE_BYPASS = Set.of(PRO, MODERATOR, ADMIN);
    private static final Set<UserRole> STAFF = Set.of(MODERATOR, ADMIN);

    public static UserRole from(String raw) {
        if (raw == null || raw.isBlank()) {
            return USER;
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "ADMIN", "CEO", "FOUNDER" -> ADMIN;
            case "MODERATOR", "MOD", "MODS" -> MODERATOR;
            case "PRO", "PREMIUM" -> PRO;
            default -> USER;
        };
    }

    /** Katkı puanı gerektiren özellikler (avatar vb.) için bypass. */
    public boolean bypassesContributionGates() {
        return SCORE_BYPASS.contains(this);
    }

    /** Moderasyon / onay panelleri (kitap, yazar, avatar). */
    public boolean isStaff() {
        return STAFF.contains(this);
    }

    public boolean isAdmin() {
        return this == ADMIN;
    }

    public static boolean bypassesContributionGates(String raw) {
        return from(raw).bypassesContributionGates();
    }

    public static boolean isStaff(String raw) {
        return from(raw).isStaff();
    }

    public static boolean isAdmin(String raw) {
        return from(raw).isAdmin();
    }
}
