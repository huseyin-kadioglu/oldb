-- Victor Hugo katalog seed (Türkçe)
-- Kapaklar: D&R (HAY = Hasan Ali Yücel; DR = D&R dünya klasiği baskısı)
-- Not: Sefiller ve Doksan Üç için D&R'da HAY baskısı bulunamadı; D&R Victor Hugo kapakları kullanıldı.
-- Yükleme:
--   docker cp oldb-backend/scripts/seed_victor_hugo.sql my_postgres:/tmp/seed_victor_hugo.sql
--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_victor_hugo.sql

BEGIN;

INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Victor Hugo',
  U&'Fransa',
  1802,
  1885,
  U&'https://ui-avatars.com/api/?name=Victor+Hugo&background=1a1a1a&color=d4af37&size=256',
  U&'Victor Hugo (1802\20131885), Frans\0131z romantizminin \00F6nde gelen \015Fair, romanc\0131 ve oyun yazarlar\0131ndand\0131r. Adalet, merhamet ve toplumsal e\015Fitsizlik temalar\0131n\0131 g\00FC\00E7l\00FC bir dille i\015Fler. Sefiller ve Notre-Dame''\0131n Kamburu ba\015Fl\0131ca eserleri aras\0131ndad\0131r.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Victor Hugo')));

UPDATE authors SET
  country = U&'Fransa',
  birth_year = 1802,
  death_year = 1885,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Victor+Hugo&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Victor Hugo (1802\20131885), Frans\0131z romantizminin \00F6nde gelen \015Fair, romanc\0131 ve oyun yazarlar\0131ndand\0131r. Adalet, merhamet ve toplumsal e\015Fitsizlik temalar\0131n\0131 g\00FC\00E7l\00FC bir dille i\015Fler. Sefiller ve Notre-Dame''\0131n Kamburu ba\015Fl\0131ca eserleri aras\0131ndad\0131r.'
WHERE lower(trim(name)) = lower(trim(U&'Victor Hugo'));

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Sefiller',
  U&'Les Mis\00E9rables',
  a.id,
  1862,
  1488,
  U&'Sefiller; Jean Valjean''\0131n kurtulu\015F aray\0131\015F\0131n\0131, Javert''in adalet tak\0131nt\0131s\0131n\0131 ve Paris''in toplumsal u\00E7urumunu anlatan epik bir romand\0131r. Victor Hugo''nun merhamet ve insan onuru \00FCzerine en kapsaml\0131 eseridir.',
  U&'Klasik, Kurgu, Drama',
  'fra',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0002092782001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Sefiller'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Notre-Dame''\0131n Kamburu',
  U&'Notre-Dame de Paris',
  a.id,
  1831,
  560,
  U&'Notre-Dame''\0131n Kamburu; Orta\00E7a\011F Paris''inde Quasimodo, Esmeralda ve Claude Frollo''nun kaderlerini anlat\0131r. Victor Hugo, a\015Fk, d\0131\015Flanma ve katedralin ruhunu romantik bir anlat\0131da birle\015Ftirir.',
  U&'Klasik, Kurgu, Drama',
  'fra',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000576984-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Notre-Dame''\0131n Kamburu'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Deniz \0130\015F\00E7ileri',
  U&'Les Travailleurs de la mer',
  a.id,
  1866,
  432,
  U&'Deniz \0130\015F\00E7ileri; Guernsey adas\0131nda ge\00E7en bir do\011Fa, emek ve fedak\00E2rl\0131k roman\0131d\0131r. Victor Hugo, insan\0131n denizle m\00FCcadelesini destans\0131 bir \00FCslupla anlat\0131r.',
  U&'Klasik, Kurgu, Macera',
  'fra',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0001837993001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Deniz \0130\015F\00E7ileri'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Bir \0130dam Mahk\00FBmunun Son G\00FCn\00FC',
  U&'Le Dernier Jour d''un condamn\00E9',
  a.id,
  1829,
  128,
  U&'Bir \0130dam Mahk\00FBmunun Son G\00FCn\00FC; idam cezas\0131n\0131 mahk\00FBmun bilincinden anlatan k\0131sa ama \00E7arp\0131c\0131 bir metindir. Victor Hugo''nun adalet ele\015Ftirisinin erken ve g\00FC\00E7l\00FC \00F6rneklerindendir.',
  U&'Klasik, Kurgu, Drama',
  'fra',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000567743-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Bir \0130dam Mahk\00FBmunun Son G\00FCn\00FC'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Doksan \00DC\00E7',
  U&'Quatrevingt-treize',
  a.id,
  1874,
  448,
  U&'Doksan \00DC\00E7; Frans\0131z Devrimi''nin en \015Fiddetli y\0131l\0131nda ge\00E7en bir tarih ve vicdan roman\0131d\0131r. Victor Hugo, idealler ile insanl\0131k aras\0131ndaki gerilimi kanl\0131 bir co\011Frafyada i\015Fler.',
  U&'Klasik, Kurgu, Tarih',
  'fra',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0002002886001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Doksan \00DC\00E7'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Ni\015Fanl\0131ya Mektuplar',
  U&'Lettres \00E0 la fianc\00E9e',
  a.id,
  1822,
  240,
  U&'Ni\015Fanl\0131ya Mektuplar; Victor Hugo''nun Ad\00E8le Foucher''ye yazd\0131\011F\0131 mektuplardan olu\015Fur. Gen\00E7lik a\015Fk\0131, edebiyat tutkusu ve d\00F6nem Paris''inin izlerini ta\015F\0131r.',
  U&'Klasik, Kurgu D\0131\015F\0131, An\0131',
  'fra',
  U&'https://i.dr.com.tr/cache/600x600-0/originals/0001983079001-1.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Ni\015Fanl\0131ya Mektuplar'))
  );

COMMIT;

SELECT a.id AS author_id, a.name, COUNT(b.id) AS book_count
FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
GROUP BY a.id, a.name;

SELECT b.id, b.title, b.publication_year, length(b.description) AS desc_len,
  substring(b.cover_url from 'originals/([0-9]+)-') AS urunno
FROM books b JOIN authors a ON a.id = b.author_id
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
ORDER BY b.publication_year DESC, b.title;
