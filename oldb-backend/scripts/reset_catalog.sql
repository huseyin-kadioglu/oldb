-- =====================================================================
-- OLDB — Katalog sıfırlama (temiz başlangıç)
-- =====================================================================
-- Kitap + yazar katalogunu ve BUNLARA BAĞLI TÜM kullanıcı verisini siler:
--   incelemeler/puanlar (user_activity), listeler (user_book_map, user_library),
--   favori/vitrin kitapları (profile_showcase_books), yazar puanları (author_ratings),
--   kitap/yazar yorumları (comments), kitap bildirimleri (notifications),
--   onay kuyrukları (book_approvals, author_approvals),
--   günlük okuma check-in serileri (user_daily_read_checkin).
--
-- Kullanıcı hesapları, takipler ve rozet/challenge tanımları KORUNUR.
--
-- UYARI: Geri alınamaz. Çalıştırmadan önce yedek alın:
--   docker exec -t <pg_container> pg_dump -U myuser mydatabase > backup.sql
-- =====================================================================

BEGIN;

-- Kitaba/yazara bağlı kullanıcı içeriği
TRUNCATE TABLE
    user_activity,
    user_book_map,
    user_library,
    author_ratings,
    profile_showcase_books,
    user_daily_read_checkin
    RESTART IDENTITY;

-- Onay kuyrukları
TRUNCATE TABLE
    book_approvals,
    author_approvals
    RESTART IDENTITY;

-- Katalog
TRUNCATE TABLE books RESTART IDENTITY;
TRUNCATE TABLE authors RESTART IDENTITY;

-- Kısmi temizlik (bu tablolarda kitap/yazar dışı kayıtlar da olabilir)
DELETE FROM comments WHERE target_type IN ('BOOK', 'AUTHOR');
DELETE FROM notifications WHERE book_id IS NOT NULL;
UPDATE profile_showcases SET book_id = NULL WHERE book_id IS NOT NULL;

-- books entity harici bir sequence kullanıyor (book_id_seq); onu da sıfırla
ALTER SEQUENCE IF EXISTS book_id_seq RESTART WITH 1;

COMMIT;
