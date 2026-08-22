-- Jack London katalog seed (Türkçe)
-- Kapaklar: D&R / İş Bankası Modern Klasikler (urunno → i.dr.com.tr)
-- Not: Jack London HAY dizisinde değil; aynı yayınevinin Modern Klasikler kapakları kullanıldı.
-- Yükleme:
--   docker cp oldb-backend/scripts/seed_jack_london.sql my_postgres:/tmp/seed_jack_london.sql
--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_jack_london.sql

BEGIN;

INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Jack London',
  U&'ABD',
  1876,
  1916,
  U&'https://upload.wikimedia.org/wikipedia/commons/2/2d/Jack_London_young.jpg',
  U&'Jack London (1876\20131916), Amerikan edebiyat\0131n\0131n macera ve toplumsal ger\00E7ek\00E7ilik ustalar\0131ndand\0131r. Kuzey topraklar\0131, deniz ve s\0131n\0131f m\00FCcadelesi temalar\0131n\0131 g\00FC\00E7l\00FC bir anlat\0131mla i\015Fler. Martin Eden, Vah\015Fetin \00C7a\011Fr\0131s\0131 ve Beyaz Di\015F ba\015Fl\0131ca eserleri aras\0131ndad\0131r.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Jack London')));

UPDATE authors SET
  country = U&'ABD',
  birth_year = 1876,
  death_year = 1916,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://upload.wikimedia.org/wikipedia/commons/2/2d/Jack_London_young.jpg'),
  description = U&'Jack London (1876\20131916), Amerikan edebiyat\0131n\0131n macera ve toplumsal ger\00E7ek\00E7ilik ustalar\0131ndand\0131r. Kuzey topraklar\0131, deniz ve s\0131n\0131f m\00FCcadelesi temalar\0131n\0131 g\00FC\00E7l\00FC bir anlat\0131mla i\015Fler. Martin Eden, Vah\015Fetin \00C7a\011Fr\0131s\0131 ve Beyaz Di\015F ba\015Fl\0131ca eserleri aras\0131ndad\0131r.'
WHERE lower(trim(name)) = lower(trim(U&'Jack London'));

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Martin Eden',
  U&'Martin Eden',
  a.id,
  1909,
  480,
  U&'Martin Eden; yoksul bir gencin yazar olma tutkusunu, s\0131n\0131f atlama hayalini ve a\015Fk\0131 anlat\0131r. Jack London''\0131n en ki\015Fisel romanlar\0131ndan biri olarak ba\015Far\0131 ile yaln\0131zl\0131\011F\0131 i\00E7 i\00E7e i\015Fler.',
  U&'Klasik, Kurgu, Drama',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000608697-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Martin Eden'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Vah\015Fetin \00C7a\011Fr\0131s\0131',
  U&'The Call of the Wild',
  a.id,
  1903,
  160,
  U&'Vah\015Fetin \00C7a\011Fr\0131s\0131; evcil k\00F6pek Buck''\0131n Yukon''da vah\015Fi do\011Faya d\00F6n\00FC\015F\00FCn\00FC anlat\0131r. Jack London, do\011Fan\0131n yasalar\0131 ile uygarl\0131\011F\0131n k\0131r\0131lganl\0131\011F\0131n\0131 k\0131sa ama g\00FC\00E7l\00FC bir romanda bulu\015Fturur.',
  U&'Klasik, Kurgu, Macera',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000323262-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Vah\015Fetin \00C7a\011Fr\0131s\0131'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Beyaz Di\015F',
  U&'White Fang',
  a.id,
  1906,
  288,
  U&'Beyaz Di\015F; yar\0131 kurt bir k\00F6pe\011Fin Kuzey topraklar\0131nda hayatta kal\0131\015F\0131n\0131 ve insan d\00FCnyas\0131na d\00F6n\00FC\015F\00FCn\00FC anlat\0131r. Vah\015Fetin \00C7a\011Fr\0131s\0131''n\0131n tamamlay\0131c\0131s\0131 niteli\011Finde bir do\011Fa ve uygarl\0131k roman\0131d\0131r.',
  U&'Klasik, Kurgu, Macera',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000347422-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Beyaz Di\015F'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Deniz Kurdu',
  U&'The Sea-Wolf',
  a.id,
  1904,
  368,
  U&'Deniz Kurdu; Kaptan Wolf Larsen''in zalim otoritesi alt\0131nda ge\00E7en bir deniz macera ve g\00FC\00E7 m\00FCcadelesi roman\0131d\0131r. Jack London, irade, ahlak ve hayatta kalmay\0131 sert bir denizde s\0131nar.',
  U&'Klasik, Kurgu, Macera',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000587748-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Deniz Kurdu'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Demir \00D6k\00E7e',
  U&'The Iron Heel',
  a.id,
  1908,
  320,
  U&'Demir \00D6k\00E7e; oligar\015Fik bir bask\0131 rejimine kar\015F\0131 y\00FCkselen toplumsal m\00FCcadeleyi anlatan erken bir distopyad\0131r. Jack London''\0131n siyasal vizyonunu en keskin bi\00E7imde ortaya koyar.',
  U&'Klasik, Kurgu, Distopya',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0001935597001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Demir \00D6k\00E7e'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Oyun',
  U&'The Game',
  a.id,
  1905,
  128,
  U&'Oyun; boks ringinin sert d\00FCnyas\0131nda a\015Fk, gurur ve bedensel m\00FCcadeleyi anlat\0131r. K\0131sa ama yo\011Fun bir Jack London roman\0131d\0131r.',
  U&'Klasik, Kurgu, Drama',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0002026951001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Oyun'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'K\0131z\0131l Veba',
  U&'The Scarlet Plague',
  a.id,
  1912,
  112,
  U&'K\0131z\0131l Veba; uygarl\0131\011F\0131 \00E7\00F6kerten bir salg\0131n sonras\0131 hayatta kalanlar\0131n d\00FCnyas\0131n\0131 anlat\0131r. Jack London''\0131n karanl\0131k bir gelecek tasviridir.',
  U&'Klasik, Bilimkurgu, Kurgu',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0001872902001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'K\0131z\0131l Veba'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Bir Kuzey Maceras\0131',
  U&'A Daughter of the Snows',
  a.id,
  1902,
  288,
  U&'Bir Kuzey Maceras\0131; Alaska''n\0131n sert co\011Frafyas\0131nda ge\00E7en bir macera ve karakter roman\0131d\0131r. Jack London''\0131n Kuzey anlat\0131lar\0131n\0131n erken \00F6rneklerindendir.',
  U&'Klasik, Kurgu, Macera',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0001744842001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Bir Kuzey Maceras\0131'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Ate\015F Yakmak',
  U&'To Build a Fire',
  a.id,
  1908,
  96,
  U&'Ate\015F Yakmak; Yukon so\011Fu\011Funda bir adam\0131n hayatta kalma m\00FCcadelesini anlatan \00FCnl\00FC \00F6yk\00FCd\00FCr. Do\011Fan\0131n ac\0131mas\0131zl\0131\011F\0131, Jack London''\0131n en \00E7arp\0131c\0131 k\0131sa anlat\0131lar\0131ndan birinde billurla\015F\0131r.',
  U&'Klasik, Kurgu, \00D6yk\00FC',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0001807404001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Ate\015F Yakmak'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Y\0131ld\0131z Gezgini',
  U&'The Star Rover',
  a.id,
  1915,
  320,
  U&'Y\0131ld\0131z Gezgini; hapishanedeki bir mahk\00FBmun bilin\00E7 yolculuklar\0131n\0131 anlatan s\0131rad\0131\015F\0131 bir romand\0131r. Jack London, beden ile ruh, zaman ile bellek aras\0131nda gezinir.',
  U&'Klasik, Kurgu, Fantastik',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000622480-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Y\0131ld\0131z Gezgini'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'\00C2demden \00D6nce',
  U&'Before Adam',
  a.id,
  1907,
  192,
  U&'\00C2demden \00D6nce; modern bir insan\0131n ilkel atalar\0131n\0131n d\00FCnyas\0131na dair r\00FCyalar\0131n\0131 anlat\0131r. Jack London, evrim ve kolektif bellek \00FCzerine spek\00FClatif bir hik\00E2ye kurar.',
  U&'Klasik, Kurgu, Fantastik',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0001801829001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'\00C2demden \00D6nce'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Cehennem Canavar\0131',
  U&'The Hell-Fire Club / The Abysmal Brute',
  a.id,
  1913,
  160,
  U&'Cehennem Canavar\0131; boks ve g\00F6steri d\00FCnyas\0131n\0131n karanl\0131k y\00FCz\00FCn\00FC anlatan bir Jack London roman\0131d\0131r. G\00FC\00E7, \015F\00F6hret ve manip\00FClasyon temalar\0131 \00F6ne \00E7\0131kar.',
  U&'Klasik, Kurgu, Drama',
  'eng',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0002206616001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Cehennem Canavar\0131'))
  );

COMMIT;

SELECT a.id AS author_id, a.name, COUNT(b.id) AS book_count
FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
GROUP BY a.id, a.name;

SELECT b.id, b.title, b.publication_year, left(b.cover_url, 70) AS cover, length(b.description) AS desc_len
FROM books b JOIN authors a ON a.id = b.author_id
WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))
ORDER BY b.publication_year DESC, b.title;
