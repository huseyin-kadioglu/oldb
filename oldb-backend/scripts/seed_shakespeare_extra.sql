-- Shakespeare missing titles (D&R / Open Library)
-- docker cp oldb-backend/scripts/seed_shakespeare_extra.sql my_postgres:/tmp/seed_shakespeare_extra.sql
-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_shakespeare_extra.sql

BEGIN;

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kral Richard III', U&'Richard III', a.id, 1593, 288,
  U&'Kral Richard III; iktidar h\0131rs\0131 ve entrikayla tahta y\00FCkselen Richard''\0131n trajik d\00FC\015F\00FC\015F\00FCn\00FC anlat\0131r.', U&'Klasik, Drama, Tarih', 'eng', U&'https://covers.openlibrary.org/b/id/9020720-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kral Richard III')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Coriolanus', U&'Coriolanus', a.id, 1608, 320,
  U&'Coriolanus; gururlu bir Romal\0131 komutan\0131n halk, siyaset ve ihanetle \00E7at\0131\015Fmas\0131n\0131 anlat\0131r.', U&'Klasik, Drama, Trajedi', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002077497001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Coriolanus')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Atinal\0131 Timon', U&'Timon of Athens', a.id, 1606, 256,
  U&'Atinal\0131 Timon; c\00F6mertli\011Fin ihanete d\00F6n\00FC\015Fmesiyle misantropiye s\00FCr\00FCklenen bir soylunun trajedisidir.', U&'Klasik, Drama, Trajedi', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000314295-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Atinal\0131 Timon')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Titus Andronicus', U&'Titus Andronicus', a.id, 1594, 256,
  U&'Titus Andronicus; intikam, \015Fiddet ve Roma siyasetinin karanl\0131k y\00FCz\00FCn\00FC i\015Fleyen erken bir trajedidir.', U&'Klasik, Drama, Trajedi', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000607189-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Titus Andronicus')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'H\0131r\00E7\0131n K\0131z', U&'The Taming of the Shrew', a.id, 1593, 256,
  U&'H\0131r\00E7\0131n K\0131z; evlilik, g\00FC\00E7 ve toplumsal roller \00FCzerine kurulu canl\0131 bir komedidir.', U&'Klasik, Drama, Komedi', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001928169001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'H\0131r\00E7\0131n K\0131z')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Bo\015F Yere Yaygara', U&'Much Ado About Nothing', a.id, 1599, 256,
  U&'Bo\015F Yere Yaygara (Kuru G\00FCr\00FClt\00FC); Beatrice ile Benedick''in s\00F6z d\00FCellosu ve yanl\0131\015F anla\015F\0131lmalar \00FCzerine ne\015Feli bir komedidir.', U&'Klasik, Drama, Komedi', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001945355002-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Bo\015F Yere Yaygara')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Yanl\0131\015Fl\0131klar Komedyas\0131', U&'The Comedy of Errors', a.id, 1594, 192,
  U&'Yanl\0131\015Fl\0131klar Komedyas\0131; ikiz karde\015Flerin kar\0131\015Fmas\0131yla geli\015Fen h\0131zl\0131 tempolu bir komedidir.', U&'Klasik, Drama, Komedi', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001884337001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Yanl\0131\015Fl\0131klar Komedyas\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Nas\0131l Ho\015Funuza Giderse', U&'As You Like It', a.id, 1600, 256,
  U&'Nas\0131l Ho\015Funuza Giderse; Arden orman\0131nda a\015Fk, s\00FCrg\00FCn ve kimlik oyunlar\0131n\0131 anlatan pastoral bir komedidir.', U&'Klasik, Drama, Komedi', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000431926-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Nas\0131l Ho\015Funuza Giderse')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'V. Henry', U&'Henry V', a.id, 1599, 288,
  U&'V. Henry; gen\00E7 kral\0131n Agincourt zaferine giden yolunu anlatan ulusal bir tarih oyunudur.', U&'Klasik, Drama, Tarih', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000450004-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'V. Henry')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'II. Richard', U&'Richard II', a.id, 1595, 256,
  U&'II. Richard; tahttan indirilen bir kral\0131n kimlik ve iktidar krizini \015Fiirsel bir dille anlat\0131r.', U&'Klasik, Drama, Tarih', 'eng', U&'https://covers.openlibrary.org/b/id/9069548-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'II. Richard')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'I. Henry', U&'Henry IV, Part 1', a.id, 1597, 288,
  U&'I. Henry; Prens Hal, Falstaff ve isyan aras\0131nda ge\00E7en Henry IV''\00FCn ilk b\00F6l\00FCm\00FCd\00FCr.', U&'Klasik, Drama, Tarih', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001874005001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'I. Henry')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'II. Henry', U&'Henry IV, Part 2', a.id, 1598, 288,
  U&'II. Henry; Prens Hal''in kral olu\015Funa giden yolunu ve Falstaff''\0131n sonunu anlat\0131r.', U&'Klasik, Drama, Tarih', 'eng', U&'https://covers.openlibrary.org/b/id/7339581-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'II. Henry')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kral John', U&'King John', a.id, 1596, 224,
  U&'Kral John; taht me\015Fruiyeti, sava\015F ve siyasi entrika \00FCzerine bir tarih oyunudur.', U&'Klasik, Drama, Tarih', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000130346-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kral John')));

COMMIT;

SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE a.name = U&'William Shakespeare' GROUP BY a.id, a.name;

SELECT title FROM books WHERE author_id = (SELECT id FROM authors WHERE name = U&'William Shakespeare') ORDER BY title;
