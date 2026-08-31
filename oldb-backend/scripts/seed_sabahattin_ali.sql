-- Sabahattin Ali katalog seed (Türkçe)
-- Yükleme:
--   docker cp oldb-backend/scripts/seed_sabahattin_ali.sql my_postgres:/tmp/seed_sabahattin_ali.sql
--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_sabahattin_ali.sql

BEGIN;

INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Sabahattin Ali',
  U&'T\00FCrkiye',
  1907,
  1948,
  U&'https://ui-avatars.com/api/?name=Sabahattin+Ali&background=1a1a1a&color=d4af37&size=256',
  U&'Sabahattin Ali (1907\20131948), T\00FCrk edebiyat\0131n\0131n \00F6nde gelen \00F6yk\00FC ve roman yazarlar\0131ndand\0131r. Toplumsal ger\00E7ek\00E7ilik, bireysel yaln\0131zl\0131k ve adalet aray\0131\015F\0131n\0131 sade, g\00FC\00E7l\00FC bir dille i\015Fler. K\00FCrk Mantolu Madonna ve \0130\00E7imizdeki \015Eeytan ba\015Fl\0131ca eserleri aras\0131ndad\0131r.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Sabahattin Ali')));

UPDATE authors SET
  country = U&'T\00FCrkiye',
  birth_year = 1907,
  death_year = 1948,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Sabahattin+Ali&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Sabahattin Ali (1907\20131948), T\00FCrk edebiyat\0131n\0131n \00F6nde gelen \00F6yk\00FC ve roman yazarlar\0131ndand\0131r. Toplumsal ger\00E7ek\00E7ilik, bireysel yaln\0131zl\0131k ve adalet aray\0131\015F\0131n\0131 sade, g\00FC\00E7l\00FC bir dille i\015Fler. K\00FCrk Mantolu Madonna ve \0130\00E7imizdeki \015Eeytan ba\015Fl\0131ca eserleri aras\0131ndad\0131r.'
WHERE lower(trim(name)) = lower(trim(U&'Sabahattin Ali'));

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'K\00FCrk Mantolu Madonna',
  U&'K\00FCrk Mantolu Madonna',
  a.id,
  1943,
  160,
  U&'K\00FCrk Mantolu Madonna; Raif Efendi''nin Berlin''de tan\0131\015Ft\0131\011F\0131 Maria Puder''e duydu\011Fu sessiz ve derin a\015Fk\0131 anlat\0131r. Sabahattin Ali, yaln\0131zl\0131k, ka\00E7\0131r\0131lm\0131\015F mutluluk ve s\0131radan bir hayat\0131n i\00E7inde gizlenen b\00FCy\00FCk duygular\0131 sade bir dille i\015Fler.',
  U&'Klasik, Kurgu, Romantik',
  'tur',
  U&'https://covers.openlibrary.org/b/isbn/9789753638029-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'K\00FCrk Mantolu Madonna'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'\0130\00E7imizdeki \015Eeytan',
  U&'\0130\00E7imizdeki \015Eeytan',
  a.id,
  1940,
  272,
  U&'\0130\00E7imizdeki \015Eeytan; gen\00E7 ayd\0131n \00D6mer''in idealler, a\015Fk ve toplumsal bask\0131 aras\0131nda s\0131k\0131\015Fmas\0131n\0131 anlat\0131r. Sabahattin Ali, bireyin i\00E7indeki \00E7eli\015Fkiyi ve d\00F6nemin entelekt\00FCel iklimini keskin bir g\00F6zlemle yans\0131t\0131r.',
  U&'Klasik, Kurgu, Psikolojik',
  'tur',
  U&'https://covers.openlibrary.org/b/isbn/9789753638036-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'\0130\00E7imizdeki \015Eeytan'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Kuyucakl\0131 Yusuf',
  U&'Kuyucakl\0131 Yusuf',
  a.id,
  1937,
  224,
  U&'Kuyucakl\0131 Yusuf; Anadolu ta\015Fras\0131nda ge\00E7en bir yetimlik, adalet ve a\015Fk roman\0131d\0131r. Yusuf''un sert kaderi, feodal d\00FCzenin bask\0131s\0131 ve bireysel direni\015F \00FCzerinden anlat\0131l\0131r.',
  U&'Klasik, Kurgu, Drama',
  'tur',
  U&'https://covers.openlibrary.org/b/isbn/9789753638012-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Kuyucakl\0131 Yusuf'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'De\011Firmen',
  U&'De\011Firmen',
  a.id,
  1935,
  160,
  U&'De\011Firmen; Sabahattin Ali''nin erken d\00F6nem \00F6yk\00FClerini bir araya getirir. K\00F6y ve ta\015Fra hayat\0131ndan kesitlerle yoksulluk, haks\0131zl\0131k ve insan hallerini k\0131sa, \00E7arp\0131c\0131 anlat\0131mlarla i\015Fler.',
  U&'Klasik, Kurgu, \00D6yk\00FC',
  'tur',
  U&'https://covers.openlibrary.org/b/isbn/9789750802911-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'De\011Firmen'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Ka\011Fn\0131',
  U&'Ka\011Fn\0131',
  a.id,
  1936,
  128,
  U&'Ka\011Fn\0131; Anadolu insan\0131n\0131n g\00FCndelik m\00FCcadelesini ve toplumsal e\015Fitsizli\011Fi \00F6yk\00FC formunda anlat\0131r. Sabahattin Ali''nin sade \00FCslubu, g\00FC\00E7l\00FC g\00F6zlemle birle\015Fir.',
  U&'Klasik, Kurgu, \00D6yk\00FC',
  'tur',
  U&'https://covers.openlibrary.org/b/isbn/9789750802928-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Ka\011Fn\0131'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Ses',
  U&'Ses',
  a.id,
  1937,
  144,
  U&'Ses; Sabahattin Ali''nin \00F6yk\00FCc\00FCl\00FC\011F\00FCn\00FC peki\015Ftiren bir derlemedir. Bireysel yaln\0131zl\0131k, s\0131n\0131fsal gerilim ve g\00FCndelik hayat\0131n k\0131r\0131lganl\0131klar\0131 k\0131sa anlat\0131larda yank\0131lan\0131r.',
  U&'Klasik, Kurgu, \00D6yk\00FC',
  'tur',
  U&'https://covers.openlibrary.org/b/isbn/9789750802935-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Ses'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Yeni D\00FCnya',
  U&'Yeni D\00FCnya',
  a.id,
  1943,
  176,
  U&'Yeni D\00FCnya; sava\015F ve toplumsal de\011Fi\015Fim d\00F6neminin izlerini ta\015F\0131yan \00F6yk\00FClerden olu\015Fur. Sabahattin Ali, umut ile hayal k\0131r\0131kl\0131\011F\0131n\0131 ayn\0131 d\00FCzlemde tutarak insan\0131 merkeze al\0131r.',
  U&'Klasik, Kurgu, \00D6yk\00FC',
  'tur',
  U&'https://covers.openlibrary.org/b/isbn/9789753638043-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Yeni D\00FCnya'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'S\0131r\00E7a K\00F6\015Fk',
  U&'S\0131r\00E7a K\00F6\015Fk',
  a.id,
  1947,
  192,
  U&'S\0131r\00E7a K\00F6\015Fk; Sabahattin Ali''nin alegorik ve ele\015Ftirel anlat\0131lar\0131n\0131n \00F6ne \00E7\0131kt\0131\011F\0131 son d\00F6nem \00F6yk\00FC kitab\0131d\0131r. \0130ktidar, korku ve \00F6zg\00FCrl\00FCk temalar\0131 masals\0131 bir dilde i\015Flenir.',
  U&'Klasik, Kurgu, \00D6yk\00FC',
  'tur',
  U&'https://covers.openlibrary.org/b/isbn/9789753638050-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'S\0131r\00E7a K\00F6\015Fk'))
  );

COMMIT;

SELECT a.id AS author_id, a.name, COUNT(b.id) AS book_count
FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
GROUP BY a.id, a.name;

SELECT b.id, b.title, b.publication_year, b.genres, length(b.description) AS desc_len
FROM books b JOIN authors a ON a.id = b.author_id
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
ORDER BY b.publication_year DESC, b.title;
