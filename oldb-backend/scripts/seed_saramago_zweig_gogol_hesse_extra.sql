-- Extra: Saramago, Zweig, Gogol, Hesse (D&R covers, TR blurbs)
-- Not: Gogol Delinin Hatıra Defteri zaten var — tekrar eklenmedi.
-- docker cp oldb-backend/scripts/seed_saramago_zweig_gogol_hesse_extra.sql my_postgres:/tmp/seed_extra3.sql
-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_extra3.sql

BEGIN;

-- José Saramago — Bütün İsimler
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'B\00FCt\00FCn \0130simler', U&'Todos os Nomes', a.id, 1997, 272,
  U&'B\00FCt\00FCn \0130simler; n\00FCfus dairesinde \00E7al\0131\015Fan s\0131radan bir memurun, bir dosyadaki kad\0131n\0131n pe\015Fine d\00FC\015Fmesini anlat\0131r. Saramago, kimlik, b\00FCrokrasi ve arzuyu labirentimsi bir anlat\0131yla birle\015Ftirir. K\00F6rl\00FCk sonras\0131 d\00F6neminin en g\00FC\00E7l\00FC romanlar\0131ndan biridir.', U&'Klasik, Kurgu, Felsefe', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000388760-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'B\00FCt\00FCn \0130simler')));

-- José Saramago — Kopyalanmış Adam
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kopyalanm\0131\015F Adam', U&'O Homem Duplicado', a.id, 2002, 320,
  U&'Kopyalanm\0131\015F Adam; bir tarih \00F6\011Fretmeninin kendisinin birebir kopyas\0131yla kar\015F\0131la\015Fmas\0131n\0131 anlat\0131r. Kimlik, k\0131skan\00E7l\0131k ve ''\00F6teki ben'' temas\0131 \00FCzerine gerilimli, keskin bir romand\0131r. Saramago''nun ge\00E7 d\00F6neminin en ak\0131c\0131 ve sinematik eserlerindendir.', U&'Klasik, Kurgu, Gerilim', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001553110002-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kopyalanm\0131\015F Adam')));

-- José Saramago — Lizbon Kuşatmasının Tarihi
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Lizbon Ku\015Fatmas\0131n\0131n Tarihi', U&'Hist\00F3ria do Cerco de Lisboa', a.id, 1989, 368,
  U&'Lizbon Ku\015Fatmas\0131n\0131n Tarihi; bir d\00FCzeltmenin tek bir kelimeyle tarihi yeniden yazmas\0131n\0131 anlat\0131r. Ger\00E7ek ile kurgu, ge\00E7mi\015F ile \015Fimdi i\00E7 i\00E7e ge\00E7er. Saramago''nun tarih, dil ve a\015Fk \00FCzerine en zekice kurulmu\015F romanlar\0131ndan biridir.', U&'Klasik, Kurgu, Tarih', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000705702-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Lizbon Ku\015Fatmas\0131n\0131n Tarihi')));

-- José Saramago — Taş Sal
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ta\015F Sal', U&'A Jangada de Pedra', a.id, 1986, 336,
  U&'Ta\015F Sal; \0130ber Yar\0131madas\0131''n\0131n Avrupa''dan kopup Atlas Okyanusu''nda y\00FCzmeye ba\015Flamas\0131n\0131 anlat\0131r. Jeopolitik alegori, yolculuk ve kimlik aray\0131\015F\0131 bir aradad\0131r. Saramago''nun en cesur ve \015Fiirsel romanlar\0131ndan biridir.', U&'Klasik, Kurgu, Fantastik', 'por', U&'https://covers.openlibrary.org/b/id/8176060-L.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ta\015F Sal')));

-- Stefan Zweig — Sabırsız Yürek
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Sab\0131rs\0131z Y\00FCrek', U&'Ungeduld des Herzens', a.id, 1939, 416,
  U&'Sab\0131rs\0131z Y\00FCrek; I. D\00FCnya Sava\015F\0131 \00F6ncesi bir garnizon kasabas\0131nda, gen\00E7 bir te\011Fmenin fel\00E7li bir k\0131za duydu\011Fu ac\0131ma ile a\015Fk aras\0131ndaki \00E7izgiyi anlat\0131r. Zweig''\0131n tek tamamlanm\0131\015F uzun roman\0131d\0131r. Vicdan, yan\0131lg\0131 ve trajik sonu\00E7lar\0131yla yazar\0131n en \00F6nemli eserlerinden biri kabul edilir.', U&'Klasik, Kurgu, Drama', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002186377001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Sab\0131rs\0131z Y\00FCrek')));

-- Stefan Zweig — Mecburiyet
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Mecburiyet', U&'Der Zwang', a.id, 1920, 96,
  U&'Mecburiyet; sava\015F \00E7a\011Fr\0131s\0131 alan bir sanat\00E7\0131n\0131n vicdan\0131 ile yurtta\015Fl\0131k bask\0131s\0131 aras\0131nda s\0131k\0131\015Fmas\0131n\0131 anlat\0131r. Zweig''\0131n pasifizmini ve bireysel \00F6zg\00FCrl\00FCk kayg\0131s\0131n\0131 yo\011Fun bir novellada toplar. K\0131sa ama sars\0131c\0131 bir ahlaki gerilim metnidir.', U&'Klasik, Kurgu, Novella', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001909760001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Mecburiyet')));

-- Stefan Zweig — Marie Antoinette
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Marie Antoinette', U&'Marie Antoinette', a.id, 1932, 560,
  U&'Marie Antoinette; Frans\0131z krali\00E7esinin y\00FCkseli\015Fini, Versailles''\0131 ve giyotine giden yolunu psikolojik bir portreyle anlat\0131r. Zweig, tarih\00EE olaylar\0131 bireysel trajediye \00E7evirir. Maria Stuart ile birlikte yazar\0131n en kapsaml\0131 biyografik eserlerindendir.', U&'Klasik, Biyografi, Tarih', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000225408-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Marie Antoinette')));

-- Nikolay Gogol — Dikanka Yakınlarında Bir Çiftlikte Akşam Toplantıları
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Dikanka Yak\0131nlar\0131nda Bir \00C7iftlikte Ak\015Fam Toplant\0131lar\0131', U&'\0412\0435\0447\0435\0440\0430 \043D\0430 \0445\0443\0442\043E\0440\0435 \0431\043B\0438\0437 \0414\0438\043A\0430\043D\044C\043A\0438', a.id, 1832, 320,
  U&'Dikanka Yak\0131nlar\0131nda Bir \00C7iftlikte Ak\015Fam Toplant\0131lar\0131; Ukrayna halk masallar\0131, \015Feytan, a\015Fk ve ta\015Fra mizah\0131n\0131 bir araya getirir. Gogol''un erken d\00F6neminin parlak, renkli ve folklorik derlemesidir. Rus edebiyat\0131nda fantastik \00F6yk\00FCn\00FCn kap\0131s\0131n\0131 aralayan temel kitaplardan biridir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002231870001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Dikanka Yak\0131nlar\0131nda Bir \00C7iftlikte Ak\015Fam Toplant\0131lar\0131')));

-- Nikolay Gogol — Arabeskler
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Arabeskler', U&'\0410\0440\0430\0431\0435\0441\043A\0438', a.id, 1835, 288,
  U&'Arabeskler; \00F6yk\00FC, deneme ve sanat yaz\0131lar\0131n\0131 bir araya getiren bir derlemedir. Nevski Bulvar\0131 ve Portre gibi Petersburg metinlerinin de yer ald\0131\011F\0131 bu kitap, Gogol''un sanat ve \015Fehir \00FCzerine d\00FC\015F\00FCncelerinin erken bir toplam\0131d\0131r.', U&'Klasik, Kurgu, Deneme', 'rus', U&'https://covers.openlibrary.org/b/id/4383158-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Arabeskler')));

-- Nikolay Gogol — Evlenme
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Evlenme', U&'\0416\0435\043D\0438\0442\044C\0431\0430', a.id, 1842, 96,
  U&'Evlenme; evlenmek isteyen ama karar veremeyen bir memurun komedisini anlat\0131r. Gogol, evlilik pazarl\0131\011F\0131n\0131 abs\00FCrt diyaloglarla hicveder. M\00FCfetti\015F ile birlikte sahne edebiyat\0131n\0131n en bilinen eserlerindendir.', U&'Klasik, Drama, Komedi', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000253613-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Evlenme')));

-- Nikolay Gogol — Kumarbazlar
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kumarbazlar', U&'\0418\0433\0440\043E\043A\0438', a.id, 1842, 80,
  U&'Kumarbazlar; doland\0131r\0131c\0131lar\0131n birbirini kand\0131rmaya \00E7al\0131\015Ft\0131\011F\0131 bir komedidir. Gogol, sahtek\00E2rl\0131k ve a\00E7g\00F6zl\00FCl\00FC\011F\00FC sahne \00FCzerinde e\011Flenceli bir labirentte toplar. K\0131sa, keskin ve tiyatroda s\0131k sahnelenen bir metindir.', U&'Klasik, Drama, Komedi', 'rus', U&'https://covers.openlibrary.org/b/id/8226191-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kumarbazlar')));

-- Hermann Hesse — Peter Camenzind
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Peter Camenzind', U&'Peter Camenzind', a.id, 1904, 192,
  U&'Peter Camenzind; do\011Fayla i\00E7 i\00E7e b\00FCy\00FCyen bir gencin yazarl\0131k, dostluk ve a\015Fk aray\0131\015F\0131n\0131 anlat\0131r. Hesse''nin ilk roman\0131, sonraki t\00FCm temalar\0131n\0131n tohumlar\0131n\0131 ta\015F\0131r. Da\011Flar, g\00F6ller ve yaln\0131zl\0131k; yazar\0131n \015Fiirsel ger\00E7ek\00E7ili\011Finin erken \00F6rne\011Fidir.', U&'Klasik, Kurgu, Drama', 'deu', U&'https://covers.openlibrary.org/b/id/10795701-L.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Peter Camenzind')));

-- Hermann Hesse — Gertrud
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Gertrud', U&'Gertrud', a.id, 1910, 208,
  U&'Gertrud; topal bir bestecinin a\015Fk, k\0131skan\00E7l\0131k ve sanat aras\0131ndaki gerilimini anlat\0131r. M\00FCzik ve kader, Hesse''nin erken d\00F6neminin duygusal yo\011Funlu\011Funu ta\015F\0131r. Sanat\00E7\0131 roman\0131 olarak Rosshalde ile akrabad\0131r.', U&'Klasik, Kurgu, Drama', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000135600-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Gertrud')));

-- Hermann Hesse — Klingsor'un Son Yazı
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Klingsor''un Son Yaz\0131', U&'Klingsors letzter Sommer', a.id, 1920, 128,
  U&'Klingsor''un Son Yaz\0131; bir ressam\0131n son yaz\0131ndaki yarat\0131c\0131 co\015Fku, dostluk ve \00F6l\00FCm bilincini anlat\0131r. Renk, \015Farap ve Akdeniz \0131\015F\0131\011F\0131yla dolu k\0131sa ama yo\011Fun bir novellad\0131r. Hesse''nin sanat\00E7\0131 portrelerinin en parlaklar\0131ndand\0131r.', U&'Klasik, Kurgu, Novella', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001983215001-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Klingsor''un Son Yaz\0131')));

COMMIT;

SELECT a.name, b.title FROM authors a JOIN books b ON b.author_id = a.id
WHERE a.name IN (U&'José Saramago', U&'Stefan Zweig', U&'Nikolay Gogol', U&'Hermann Hesse')
  AND b.title IN (
    U&'B\00FCt\00FCn \0130simler',
    U&'Kopyalanm\0131\015F Adam',
    U&'Lizbon Ku\015Fatmas\0131n\0131n Tarihi',
    U&'Ta\015F Sal',
    U&'Sab\0131rs\0131z Y\00FCrek',
    U&'Mecburiyet',
    U&'Marie Antoinette',
    U&'Dikanka Yak\0131nlar\0131nda Bir \00C7iftlikte Ak\015Fam Toplant\0131lar\0131',
    U&'Arabeskler',
    U&'Evlenme',
    U&'Kumarbazlar',
    U&'Peter Camenzind',
    U&'Gertrud',
    U&'Klingsor''un Son Yaz\0131'
  )
ORDER BY a.name, b.title;
