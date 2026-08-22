-- Batch seed: Zweig, Hesse, Matt Haig, Saramago, Gogol (D&R covers, TR blurbs)
-- docker cp oldb-backend/scripts/seed_zweig_hesse_haig_saramago_gogol.sql my_postgres:/tmp/seed_batch2.sql
-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_batch2.sql

BEGIN;

-- Stefan Zweig
INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Stefan Zweig', U&'Avusturya', 1881, 1942,
  U&'https://ui-avatars.com/api/?name=Stefan+Zweig&background=1a1a1a&color=d4af37&size=256', U&'Stefan Zweig (1881\20131942), Avusturyal\0131 yazar, biyografi ustas\0131 ve novella t\00FCr\00FCn\00FCn modern klasiklerinden biridir. Viyana''n\0131n k\00FClt\00FCrel zenginli\011Finde yeti\015Fmi\015F; psikolojik derinlik, tutku ve Avrupa h\00FCmanizmini ince bir \00FCslupla i\015Flemi\015Ftir. Satran\00E7, Bilinmeyen Bir Kad\0131n\0131n Mektubu ve \0130nsanl\0131\011F\0131n Y\0131ld\0131z\0131n\0131n Parlad\0131\011F\0131 Anlar gibi eserleriyle d\00FCnya \00E7ap\0131nda okunur. II. D\00FCnya Sava\015F\0131''n\0131n karanl\0131\011F\0131nda s\00FCrg\00FCnde ya\015Fam\0131\015F; Avrupa''n\0131n \00E7\00F6k\00FC\015F\00FCne dair melankolik bir tan\0131kl\0131k b\0131rakm\0131\015Ft\0131r.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Stefan Zweig')));

UPDATE authors SET
  country = U&'Avusturya', birth_year = 1881, death_year = 1942,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Stefan+Zweig&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Stefan Zweig (1881\20131942), Avusturyal\0131 yazar, biyografi ustas\0131 ve novella t\00FCr\00FCn\00FCn modern klasiklerinden biridir. Viyana''n\0131n k\00FClt\00FCrel zenginli\011Finde yeti\015Fmi\015F; psikolojik derinlik, tutku ve Avrupa h\00FCmanizmini ince bir \00FCslupla i\015Flemi\015Ftir. Satran\00E7, Bilinmeyen Bir Kad\0131n\0131n Mektubu ve \0130nsanl\0131\011F\0131n Y\0131ld\0131z\0131n\0131n Parlad\0131\011F\0131 Anlar gibi eserleriyle d\00FCnya \00E7ap\0131nda okunur. II. D\00FCnya Sava\015F\0131''n\0131n karanl\0131\011F\0131nda s\00FCrg\00FCnde ya\015Fam\0131\015F; Avrupa''n\0131n \00E7\00F6k\00FC\015F\00FCne dair melankolik bir tan\0131kl\0131k b\0131rakm\0131\015Ft\0131r.'
WHERE lower(trim(name)) = lower(trim(U&'Stefan Zweig'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Satran\00E7', U&'Schachnovelle', a.id, 1942, 96,
  U&'Satran\00E7; bir yolcu gemisinde ge\00E7en, zihin ve iktidar \00FCzerine gerilimli bir novellad\0131r. Gestapo h\00FCcrelerinde satran\00E7la hayatta kalan Dr. B''nin \00F6yk\00FCs\00FC, Zweig''\0131n s\00FCrg\00FCn y\0131llar\0131n\0131n en keskin psikolojik anlat\0131lar\0131ndan biridir. Oyunun so\011Fuk mant\0131\011F\0131 ile insan\0131n k\0131r\0131lganl\0131\011F\0131 kar\015F\0131 kar\015F\0131ya gelir.', U&'Klasik, Kurgu, Psikolojik', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001833725001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Satran\00E7')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Bilinmeyen Bir Kad\0131n\0131n Mektubu', U&'Brief einer Unbekannten', a.id, 1922, 80,
  U&'Bilinmeyen Bir Kad\0131n\0131n Mektubu; bir yazar\0131n ald\0131\011F\0131n mektupta, kendini hi\00E7 hat\0131rlamad\0131\011F\0131 bir kad\0131n\0131n \00F6m\00FCr boyu s\00FCren a\015Fk\0131n\0131 okur. Zweig, tek tarafl\0131 tutkuyu ve g\00F6r\00FCnmezli\011Fi, k\0131sa ama y\0131k\0131c\0131 bir itirafla anlat\0131r.', U&'Klasik, Kurgu, Romantik', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001873153001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Bilinmeyen Bir Kad\0131n\0131n Mektubu')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Amok Ko\015Fucusu', U&'Der Amokl\00E4ufer', a.id, 1922, 96,
  U&'Amok Ko\015Fucusu; s\00F6m\00FCrge Do\011Fu''sunda ge\00E7en, tutku ve utanc\0131n bir adam\0131 u\00E7uruma s\00FCr\00FCkledi\011Fi yo\011Fun bir novellad\0131r. Zweig''\0131n ''amok'' metaforuyla kontrols\00FCz arzuyu ve ahlaki \00E7\00F6k\00FC\015F\00FC i\015Fledi\011Fi klasiklerinden biridir.', U&'Klasik, Kurgu, Psikolojik', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001844343001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Amok Ko\015Fucusu')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Bir Kad\0131n\0131n Ya\015Fam\0131ndan Yirmi D\00F6rt Saat', U&'Vierundzwanzig Stunden aus dem Leben einer Frau', a.id, 1927, 112,
  U&'Bir Kad\0131n\0131n Ya\015Fam\0131ndan Yirmi D\00F6rt Saat; bir kumarhanede ba\015Flayan rastlant\0131sal kar\015F\0131la\015Fman\0131n, bir kad\0131n\0131n hayat\0131n\0131 nas\0131l alt\00FCst etti\011Fini anlat\0131r. Zweig, k\0131sa bir zaman diliminde tutku, \015Fefkat ve pi\015Fmanl\0131\011F\0131 ustal\0131kla yo\011Furur.', U&'Klasik, Kurgu, Psikolojik', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001844345001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Bir Kad\0131n\0131n Ya\015Fam\0131ndan Yirmi D\00F6rt Saat')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Korku', U&'Angst', a.id, 1920, 96,
  U&'Korku; evlilik d\0131\015F\0131 bir ili\015Fkinin ard\0131ndan gelen \015Fantaj ve panik duygusunu i\015Fler. Zweig, burjuva ahlak\0131n\0131n bask\0131s\0131 alt\0131nda bir kad\0131n\0131n i\00E7 d\00FCnyas\0131n\0131 gerilim roman\0131 temposunda anlat\0131r.', U&'Klasik, Kurgu, Gerilim', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001797256001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Korku')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Yak\0131c\0131 S\0131r', U&'Brennendes Geheimnis', a.id, 1911, 128,
  U&'Yak\0131c\0131 S\0131r; bir tatil beldesinde ge\00E7en, ergenlik e\015Fi\011Findeki bir \00E7ocu\011Fun yeti\015Fkin d\00FCnyas\0131n\0131n oyunlar\0131n\0131 fark edi\015Fini anlat\0131r. Masumiyetin k\0131r\0131l\0131\015F\0131 ve k\0131skan\00E7l\0131k, Zweig''\0131n erken d\00F6neminin en g\00FC\00E7l\00FC temalar\0131ndand\0131r.', U&'Klasik, Kurgu, Psikolojik', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002217132001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Yak\0131c\0131 S\0131r')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130nsanl\0131\011F\0131n Y\0131ld\0131z\0131n\0131n Parlad\0131\011F\0131 Anlar', U&'Sternstunden der Menschheit', a.id, 1927, 288,
  U&'\0130nsanl\0131\011F\0131n Y\0131ld\0131z\0131n\0131n Parlad\0131\011F\0131 Anlar; tarihin ak\0131\015F\0131n\0131 de\011Fi\015Ftiren kritik anlar\0131 edebi bir dille canland\0131r\0131r. Zweig, biyografi ile dram\0131 birle\015Ftirerek Avrupa tarihinin ''y\0131ld\0131z anlar\0131n\0131'' okura yakla\015Ft\0131r\0131r.', U&'Klasik, Tarih, Deneme', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001708718001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130nsanl\0131\011F\0131n Y\0131ld\0131z\0131n\0131n Parlad\0131\011F\0131 Anlar')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Macellan', U&'Magellan. Der Mann und seine Tat', a.id, 1938, 320,
  U&'Macellan; d\00FCnyay\0131 dola\015Fan k\00E2\015Fifin h\0131rs\0131n\0131, yaln\0131zl\0131\011F\0131n\0131 ve \00E7a\011F\0131n\0131n s\0131n\0131rlar\0131n\0131 a\015Fma \00E7abas\0131n\0131 anlatan bir Zweig biyografisidir. Ke\015Fif \00E7a\011F\0131n\0131n epik gerilimini, insan\0131n iradesiyle birle\015Ftirir.', U&'Klasik, Biyografi, Tarih', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001956386001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Macellan')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ola\011Fan\00FCst\00FC Bir Gece', U&'Eine au\00DFergew\00F6hnliche Nacht / Phantastische Nacht', a.id, 1922, 96,
  U&'Ola\011Fan\00FCst\00FC Bir Gece; burjuva bir adam\0131n bir gecede vicdan\0131yla y\00FCzle\015Fmesini anlat\0131r. Zweig''\0131n k\0131sa ama yo\011Fun ahlaki uyan\0131\015F novellalar\0131ndand\0131r.', U&'Klasik, Kurgu, Psikolojik', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001799302001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ola\011Fan\00FCst\00FC Bir Gece')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'D\00FCn\00FCn D\00FCnyas\0131', U&'Die Welt von Gestern', a.id, 1942, 480,
  U&'D\00FCn\00FCn D\00FCnyas\0131; Zweig''\0131n an\0131lar\0131d\0131r. Kaybolan Avrupa''y\0131, Viyana''y\0131, sava\015Flar\0131 ve s\00FCrg\00FCn\00FC birinci a\011F\0131zdan anlat\0131r. Yirminci y\00FCzy\0131l\0131n k\00FClt\00FCrel y\0131k\0131m\0131na dair en dokunakl\0131 tan\0131kl\0131klardan biridir.', U&'Klasik, An\0131, Tarih', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001794713001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Stefan Zweig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'D\00FCn\00FCn D\00FCnyas\0131')));

-- Hermann Hesse
INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Hermann Hesse', U&'Almanya', 1877, 1962,
  U&'https://ui-avatars.com/api/?name=Hermann+Hesse&background=1a1a1a&color=d4af37&size=256', U&'Hermann Hesse (1877\20131962), Alman as\0131ll\0131 \0130svi\00E7reli yazar ve \015Fairdir. Bireyin ruhsal yolculu\011Funu, Do\011Fu bilgisini ve Bat\0131 modernitesinin bunal\0131m\0131n\0131 bir arada i\015Flemi\015Ftir. Siddhartha, Bozk\0131rkurdu ve Boncuk Oyunu ba\015Fyap\0131tlar\0131 aras\0131ndad\0131r. 1946''da Nobel Edebiyat \00D6d\00FCl\00FC''n\00FC alm\0131\015F; 1960''lar\0131n kar\015F\0131 k\00FClt\00FCr hareketinde yeniden ke\015Ffedilmi\015Ftir.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Hermann Hesse')));

UPDATE authors SET
  country = U&'Almanya', birth_year = 1877, death_year = 1962,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Hermann+Hesse&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Hermann Hesse (1877\20131962), Alman as\0131ll\0131 \0130svi\00E7reli yazar ve \015Fairdir. Bireyin ruhsal yolculu\011Funu, Do\011Fu bilgisini ve Bat\0131 modernitesinin bunal\0131m\0131n\0131 bir arada i\015Flemi\015Ftir. Siddhartha, Bozk\0131rkurdu ve Boncuk Oyunu ba\015Fyap\0131tlar\0131 aras\0131ndad\0131r. 1946''da Nobel Edebiyat \00D6d\00FCl\00FC''n\00FC alm\0131\015F; 1960''lar\0131n kar\015F\0131 k\00FClt\00FCr hareketinde yeniden ke\015Ffedilmi\015Ftir.'
WHERE lower(trim(name)) = lower(trim(U&'Hermann Hesse'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Siddhartha', U&'Siddhartha', a.id, 1922, 160,
  U&'Siddhartha; bir Brahman gencinin ayd\0131nlanma aray\0131\015F\0131n\0131 nehir, a\015Fk ve d\00FCnya deneyimi \00FCzerinden anlat\0131r. Hesse''nin Do\011Fu bilgelik gelenekleriyle kurdu\011Fu en bilinen ve en sade roman\0131d\0131r.', U&'Klasik, Kurgu, Felsefe', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001843744001-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Siddhartha')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Bozk\0131rkurdu', U&'Der Steppenwolf', a.id, 1927, 256,
  U&'Bozk\0131rkurdu; Harry Haller''in i\00E7indeki ''insan'' ile ''kurt'' aras\0131ndaki b\00F6l\00FCnmeyi anlat\0131r. Modern yaln\0131zl\0131k, sanat ve burjuva d\00FCzenine kar\015F\0131 isyan, Hesse''nin en karanl\0131k ve etkili romanlar\0131ndan biridir.', U&'Klasik, Kurgu, Psikolojik', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000132138-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Bozk\0131rkurdu')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Demian', U&'Demian', a.id, 1919, 176,
  U&'Demian; Emil Sinclair''in ergenlikten yeti\015Fkinli\011Fe ge\00E7i\015Fini, iyi ile k\00F6t\00FCn\00FCn \00F6tesinde bir benlik aray\0131\015F\0131 olarak anlat\0131r. Hesse''nin Jung etkisindeki en \00F6nemli bildungsroman\0131d\0131r.', U&'Klasik, Kurgu, Felsefe', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000138954-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Demian')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Narziss ve Goldmund', U&'Narziss und Goldmund', a.id, 1930, 320,
  U&'Narziss ve Goldmund; manast\0131rdaki d\00FC\015F\00FCnsel ya\015Fam ile sanat\00E7\0131n\0131n duyusal yolculu\011Funu iki dost \00FCzerinden kar\015F\0131la\015Ft\0131r\0131r. Ruh ile beden, d\00FCzen ile \00F6zg\00FCrl\00FCk aras\0131ndaki gerilim Hesse''nin olgun d\00F6neminin \00F6z\00FCd\00FCr.', U&'Klasik, Kurgu, Felsefe', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000113561-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Narziss ve Goldmund')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Boncuk Oyunu', U&'Das Glasperlenspiel', a.id, 1943, 560,
  U&'Boncuk Oyunu; gelecekteki bir entelekt\00FCel cumhuriyette ge\00E7en, bilgi, sanat ve maneviyat \00FCzerine \00FCtopik bir romand\0131r. Hesse''nin Nobel''e giden yolundaki ba\015Fyap\0131t\0131 kabul edilir.', U&'Klasik, Kurgu, Felsefe', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000113682-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Boncuk Oyunu')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\00C7arklar Aras\0131nda', U&'Unterm Rad', a.id, 1906, 224,
  U&'\00C7arklar Aras\0131nda; e\011Fitim sisteminin bask\0131s\0131 alt\0131nda ezilen bir gencin trajedisini anlat\0131r. Hesse''nin kendi okul deneyiminden izler ta\015F\0131yan erken ve sars\0131c\0131 bir romand\0131r.', U&'Klasik, Kurgu, Drama', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000119474-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\00C7arklar Aras\0131nda')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Knulp', U&'Knulp', a.id, 1915, 128,
  U&'Knulp; \00F6zg\00FCrl\00FC\011F\00FCn pe\015Finde dola\015Fan bir gezginin \00FC\00E7 \00F6yk\00FCs\00FCd\00FCr. Hesse, yerle\015Fik d\00FCzene s\0131\011Fmayan bir ruhun h\00FCz\00FCnl\00FC \015Fiirini yazar.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000151809-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Knulp')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Do\011Fu Yolculu\011Fu', U&'Die Morgenlandfahrt', a.id, 1932, 112,
  U&'Do\011Fu Yolculu\011Fu; gizli bir birli\011Fin manevi yolculu\011Funu alegorik bir dille anlat\0131r. Hesse''nin inan\00E7, sadakat ve hat\0131rlama \00FCzerine k\0131sa ama yo\011Fun eserlerindendir.', U&'Klasik, Kurgu, Felsefe', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000124059-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Do\011Fu Yolculu\011Fu')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Rosshalde', U&'Ro\00DFhalde', a.id, 1914, 208,
  U&'Rosshalde; bir ressam\0131n evlilik krizi ve sanat\00E7\0131 yaln\0131zl\0131\011F\0131n\0131 anlat\0131r. Hesse''nin aile ve yarat\0131c\0131l\0131k \00FCzerine olgun erken d\00F6nem romanlar\0131ndan biridir.', U&'Klasik, Kurgu, Drama', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000137393-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Hermann Hesse'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Rosshalde')));

-- Matt Haig
INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Matt Haig', U&'\0130ngiltere', 1975, NULL,
  U&'https://ui-avatars.com/api/?name=Matt+Haig&background=1a1a1a&color=d4af37&size=256', U&'Matt Haig (1975\2013), \0130ngiliz romanc\0131 ve deneme yazar\0131d\0131r. Ruh sa\011Fl\0131\011F\0131, zaman, yaln\0131zl\0131k ve ''insan olmak'' \00FCzerine hem kurmaca hem kurmaca d\0131\015F\0131 eserler verir. Gece Yar\0131s\0131 K\00FCt\00FCphanesi ile d\00FCnya \00E7ap\0131nda \00E7ok satanlar aras\0131na girmi\015F; Reasons to Stay Alive ile kendi depresyon deneyimini samimi bir dille payla\015Fm\0131\015Ft\0131r. \00DCslubu s\0131cak, eri\015Filebilir ve umut odakl\0131d\0131r.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Matt Haig')));

UPDATE authors SET
  country = U&'\0130ngiltere', birth_year = 1975, death_year = NULL,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Matt+Haig&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Matt Haig (1975\2013), \0130ngiliz romanc\0131 ve deneme yazar\0131d\0131r. Ruh sa\011Fl\0131\011F\0131, zaman, yaln\0131zl\0131k ve ''insan olmak'' \00FCzerine hem kurmaca hem kurmaca d\0131\015F\0131 eserler verir. Gece Yar\0131s\0131 K\00FCt\00FCphanesi ile d\00FCnya \00E7ap\0131nda \00E7ok satanlar aras\0131na girmi\015F; Reasons to Stay Alive ile kendi depresyon deneyimini samimi bir dille payla\015Fm\0131\015Ft\0131r. \00DCslubu s\0131cak, eri\015Filebilir ve umut odakl\0131d\0131r.'
WHERE lower(trim(name)) = lower(trim(U&'Matt Haig'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Gece Yar\0131s\0131 K\00FCt\00FCphanesi', U&'The Midnight Library', a.id, 2020, 304,
  U&'Gece Yar\0131s\0131 K\00FCt\00FCphanesi; Nora Seed''in ya\015Fam ile \00F6l\00FCm aras\0131nda bir k\00FCt\00FCphanede, ya\015Famad\0131\011F\0131 hayatlar\0131 denemesini anlat\0131r. Pi\015Fmanl\0131k, se\00E7imler ve ''ya \015F\00F6yle olsayd\0131'' sorusu \00FCzerine umut dolu, \00E7a\011Fda\015F bir romand\0131r.', U&'Kurgu, Fantastik, \00C7a\011Fda\015F', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001922926001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Matt Haig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Gece Yar\0131s\0131 K\00FCt\00FCphanesi')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130nsanlar', U&'The Humans', a.id, 2013, 304,
  U&'\0130nsanlar; bir uzayl\0131n\0131n Cambridge''li bir matematik\00E7i k\0131l\0131\011F\0131na girip insanl\0131\011F\0131 anlamaya \00E7al\0131\015Fmas\0131n\0131 anlat\0131r. Haig, sevgi, g\00FClme ve s\0131radanl\0131\011F\0131n de\011Ferini mizahla hat\0131rlat\0131r.', U&'Kurgu, Bilim Kurgu, Mizah', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001969669001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Matt Haig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130nsanlar')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Zaman\0131 Durdurman\0131n Yollar\0131', U&'How to Stop Time', a.id, 2017, 336,
  U&'Zaman\0131 Durdurman\0131n Yollar\0131; y\00FCzlerce y\0131l ya\015Fayan Tom Hazard''\0131n a\015Fk, kay\0131p ve tarihle ili\015Fkisini anlat\0131r. Zaman\0131n a\011F\0131rl\0131\011F\0131 ile an\0131n k\0131ymeti \00FCzerine dokunakl\0131 bir romand\0131r.', U&'Kurgu, Fantastik, Tarih', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001782557001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Matt Haig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Zaman\0131 Durdurman\0131n Yollar\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ya\015Fama Tutunmak \0130\00E7in Nedenler', U&'Reasons to Stay Alive', a.id, 2015, 272,
  U&'Ya\015Fama Tutunmak \0130\00E7in Nedenler; Haig''in kendi depresyon ve kayg\0131 deneyimini anlatt\0131\011F\0131 samimi bir kitapt\0131r. Utan\00E7 olmadan, okura ''yaln\0131z de\011Filsin'' diyen \00E7a\011Fda\015F bir ruh sa\011Fl\0131\011F\0131 klasi\011Fidir.', U&'Kurgu D\0131\015F\0131, An\0131, Psikoloji', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002036654001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Matt Haig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ya\015Fama Tutunmak \0130\00E7in Nedenler')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Nevrotik Bir Gezegenden Notlar', U&'Notes on a Nervous Planet', a.id, 2018, 288,
  U&'Nevrotik Bir Gezegenden Notlar; dijital \00E7a\011F\0131n kayg\0131, h\0131z ve a\015F\0131r\0131 uyar\0131lma sorununu ele al\0131r. Haig, modern hayat\0131n sinir sistemimizi nas\0131l zorlad\0131\011F\0131n\0131 anla\015F\0131l\0131r \00F6nerilerle anlat\0131r.', U&'Kurgu D\0131\015F\0131, Deneme, Psikoloji', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001852346001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Matt Haig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Nevrotik Bir Gezegenden Notlar')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Rahatlama Kitab\0131', U&'The Comfort Book', a.id, 2021, 272,
  U&'Rahatlama Kitab\0131; zor g\00FCnler i\00E7in k\0131sa notlar, al\0131nt\0131lar ve hat\0131rlatmalardan olu\015Fan bir teselli derlemesidir. Haig''in \015Fefkatli sesi, k\00FC\00E7\00FCk umut par\00E7alar\0131n\0131 bir araya getirir.', U&'Kurgu D\0131\015F\0131, Deneme, Psikoloji', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001989342001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Matt Haig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Rahatlama Kitab\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Hayat \0130mk\00E2ns\0131z', U&'The Life Impossible', a.id, 2024, 336,
  U&'Hayat \0130mk\00E2ns\0131z; bir dulun \0130biza''da miras kalan bir evle ba\015Flayan, s\0131radanl\0131\011F\0131 a\015Fan bir yolculu\011Funu anlat\0131r. Haig''in do\011Fa, yas ve yeniden ba\015Flama \00FCzerine yeni d\00F6nem roman\0131d\0131r.', U&'Kurgu, Fantastik, \00C7a\011Fda\015F', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002133814001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Matt Haig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Hayat \0130mk\00E2ns\0131z')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Radley Ailesi', U&'The Radleys', a.id, 2010, 352,
  U&'Radley Ailesi; s\0131radan g\00F6r\00FCnen bir ailenin karanl\0131k s\0131rr\0131n\0131 vampir alegorisiyle anlat\0131r. Haig''in erken d\00F6neminin e\011Flenceli ve keskin bir roman\0131d\0131r.', U&'Kurgu, Fantastik, Gerilim', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002191598001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Matt Haig'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Radley Ailesi')));

-- José Saramago
INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Jos\00E9 Saramago', U&'Portekiz', 1922, 2010,
  U&'https://ui-avatars.com/api/?name=Jose+Saramago&background=1a1a1a&color=d4af37&size=256', U&'Jos\00E9 Saramago (1922\20132010), Portekizli romanc\0131 ve 1998 Nobel Edebiyat \00D6d\00FCl\00FC sahibidir. Uzun c\00FCmleleri, alegorik kurgular\0131 ve keskin toplumsal ele\015Ftirisiyle tan\0131n\0131r. K\00F6rl\00FCk, G\00F6rmek ve \0130sa''ya G\00F6re \0130ncil gibi eserlerinde iktidar, ahlak ve insanl\0131k durumunu sorgular. Dilindeki m\00FCzikalite ve mizah, karanl\0131k temalar\0131 bile okunabilir k\0131lar.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Jos\00E9 Saramago')));

UPDATE authors SET
  country = U&'Portekiz', birth_year = 1922, death_year = 2010,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Jose+Saramago&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Jos\00E9 Saramago (1922\20132010), Portekizli romanc\0131 ve 1998 Nobel Edebiyat \00D6d\00FCl\00FC sahibidir. Uzun c\00FCmleleri, alegorik kurgular\0131 ve keskin toplumsal ele\015Ftirisiyle tan\0131n\0131r. K\00F6rl\00FCk, G\00F6rmek ve \0130sa''ya G\00F6re \0130ncil gibi eserlerinde iktidar, ahlak ve insanl\0131k durumunu sorgular. Dilindeki m\00FCzikalite ve mizah, karanl\0131k temalar\0131 bile okunabilir k\0131lar.'
WHERE lower(trim(name)) = lower(trim(U&'Jos\00E9 Saramago'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'K\00F6rl\00FCk', U&'Ensaio sobre a Cegueira', a.id, 1995, 352,
  U&'K\00F6rl\00FCk; bir kentte salg\0131n gibi yay\0131lan beyaz k\00F6rl\00FCk \00FCzerinden toplumun \00E7\00F6k\00FC\015F\00FCn\00FC anlat\0131r. Saramago''nun en bilinen roman\0131; ahlak, iktidar ve dayan\0131\015Fmay\0131 alegorik bir distopyada s\0131nar.', U&'Klasik, Kurgu, Distopya', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002045585001-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'K\00F6rl\00FCk')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'G\00F6rmek', U&'Ensaio sobre a Lucidez', a.id, 2004, 320,
  U&'G\00F6rmek; K\00F6rl\00FCk''\00FCn devam\0131 niteli\011Findedir. Bo\015F oy pusulalar\0131yla ba\015Flayan bir siyasi krizi anlat\0131r. Demokrasi, manip\00FClasyon ve halk iradesi \00FCzerine keskin bir alegoridir.', U&'Klasik, Kurgu, Politik', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002128048002-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'G\00F6rmek')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130sa''ya G\00F6re \0130ncil', U&'O Evangelho Segundo Jesus Cristo', a.id, 1991, 400,
  U&'\0130sa''ya G\00F6re \0130ncil; kutsal anlat\0131y\0131 insan\00EE, bedensel ve siyasal bir d\00FCzlemde yeniden yazar. Saramago''nun en tart\0131\015Fmal\0131 ve cesur romanlar\0131ndan biridir.', U&'Klasik, Kurgu, Din', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001369183002-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130sa''ya G\00F6re \0130ncil')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Baltasar ile Blimunda', U&'Memorial do Convento', a.id, 1982, 368,
  U&'Baltasar ile Blimunda; 18. y\00FCzy\0131l Portekiz''inde ge\00E7en, a\015Fk ile hayal g\00FCc\00FCn\00FCn Engizisyon bask\0131s\0131na kar\015F\0131 direni\015Fini anlat\0131r. Saramago''nun uluslararas\0131 \00FCn\00FCn\00FC peki\015Ftiren erken ba\015Fyap\0131tlar\0131ndand\0131r.', U&'Klasik, Kurgu, Tarih', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001422713002-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Baltasar ile Blimunda')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ricardo Reis''in \00D6ld\00FC\011F\00FC Y\0131l', U&'O Ano da Morte de Ricardo Reis', a.id, 1984, 400,
  U&'Ricardo Reis''in \00D6ld\00FC\011F\00FC Y\0131l; Pessoa''n\0131n heteronimlerinden birinin Lizbon''a d\00F6n\00FC\015F\00FCn\00FC, Salazar d\00F6nemiyle i\00E7 i\00E7e anlat\0131r. Kimlik, \00F6l\00FCm ve siyaset \00FCzerine labirentimsi bir romand\0131r.', U&'Klasik, Kurgu, Tarih', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001719992002-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ricardo Reis''in \00D6ld\00FC\011F\00FC Y\0131l')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Filin Yolculu\011Fu', U&'A Viagem do Elefante', a.id, 2008, 224,
  U&'Filin Yolculu\011Fu; 16. y\00FCzy\0131lda bir filin Portekiz''den Avusturya''ya gidi\015Fini mizah ve \015Fefkatle anlat\0131r. Saramago''nun ge\00E7 d\00F6neminin hafif ama zeki bir anlat\0131s\0131d\0131r.', U&'Klasik, Kurgu, Tarih', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000572100-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Filin Yolculu\011Fu')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kabil', U&'Caim', a.id, 2009, 176,
  U&'Kabil; Eski Ahit anlat\0131lar\0131n\0131 Kabil''in bak\0131\015F\0131ndan yeniden okur. Saramago''nun Tanr\0131, adalet ve \015Fiddet \00FCzerine son d\00F6neminin k\0131\015Fk\0131rt\0131c\0131 bir roman\0131d\0131r.', U&'Klasik, Kurgu, Din', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002045586001-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kabil')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\00D6l\00FCm Bir Varm\0131\015F Bir Yokmu\015F', U&'As Intermit\00EAncias da Morte', a.id, 2005, 240,
  U&'\00D6l\00FCm Bir Varm\0131\015F Bir Yokmu\015F; bir \00FClkede \00F6l\00FCm\00FCn birden durmas\0131yla ba\015Flayan kaos ve a\015Fk\0131 anlat\0131r. Saramago, \00F6l\00FCm\00FC ki\015File\015Ftirerek b\00FCrokrasi ile duygunun \00E7at\0131\015Fmas\0131n\0131 i\015Fler.', U&'Klasik, Kurgu, Fantastik', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001417057002-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\00D6l\00FCm Bir Varm\0131\015F Bir Yokmu\015F')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ma\011Fara', U&'A Caverna', a.id, 2000, 320,
  U&'Ma\011Fara; dev bir al\0131\015Fveri\015F merkezinin g\00F6lgesinde kaybolan zanaatk\00E2r ya\015Fam\0131n\0131 anlat\0131r. Platon''un ma\011Fara alegorisine \00E7a\011Fda\015F bir g\00F6ndermeyle t\00FCketim toplumunu ele\015Ftirir.', U&'Klasik, Kurgu, Distopya', 'por', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001577816002-1.jpg',
  true, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Jos\00E9 Saramago'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ma\011Fara')));

-- Nikolay Gogol
INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Nikolay Gogol', U&'Rusya', 1809, 1852,
  U&'https://ui-avatars.com/api/?name=Nikolay+Gogol&background=1a1a1a&color=d4af37&size=256', U&'Nikolay Vasilyevi\00E7 Gogol (1809\20131852), Rus edebiyat\0131n\0131n kurucu ustalar\0131ndand\0131r. Ger\00E7ek\00E7ilik ile groteski, mizah ile deh\015Feti birle\015Ftirerek b\00FCrokrasi ve ta\015Fra ya\015Fam\0131n\0131 hicvetmi\015Ftir. \00D6l\00FC Canlar, Palto ve M\00FCfetti\015F gibi eserleri Dostoyevski''den Kafka''ya uzanan bir etki b\0131rakm\0131\015Ft\0131r. Ukrayna k\00F6kenli olu\015Fu ve Petersburg \00F6yk\00FCleri, modern k\0131sa \00F6yk\00FCn\00FCn de \00F6nc\00FClerindendir.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Nikolay Gogol')));

UPDATE authors SET
  country = U&'Rusya', birth_year = 1809, death_year = 1852,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Nikolay+Gogol&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Nikolay Vasilyevi\00E7 Gogol (1809\20131852), Rus edebiyat\0131n\0131n kurucu ustalar\0131ndand\0131r. Ger\00E7ek\00E7ilik ile groteski, mizah ile deh\015Feti birle\015Ftirerek b\00FCrokrasi ve ta\015Fra ya\015Fam\0131n\0131 hicvetmi\015Ftir. \00D6l\00FC Canlar, Palto ve M\00FCfetti\015F gibi eserleri Dostoyevski''den Kafka''ya uzanan bir etki b\0131rakm\0131\015Ft\0131r. Ukrayna k\00F6kenli olu\015Fu ve Petersburg \00F6yk\00FCleri, modern k\0131sa \00F6yk\00FCn\00FCn de \00F6nc\00FClerindendir.'
WHERE lower(trim(name)) = lower(trim(U&'Nikolay Gogol'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\00D6l\00FC Canlar', U&'\041C\0451\0440\0442\0432\044B\0435 \0434\0443\0448\0438', a.id, 1842, 400,
  U&'\00D6l\00FC Canlar; \00C7i\00E7ikov''un \00F6l\00FC serflerin ''canlar\0131n\0131'' sat\0131n alma plan\0131 \00FCzerinden Rus ta\015Fras\0131n\0131 hicveder. Gogol''un ba\015Fyap\0131t\0131; a\00E7g\00F6zl\00FCl\00FCk, riyak\00E2rl\0131k ve toplumsal \00E7\00FCr\00FCmeyi epik bir yolculukta anlat\0131r.', U&'Klasik, Kurgu, Hiciv', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002108167001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\00D6l\00FC Canlar')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Palto', U&'\0428\0438\043D\0435\043B\044C', a.id, 1842, 80,
  U&'Palto; yoksul bir memurun yeni paltosu u\011Fruna verdi\011Fi m\00FCcadeleyi ve kayb\0131n ard\0131ndan gelen trajediyi anlat\0131r. ''Hepimiz Gogol''un Paltosu''ndan \00E7\0131kt\0131k'' s\00F6z\00FCn\00FCn kayna\011F\0131 olan modern \00F6yk\00FC klasi\011Fidir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001868802001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Palto')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'M\00FCfetti\015F', U&'\0420\0435\0432\0438\0437\043E\0440', a.id, 1836, 160,
  U&'M\00FCfetti\015F; bir ta\015Fra kasabas\0131n\0131n sahte bir denet\00E7iyi a\011F\0131rlamas\0131n\0131 anlatan komedi-hicivdir. Gogol, r\00FC\015Fvet ve korkuyu sahne \00FCzerinde te\015Fhir eder.', U&'Klasik, Drama, Hiciv', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002231869001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'M\00FCfetti\015F')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Burun', U&'\041D\043E\0441', a.id, 1836, 64,
  U&'Burun; bir sabah burnunu kaybeden bir memurun abs\00FCrt pe\015Fini anlat\0131r. Gogol''un Petersburg groteskinin en \00FCnl\00FC \00F6rneklerinden biridir.', U&'Klasik, Kurgu, Fantastik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001843394001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Burun')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Delinin Hat\0131ra Defteri', U&'\0417\0430\043F\0438\0441\043A\0438 \0441\0443\043C\0430\0441\0448\0435\0434\0448\0435\0433\043E', a.id, 1835, 80,
  U&'Delinin Hat\0131ra Defteri; bir memurun g\00FCnce yoluyla giderek delili\011Fe s\00FCr\00FCkleni\015Fini anlat\0131r. Gogol, b\00FCrokratik a\015Fa\011F\0131lanmay\0131 i\00E7 monologla birle\015Ftirir.', U&'Klasik, Kurgu, Psikolojik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000060902-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Delinin Hat\0131ra Defteri')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Taras Bulba', U&'\0422\0430\0440\0430\0441 \0411\0443\043B\044C\0431\0430', a.id, 1835, 192,
  U&'Taras Bulba; Kazak sava\015F\00E7\0131l\0131\011F\0131n\0131, baba-o\011Ful ba\011F\0131n\0131 ve tarih\00EE \00E7at\0131\015Fmay\0131 epik bir anlat\0131yla i\015Fler. Gogol''un Ukrayna temal\0131 en bilinen uzun \00F6yk\00FCs\00FCd\00FCr.', U&'Klasik, Kurgu, Tarih', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002097901001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Taras Bulba')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Petersburg \00D6yk\00FCleri', U&'\041F\0435\0442\0435\0440\0431\0443\0440\0433\0441\043A\0438\0435 \043F\043E\0432\0435\0441\0442\0438', a.id, 1842, 288,
  U&'Petersburg \00D6yk\00FCleri; Palto, Burun ve Nevski Bulvar\0131 gibi metinleri bir araya getirir. Gogol''un ba\015Fkentteki abs\00FCrt, karanl\0131k ve mizahi d\00FCnyas\0131n\0131n \00F6z\00FCd\00FCr.', U&'Klasik, Kurgu, \00D6yk\00FC', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002231871001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Petersburg \00D6yk\00FCleri')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Mirgorod \00D6yk\00FCleri', U&'\041C\0438\0440\0433\043E\0440\043E\0434', a.id, 1835, 256,
  U&'Mirgorod \00D6yk\00FCleri; Taras Bulba ve Eski Zaman Toprak Sahipleri gibi metinleri i\00E7eren Ukrayna ta\015Fras\0131 derlemesidir. Gogol''un halk masal\0131 ile hicvi birle\015Ftirdi\011Fi erken d\00F6neminin \00F6nemli kitab\0131d\0131r.', U&'Klasik, Kurgu, \00D6yk\00FC', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000576988-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Nikolay Gogol'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Mirgorod \00D6yk\00FCleri')));

COMMIT;

SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE a.name IN (U&'Stefan Zweig', U&'Hermann Hesse', U&'Matt Haig', U&'Jos\00E9 Saramago', U&'Nikolay Gogol')
GROUP BY a.id, a.name ORDER BY a.id;
