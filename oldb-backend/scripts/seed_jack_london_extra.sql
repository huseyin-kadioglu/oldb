-- Jack London missing titles (D&R / Open Library covers)
-- docker cp oldb-backend/scripts/seed_jack_london_extra.sql my_postgres:/tmp/seed_jack_london_extra.sql
-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_jack_london_extra.sql

BEGIN;

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'G\00FCn I\015F\0131\011F\0131', U&'Burning Daylight', a.id, 1910, 384,
  U&'G\00FCn I\015F\0131\011F\0131; Yukon''da alt\0131n arayan Elam Harnish''in servet, a\015Fk ve uygarl\0131kla y\00FCzle\015Fmesini anlat\0131r.', U&'Klasik, Kurgu, Macera', 'eng', U&'https://covers.openlibrary.org/b/id/8245391-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'G\00FCn I\015F\0131\011F\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Macera', U&'Adventure', a.id, 1911, 320,
  U&'Macera; Solomon Adalar\0131''nda bir plantasyon sahibinin tehlikeli d\00FCnyas\0131n\0131 anlat\0131r.', U&'Klasik, Kurgu, Macera', 'eng', U&'https://covers.openlibrary.org/b/id/8233626-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Macera')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ay Vadisi', U&'The Valley of the Moon', a.id, 1913, 480,
  U&'Ay Vadisi; i\015F\00E7i s\0131n\0131f\0131ndan bir \00E7iftin \015Fehirden k\0131ra ka\00E7\0131\015F\0131n\0131 ve toprak aray\0131\015F\0131n\0131 anlat\0131r.', U&'Klasik, Kurgu, Drama', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001857281001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ay Vadisi')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'B\00FCy\00FCk Evin K\00FC\00E7\00FCk Han\0131m\0131', U&'The Little Lady of the Big House', a.id, 1916, 352,
  U&'B\00FCy\00FCk Evin K\00FC\00E7\00FCk Han\0131m\0131; California''da bir \00E7iftlik evinde a\015Fk, k\0131skan\00E7l\0131k ve modern ya\015Fam\0131n gerilimini i\015Fler.', U&'Klasik, Kurgu, Drama', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001758514001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'B\00FCy\00FCk Evin K\00FC\00E7\00FCk Han\0131m\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Adalar\0131n Jerry''si', U&'Jerry of the Islands', a.id, 1917, 288,
  U&'Adalar\0131n Jerry''si; G\00FCney Denizleri''nde bir k\00F6pe\011Fin maceralar\0131n\0131 anlat\0131r.', U&'Klasik, Kurgu, Macera', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002077420001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Adalar\0131n Jerry''si')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Jerry''nin Karde\015Fi Michael', U&'Michael, Brother of Jerry', a.id, 1917, 320,
  U&'Jerry''nin Karde\015Fi Michael; hayvanlar \00FCzerinden s\00F6m\00FCr\00FC, g\00F6steri ve \00F6zg\00FCrl\00FCk temas\0131n\0131 i\015Fler.', U&'Klasik, Kurgu, Macera', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002077437001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Jerry''nin Karde\015Fi Michael')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\00DC\00E7 Y\00FCrek', U&'Hearts of Three', a.id, 1920, 384,
  U&'\00DC\00E7 Y\00FCrek; hazine av\0131, a\015Fk ve macera dolu bir G\00FCney Amerika anlat\0131s\0131d\0131r.', U&'Klasik, Kurgu, Macera', 'eng', U&'https://covers.openlibrary.org/b/id/9383473-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\00DC\00E7 Y\00FCrek')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ya\015Fama Sevgisi', U&'Love of Life', a.id, 1907, 192,
  U&'Ya\015Fama Sevgisi; Kuzey''de hayatta kalma m\00FCcadelesini anlatan \00F6yk\00FCleri bir araya getirir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002042208001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ya\015Fama Sevgisi')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kurt O\011Flu', U&'The Son of the Wolf', a.id, 1900, 224,
  U&'Kurt O\011Flu; Jack London''\0131n Kuzey \00F6yk\00FClerinin ilk derlemelerinden biridir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001978374001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kurt O\011Flu')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Smoke Bellew', U&'Smoke Bellew', a.id, 1912, 320,
  U&'Smoke Bellew; Klondike''da bir gazetecinin macerac\0131ya d\00F6n\00FC\015F\00FCm\00FCn\00FC anlatan \00F6yk\00FClerden olu\015Fur.', U&'Klasik, Kurgu, \00D6yk\00FC', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002077452001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Smoke Bellew')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Smoke ile Shorty', U&'Smoke and Shorty', a.id, 1920, 256,
  U&'Smoke ile Shorty; Smoke Bellew serisinin devam \00F6yk\00FClerini bir araya getirir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'eng', U&'https://covers.openlibrary.org/b/id/10664514-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Smoke ile Shorty')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'G\00FCney Denizleri Hik\00E2yeleri', U&'South Sea Tales', a.id, 1911, 256,
  U&'G\00FCney Denizleri Hik\00E2yeleri; Pasifik adalar\0131nda ge\00E7en macera ve s\00F6m\00FCrgecilik \00F6yk\00FCleridir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002175721001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'G\00FCney Denizleri Hik\00E2yeleri')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ayaz\0131n \00C7ocuklar\0131', U&'Children of the Frost', a.id, 1902, 224,
  U&'Ayaz\0131n \00C7ocuklar\0131; Kuzey halklar\0131n\0131n ya\015Fam\0131n\0131 anlatan \00F6yk\00FC derlemesidir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002041994001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ayaz\0131n \00C7ocuklar\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kay\0131p Y\00FCz', U&'Lost Face', a.id, 1910, 192,
  U&'Kay\0131p Y\00FCz; Kuzey''de ge\00E7en sert ve unutulmaz \00F6yk\00FCleri i\00E7erir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002077429001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kay\0131p Y\00FCz')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Yol', U&'The Road', a.id, 1907, 224,
  U&'Yol; Jack London''\0131n serseri y\0131llar\0131n\0131 ve tren \00FCst\00FC yolculuklar\0131n\0131 anlatt\0131\011F\0131 an\0131 kitab\0131d\0131r.', U&'Klasik, Kurgu D\0131\015F\0131, An\0131', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002130373001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Yol')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'U\00E7urum \0130nsanlar\0131', U&'The People of the Abyss', a.id, 1903, 288,
  U&'U\00E7urum \0130nsanlar\0131; London''\0131n Do\011Fu Londra yoksullu\011Fu \00FCzerine yazd\0131\011F\0131 etkileyici bir incelemedir.', U&'Klasik, Kurgu D\0131\015F\0131, Sosyoloji', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000585617-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'U\00E7urum \0130nsanlar\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'John Barleycorn', U&'John Barleycorn', a.id, 1913, 256,
  U&'John Barleycorn; Jack London''\0131n alkolle ili\015Fkisini anlatt\0131\011F\0131 otobiyografik eseridir.', U&'Klasik, Kurgu D\0131\015F\0131, An\0131', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002179557001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'John Barleycorn')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Snark Yolculu\011Fu', U&'The Cruise of the Snark', a.id, 1911, 320,
  U&'Snark Yolculu\011Fu; Jack London''\0131n kendi gemisiyle Pasifik''te yapt\0131\011F\0131 yolculu\011Fun anlat\0131s\0131d\0131r.', U&'Klasik, Kurgu D\0131\015F\0131, Gezi', 'eng', U&'https://covers.openlibrary.org/b/id/8247748-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Snark Yolculu\011Fu')));

COMMIT;

SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE a.name = U&'Jack London' GROUP BY a.id, a.name;

SELECT title FROM books WHERE author_id = (SELECT id FROM authors WHERE name = U&'Jack London') ORDER BY title;
