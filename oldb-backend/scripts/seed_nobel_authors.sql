-- Nobel authors: Pamuk, García Márquez, Hemingway
-- Book flags stay false; author won_nobel_prize / nobel_year set

BEGIN;

-- Orhan Pamuk (Nobel 2006)
INSERT INTO authors (name, country, birth_year, death_year, portrait, description, won_nobel_prize, nobel_year)
SELECT
  U&'Orhan Pamuk', U&'T\00FCrkiye', 1952, NULL,
  U&'https://ui-avatars.com/api/?name=Orhan+Pamuk&background=1a1a1a&color=d4af37&size=256', U&'Orhan Pamuk (1952\2013), T\00FCrk romanc\0131 ve 2006 Nobel Edebiyat \00D6d\00FCl\00FC sahibidir. \0130stanbul, kimlik, Do\011Fu-Bat\0131 gerilimi ve anlat\0131n\0131n kendisi \00FCzerine yazd\0131\011F\0131 romanlarla d\00FCnya \00E7ap\0131nda tan\0131n\0131r. Benim Ad\0131m K\0131rm\0131z\0131, Kara Kitap ve Masumiyet M\00FCzesi en bilinen eserleri aras\0131ndad\0131r.', true, 2006
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Orhan Pamuk')));

UPDATE authors SET
  country = U&'T\00FCrkiye', birth_year = 1952, death_year = NULL,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Orhan+Pamuk&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Orhan Pamuk (1952\2013), T\00FCrk romanc\0131 ve 2006 Nobel Edebiyat \00D6d\00FCl\00FC sahibidir. \0130stanbul, kimlik, Do\011Fu-Bat\0131 gerilimi ve anlat\0131n\0131n kendisi \00FCzerine yazd\0131\011F\0131 romanlarla d\00FCnya \00E7ap\0131nda tan\0131n\0131r. Benim Ad\0131m K\0131rm\0131z\0131, Kara Kitap ve Masumiyet M\00FCzesi en bilinen eserleri aras\0131ndad\0131r.',
  won_nobel_prize = true, nobel_year = 2006
WHERE lower(trim(name)) = lower(trim(U&'Orhan Pamuk'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Benim Ad\0131m K\0131rm\0131z\0131', U&'Benim Ad\0131m K\0131rm\0131z\0131', a.id, 1998, 472,
  U&'Benim Ad\0131m K\0131rm\0131z\0131; 16. y\00FCzy\0131l \0130stanbul''unda minyat\00FCr sanat\00E7\0131lar\0131, cinayet ve a\015Fk\0131 i\00E7 i\00E7e anlat\0131r. Pamuk''un Nobel''e giden yolundaki ba\015Fyap\0131tlar\0131ndan biridir.', U&'Kurgu, Tarih, Polisiye', 'tur', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000451871-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Orhan Pamuk'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Benim Ad\0131m K\0131rm\0131z\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kara Kitap', U&'Kara Kitap', a.id, 1990, 480,
  U&'Kara Kitap; kaybolan e\015Finin pe\015Fine d\00FC\015Fen bir avukat\0131n \0130stanbul labirentinde kimlik aray\0131\015F\0131n\0131 anlat\0131r. Pamuk''un en katmanl\0131 ve \015Fehirli romanlar\0131ndan biridir.', U&'Kurgu, Gizem, \0130stanbul', 'tur', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000550644-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Orhan Pamuk'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kara Kitap')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Masumiyet M\00FCzesi', U&'Masumiyet M\00FCzesi', a.id, 2008, 592,
  U&'Masumiyet M\00FCzesi; bir a\015Fk\0131n ve koleksiyon tutkusunun \0130stanbul''unda ge\00E7en roman\0131d\0131r. Nesne, bellek ve arzu Pamuk''un ge\00E7 d\00F6neminin duygusal yo\011Funlu\011Funu ta\015F\0131r.', U&'Kurgu, A\015Fk, \0130stanbul', 'tur', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000550626-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Orhan Pamuk'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Masumiyet M\00FCzesi')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kar', U&'Kar', a.id, 2002, 480,
  U&'Kar; Kars''a kar alt\0131nda gelen bir \015Fairin siyaset, inan\00E7 ve a\015Fkla y\00FCzle\015Fmesini anlat\0131r. Pamuk''un T\00FCrkiye''nin gerilimlerini do\011Frudan ele ald\0131\011F\0131 roman\0131d\0131r.', U&'Kurgu, Siyaset, Drama', 'tur', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000451872-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Orhan Pamuk'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kar')));

-- Gabriel García Márquez (Nobel 1982)
INSERT INTO authors (name, country, birth_year, death_year, portrait, description, won_nobel_prize, nobel_year)
SELECT
  U&'Gabriel Garc\00EDa M\00E1rquez', U&'Kolombiya', 1927, 2014,
  U&'https://ui-avatars.com/api/?name=Gabriel+Garcia+Marquez&background=1a1a1a&color=d4af37&size=256', U&'Gabriel Garc\00EDa M\00E1rquez (1927\20132014), Kolombiyal\0131 romanc\0131 ve 1982 Nobel Edebiyat \00D6d\00FCl\00FC sahibidir. B\00FCy\00FCl\00FC ger\00E7ek\00E7ilik ak\0131m\0131n\0131n usta ismi; Y\00FCzy\0131ll\0131k Yaln\0131zl\0131k ile Latin Amerika edebiyat\0131n\0131 d\00FCnyaya a\00E7m\0131\015Ft\0131r. Aile efsaneleri, siyaset ve a\015Fk\0131 \015Fiirsel bir dille birle\015Ftirir.', true, 1982
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Gabriel Garc\00EDa M\00E1rquez')));

UPDATE authors SET
  country = U&'Kolombiya', birth_year = 1927, death_year = 2014,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Gabriel+Garcia+Marquez&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Gabriel Garc\00EDa M\00E1rquez (1927\20132014), Kolombiyal\0131 romanc\0131 ve 1982 Nobel Edebiyat \00D6d\00FCl\00FC sahibidir. B\00FCy\00FCl\00FC ger\00E7ek\00E7ilik ak\0131m\0131n\0131n usta ismi; Y\00FCzy\0131ll\0131k Yaln\0131zl\0131k ile Latin Amerika edebiyat\0131n\0131 d\00FCnyaya a\00E7m\0131\015Ft\0131r. Aile efsaneleri, siyaset ve a\015Fk\0131 \015Fiirsel bir dille birle\015Ftirir.',
  won_nobel_prize = true, nobel_year = 1982
WHERE lower(trim(name)) = lower(trim(U&'Gabriel Garc\00EDa M\00E1rquez'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Y\00FCzy\0131ll\0131k Yaln\0131zl\0131k', U&'Cien a\00F1os de soledad', a.id, 1967, 464,
  U&'Y\00FCzy\0131ll\0131k Yaln\0131zl\0131k; Buend\00EDa ailesinin Macondo''daki ku\015Faklar boyu hik\00E2yesini anlat\0131r. B\00FCy\00FCl\00FC ger\00E7ek\00E7ili\011Fin ba\015Fyap\0131t\0131 ve 20. y\00FCzy\0131l edebiyat\0131n\0131n d\00F6n\00FCm noktalar\0131ndan biridir.', U&'Klasik, Kurgu, B\00FCy\00FCl\00FC Ger\00E7ek\00E7ilik', 'spa', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000064137-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Gabriel Garc\00EDa M\00E1rquez'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Y\00FCzy\0131ll\0131k Yaln\0131zl\0131k')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kolera G\00FCnlerinde A\015Fk', U&'El amor en los tiempos del c\00F3lera', a.id, 1985, 432,
  U&'Kolera G\00FCnlerinde A\015Fk; yar\0131m y\00FCzy\0131l s\00FCren bir a\015Fk\0131n sab\0131r, ya\015Fl\0131l\0131k ve kaderle imtihan\0131n\0131 anlat\0131r. Garc\00EDa M\00E1rquez''in en dokunakl\0131 romanlar\0131ndan biridir.', U&'Klasik, Kurgu, A\015Fk', 'spa', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002189824001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Gabriel Garc\00EDa M\00E1rquez'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kolera G\00FCnlerinde A\015Fk')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'K\0131rm\0131z\0131 Pazartesi', U&'Cr\00F3nica de una muerte anunciada', a.id, 1981, 128,
  U&'K\0131rm\0131z\0131 Pazartesi; herkesin bildi\011Fi bir cinayetin \00F6ncesini kronikle\015Ftirir. Kader, onur ve kolektif su\00E7 ortakl\0131\011F\0131 \00FCzerine k\0131sa ama keskin bir romand\0131r.', U&'Klasik, Kurgu, Gerilim', 'spa', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000064101-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Gabriel Garc\00EDa M\00E1rquez'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'K\0131rm\0131z\0131 Pazartesi')));

-- Ernest Hemingway (Nobel 1954)
INSERT INTO authors (name, country, birth_year, death_year, portrait, description, won_nobel_prize, nobel_year)
SELECT
  U&'Ernest Hemingway', U&'ABD', 1899, 1961,
  U&'https://ui-avatars.com/api/?name=Ernest+Hemingway&background=1a1a1a&color=d4af37&size=256', U&'Ernest Hemingway (1899\20131961), Amerikal\0131 romanc\0131, \00F6yk\00FCc\00FC ve 1954 Nobel Edebiyat \00D6d\00FCl\00FC sahibidir. Yal\0131n \00FCslubu, sava\015F, avc\0131l\0131k ve erkeklik temalar\0131yla modern Amerikan edebiyat\0131n\0131 bi\00E7imlendirmi\015Ftir. Ya\015Fl\0131 Adam ve Deniz, Silahlara Veda ve G\00FCne\015F de Do\011Far klasikle\015Fmi\015F eserleridir.', true, 1954
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Ernest Hemingway')));

UPDATE authors SET
  country = U&'ABD', birth_year = 1899, death_year = 1961,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Ernest+Hemingway&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Ernest Hemingway (1899\20131961), Amerikal\0131 romanc\0131, \00F6yk\00FCc\00FC ve 1954 Nobel Edebiyat \00D6d\00FCl\00FC sahibidir. Yal\0131n \00FCslubu, sava\015F, avc\0131l\0131k ve erkeklik temalar\0131yla modern Amerikan edebiyat\0131n\0131 bi\00E7imlendirmi\015Ftir. Ya\015Fl\0131 Adam ve Deniz, Silahlara Veda ve G\00FCne\015F de Do\011Far klasikle\015Fmi\015F eserleridir.',
  won_nobel_prize = true, nobel_year = 1954
WHERE lower(trim(name)) = lower(trim(U&'Ernest Hemingway'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ya\015Fl\0131 Adam ve Deniz', U&'The Old Man and the Sea', a.id, 1952, 128,
  U&'Ya\015Fl\0131 Adam ve Deniz; ya\015Fl\0131 bir K\00FCbal\0131 bal\0131k\00E7\0131n\0131n b\00FCy\00FCk bal\0131kla m\00FCcadelesini anlat\0131r. Hemingway''in Nobel''e giden yolundaki en bilinen novellas\0131d\0131r.', U&'Klasik, Kurgu, Novella', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000213528-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Ernest Hemingway'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ya\015Fl\0131 Adam ve Deniz')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Silahlara Veda', U&'A Farewell to Arms', a.id, 1929, 352,
  U&'Silahlara Veda; I. D\00FCnya Sava\015F\0131''nda bir ambulans \015Fof\00F6r\00FC ile hem\015Firenin a\015Fk\0131n\0131 anlat\0131r. Sava\015F\0131n abs\00FCrtl\00FC\011F\00FC ve bireysel ka\00E7\0131\015F Hemingway''in erken ba\015Fyap\0131t\0131d\0131r.', U&'Klasik, Kurgu, Sava\015F', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000291510-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Ernest Hemingway'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Silahlara Veda')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'G\00FCne\015F de Do\011Far', U&'The Sun Also Rises', a.id, 1926, 272,
  U&'G\00FCne\015F de Do\011Far; Kay\0131p Ku\015Fak''\0131n Paris ve \0130spanya''daki bohem ya\015Fam\0131n\0131 anlat\0131r. Hemingway''in ilk b\00FCy\00FCk roman\0131 ve modern Amerikan edebiyat\0131n\0131n d\00F6n\00FCm noktas\0131d\0131r.', U&'Klasik, Kurgu, Drama', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000063222-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Ernest Hemingway'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'G\00FCne\015F de Do\011Far')));

COMMIT;

SELECT name, won_nobel_prize, nobel_year FROM authors WHERE won_nobel_prize ORDER BY nobel_year;
SELECT a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE a.name IN (U&'Orhan Pamuk', U&'Gabriel Garc\00EDa M\00E1rquez', U&'Ernest Hemingway')
GROUP BY a.name ORDER BY a.name;
