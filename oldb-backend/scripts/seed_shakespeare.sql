-- William Shakespeare katalog seed (Türkçe)
-- Yükleme:
--   docker cp oldb-backend/scripts/seed_shakespeare.sql my_postgres:/tmp/seed_shakespeare.sql
--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_shakespeare.sql

BEGIN;

INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'William Shakespeare',
  U&'\0130ngiltere',
  1564,
  1616,
  U&'https://upload.wikimedia.org/wikipedia/commons/a/a2/Shakespeare.jpg',
  U&'William Shakespeare (1564\20131616), \0130ngiliz edebiyat\0131n\0131n en etkili oyun yazarlar\0131ndan ve \015Fairlerindendir. Trajedi, komedi ve tarih oyunlar\0131yla modern tiyatronun temelini atm\0131\015F; Hamlet, Romeo ve Juliet, Macbeth gibi eserleriyle evrensel temalar\0131 i\015Flemi\015Ftir.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'William Shakespeare')));

UPDATE authors SET
  country = U&'\0130ngiltere',
  birth_year = 1564,
  death_year = 1616,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://upload.wikimedia.org/wikipedia/commons/a/a2/Shakespeare.jpg'),
  description = U&'William Shakespeare (1564\20131616), \0130ngiliz edebiyat\0131n\0131n en etkili oyun yazarlar\0131ndan ve \015Fairlerindendir. Trajedi, komedi ve tarih oyunlar\0131yla modern tiyatronun temelini atm\0131\015F; Hamlet, Romeo ve Juliet, Macbeth gibi eserleriyle evrensel temalar\0131 i\015Flemi\015Ftir.'
WHERE lower(trim(name)) = lower(trim(U&'William Shakespeare'));

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Hamlet',
  U&'Hamlet',
  a.id,
  1601,
  320,
  U&'Hamlet; Danimarka prensinin babas\0131n\0131n \00F6ld\00FCr\00FCl\00FC\015F\00FCn\00FCn ard\0131ndan intikam, vicdan ve delilik aras\0131nda s\0131k\0131\015Fmas\0131n\0131 anlat\0131r. Shakespeare''in en derin psikolojik trajedilerinden biridir.',
  U&'Klasik, Drama, Trajedi',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128540-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Hamlet'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Romeo ve Juliet',
  U&'Romeo and Juliet',
  a.id,
  1595,
  256,
  U&'Romeo ve Juliet; Verona''da d\00FC\015Fman iki ailenin \00E7ocuklar\0131 aras\0131ndaki imk\00E2ns\0131z a\015Fk\0131 anlat\0131r. Tutku, kader ve gen\00E7li\011Fin trajedisi, Shakespeare''in en bilinen oyunlar\0131ndan birinde bulu\015Fur.',
  U&'Klasik, Drama, Romantik',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128571-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Romeo ve Juliet'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Macbeth',
  U&'Macbeth',
  a.id,
  1606,
  240,
  U&'Macbeth; iktidar h\0131rs\0131, kehanet ve su\00E7un ruhsal y\0131k\0131m\0131n\0131 anlatan karanl\0131k bir trajedidir. Ambisyon ile vicdan \00E7at\0131\015Fmas\0131, Shakespeare''in en yo\011Fun politik oyunlar\0131ndan birinde y\00FCkselir.',
  U&'Klasik, Drama, Trajedi',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128564-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Macbeth'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Kral Lear',
  U&'King Lear',
  a.id,
  1606,
  320,
  U&'Kral Lear; ya\015Fl\0131 bir kral\0131n krall\0131\011F\0131n\0131 k\0131zlar\0131 aras\0131nda payla\015Ft\0131rmas\0131yla ba\015Flayan g\00FC\00E7, ihanet ve delilik trajedisidir. Aile ba\011Flar\0131 ve adalet, f\0131rt\0131nal\0131 bir d\00FCnyada s\0131nan\0131r.',
  U&'Klasik, Drama, Trajedi',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128557-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Kral Lear'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Othello',
  U&'Othello',
  a.id,
  1604,
  288,
  U&'Othello; k\0131skan\00E7l\0131k, \0131rk\00E7\0131l\0131k ve manip\00FClasyonun y\0131k\0131c\0131 g\00FCc\00FCn\00FC anlat\0131r. Iago''nun entrikalar\0131, Othello ile Desdemona''n\0131n a\015Fk\0131n\0131 trajediye s\00FCr\00FCkler.',
  U&'Klasik, Drama, Trajedi',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128588-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Othello'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'F\0131rt\0131na',
  U&'The Tempest',
  a.id,
  1611,
  224,
  U&'F\0131rt\0131na; Prospero''nun ada \00FCzerindeki b\00FCy\00FC, intikam ve ba\011F\0131\015Flama yolculu\011Funu anlat\0131r. Shakespeare''in ge\00E7 d\00F6nem oyunlar\0131ndan biri olarak \00F6zg\00FCrl\00FCk ve g\00FC\00E7 temalar\0131n\0131 i\015Fler.',
  U&'Klasik, Drama, Fantastik',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128632-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'F\0131rt\0131na'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Bir Yaz Gecesi R\00FCyas\0131',
  U&'A Midsummer Night''s Dream',
  a.id,
  1595,
  192,
  U&'Bir Yaz Gecesi R\00FCyas\0131; a\015Fk, b\00FCy\00FC ve kimlik karma\015Fas\0131n\0131 orman perileriyle i\00E7 i\00E7e anlatan ne\015Feli bir komedidir. Shakespeare''in en sevimli oyunlar\0131ndan biridir.',
  U&'Klasik, Drama, Komedi',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128595-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Bir Yaz Gecesi R\00FCyas\0131'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Venedik Taciri',
  U&'The Merchant of Venice',
  a.id,
  1596,
  224,
  U&'Venedik Taciri; bor\00E7, adalet ve merhamet \00FCzerine kurulu bir oyundur. Shylock''un davas\0131, Shakespeare''in en tart\0131\015Fmal\0131 ve g\00FC\00E7l\00FC sahnelerinden baz\0131lar\0131n\0131 bar\0131nd\0131r\0131r.',
  U&'Klasik, Drama, Komedi',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128601-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Venedik Taciri'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Julius Caesar',
  U&'Julius Caesar',
  a.id,
  1599,
  240,
  U&'Julius Caesar; siyasi entrika, ihanet ve retorik g\00FCc\00FCn\00FC Roma''n\0131n kalbinde anlat\0131r. Brutus''un ikilemi, iktidar\0131n bedelini sorgulayan klasik bir trajedi-tarih oyunudur.',
  U&'Klasik, Drama, Tarih',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128618-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Julius Caesar'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'On \0130kinci Gece',
  U&'Twelfth Night',
  a.id,
  1601,
  208,
  U&'On ikinci Gece; kimlik kar\0131\015F\0131kl\0131\011F\0131, a\015Fk ve karnaval atmosferiyle \00F6r\00FCl\00FC bir komedidir. Viola''n\0131n k\0131l\0131k de\011Fi\015Ftirmesi, Shakespeare''in en zarif ve e\011Flenceli oyunlar\0131ndan birini do\011Furur.',
  U&'Klasik, Drama, Komedi',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128625-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'On \0130kinci Gece'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Soneler',
  U&'Shakespeare''s Sonnets',
  a.id,
  1609,
  192,
  U&'Soneler; zaman, g\00FCzellik, a\015Fk ve \00F6l\00FCms\00FCzl\00FCk \00FCzerine 154 \015Fiiri bir araya getirir. Shakespeare''in lirik ustal\0131\011F\0131n\0131n en yo\011Fun \00F6rneklerinden biridir.',
  U&'Klasik, \015Eiir',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128649-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Soneler'))
  );

INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'),
  U&'Antonius ve Kleopatra',
  U&'Antony and Cleopatra',
  a.id,
  1607,
  320,
  U&'Antonius ve Kleopatra; siyaset ile tutkunun \00E7at\0131\015Fmas\0131n\0131 Roma ve M\0131s\0131r aras\0131nda anlat\0131r. \0130ki b\00FCy\00FCk fig\00FCr\00FCn a\015Fk\0131, imparatorluklar\0131n kaderiyle i\00E7 i\00E7e ge\00E7er.',
  U&'Klasik, Drama, Trajedi',
  'eng',
  U&'https://covers.openlibrary.org/b/isbn/9780143128652-L.jpg',
  false, false, false, false,
  NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
  AND NOT EXISTS (
    SELECT 1 FROM books bx
    WHERE bx.author_id = a.id
      AND lower(trim(bx.title)) = lower(trim(U&'Antonius ve Kleopatra'))
  );

COMMIT;

SELECT a.id AS author_id, a.name, COUNT(b.id) AS book_count
FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
GROUP BY a.id, a.name;

SELECT b.id, b.title, b.publication_year, b.genres, length(b.description) AS desc_len
FROM books b JOIN authors a ON a.id = b.author_id
WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))
ORDER BY b.publication_year DESC, b.title;
