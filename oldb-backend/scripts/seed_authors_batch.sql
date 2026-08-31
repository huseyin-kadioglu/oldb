-- Batch seed: Tolstoy, Camus, Kafka, Orwell (D&R covers)
-- docker cp oldb-backend/scripts/seed_authors_batch.sql my_postgres:/tmp/seed_authors_batch.sql
-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_authors_batch.sql

BEGIN;

-- Lev Tolstoy
INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Lev Tolstoy', U&'Rusya', 1828, 1910,
  U&'https://ui-avatars.com/api/?name=Lev+Tolstoy&background=1a1a1a&color=d4af37&size=256', U&'Lev Nikolayevi\00E7 Tolstoy (1828\20131910), Rus edebiyat\0131n\0131n en b\00FCy\00FCk romanc\0131lar\0131ndand\0131r. Sava\015F ve Bar\0131\015F ile Anna Karenina ba\015Fyap\0131tlar\0131 aras\0131nda yer al\0131r; ahlak, tarih ve bireysel vicdan temalar\0131n\0131 epik bir geni\015Flikte i\015Fler.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')));

UPDATE authors SET
  country = U&'Rusya', birth_year = 1828, death_year = 1910,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Lev+Tolstoy&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Lev Nikolayevi\00E7 Tolstoy (1828\20131910), Rus edebiyat\0131n\0131n en b\00FCy\00FCk romanc\0131lar\0131ndand\0131r. Sava\015F ve Bar\0131\015F ile Anna Karenina ba\015Fyap\0131tlar\0131 aras\0131nda yer al\0131r; ahlak, tarih ve bireysel vicdan temalar\0131n\0131 epik bir geni\015Flikte i\015Fler.'
WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Sava\015F ve Bar\0131\015F', U&'\0412\043E\0439\043D\0430 \0438 \043C\0438\0440', a.id, 1869, 1400,
  U&'Sava\015F ve Bar\0131\015F; Napolyon sava\015Flar\0131 d\00F6neminde Rus aristokrasisinin hayat\0131n\0131, tarihi ve bireysel kaderleri i\00E7 i\00E7e anlatan epik bir romand\0131r.', U&'Klasik, Kurgu, Tarih', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002226516001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Sava\015F ve Bar\0131\015F')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Anna Karenina', U&'\0410\043D\043D\0430 \041A\0430\0440\0435\043D\0438\043D\0430', a.id, 1877, 960,
  U&'Anna Karenina; tutkulu bir a\015Fk\0131n toplumsal ahlakla \00E7at\0131\015Fmas\0131n\0131 anlat\0131r. Tolstoy''un en olgun psikolojik romanlar\0131ndan biridir.', U&'Klasik, Kurgu, Romantik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000374848-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Anna Karenina')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Dirili\015F', U&'\0412\043E\0441\043A\0440\0435\0441\0435\043D\0438\0435', a.id, 1899, 560,
  U&'Dirili\015F; bir soylunun vicdan uyan\0131\015F\0131n\0131 ve adalet aray\0131\015F\0131n\0131 anlat\0131r. Tolstoy''un ge\00E7 d\00F6neminin ahlaki yo\011Funlu\011Funu ta\015F\0131r.', U&'Klasik, Kurgu, Drama', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000304801-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Dirili\015F')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130van \0130lyi\00E7''in \00D6l\00FCm\00FC', U&'\0421\043C\0435\0440\0442\044C \0418\0432\0430\043D\0430 \0418\043B\044C\0438\0447\0430', a.id, 1886, 128,
  U&'\0130van \0130lyi\00E7''in \00D6l\00FCm\00FC; s\0131radan bir memurun \00F6l\00FCmle y\00FCzle\015Fmesini anlatan k\0131sa ama derin bir novellad\0131r.', U&'Klasik, Kurgu, Felsefe', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000591730-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130van \0130lyi\00E7''in \00D6l\00FCm\00FC')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kreutzer Sonat\0131', U&'\041A\0440\0435\0439\0446\0435\0440\043E\0432\0430 \0441\043E\043D\0430\0442\0430', a.id, 1889, 144,
  U&'Kreutzer Sonat\0131; k\0131skan\00E7l\0131k, evlilik ve ahlak \00FCzerine sert bir anlat\0131d\0131r.', U&'Klasik, Kurgu, Psikolojik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000451302-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kreutzer Sonat\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Hac\0131 Murat', U&'\0425\0430\0434\0436\0438-\041C\0443\0440\0430\0442', a.id, 1912, 192,
  U&'Hac\0131 Murat; Kafkasya sava\015Flar\0131nda ge\00E7en bir direni\015F ve onur hik\00E2yesidir.', U&'Klasik, Kurgu, Tarih', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000276914-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Hac\0131 Murat')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kazaklar', U&'\041A\0430\0437\0430\043A\0438', a.id, 1863, 224,
  U&'Kazaklar; Kafkasya''da bir subay\0131n Kazak ya\015Fam\0131yla kar\015F\0131la\015Fmas\0131n\0131 anlat\0131r. Tolstoy''un erken d\00F6neminin g\00FC\00E7l\00FC bir roman\0131d\0131r.', U&'Klasik, Kurgu, Macera', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001782494001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kazaklar')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Sivastopol', U&'\0421\0435\0432\0430\0441\0442\043E\043F\043E\043B\044C\0441\043A\0438\0435 \0440\0430\0441\0441\043A\0430\0437\044B', a.id, 1855, 192,
  U&'Sivastopol; K\0131r\0131m Sava\015F\0131''ndan kesitlerle sava\015F\0131n ger\00E7ek y\00FCz\00FCn\00FC anlatan \00F6yk\00FClerdir.', U&'Klasik, Kurgu, Tarih', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000303607-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Sivastopol')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Efendi ile U\015Fa\011F\0131', U&'\0425\043E\0437\044F\0438\043D \0438 \0440\0430\0431\043E\0442\043D\0438\043A', a.id, 1895, 112,
  U&'Efendi ile U\015Fa\011F\0131; bir kar f\0131rt\0131nas\0131nda efendi ile u\015Fa\011F\0131n kader birli\011Fini anlat\0131r.', U&'Klasik, Kurgu, \00D6yk\00FC', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000641887-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Efendi ile U\015Fa\011F\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130tiraf', U&'\0418\0441\043F\043E\0432\0435\0434\044C', a.id, 1882, 128,
  U&'\0130tiraf; Tolstoy''un inan\00E7 ve anlam aray\0131\015F\0131n\0131 anlatt\0131\011F\0131 otobiyografik denemesidir.', U&'Klasik, Kurgu D\0131\015F\0131, Felsefe', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002012492001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130tiraf')));

-- Albert Camus
INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Albert Camus', U&'Fransa', 1913, 1960,
  U&'https://ui-avatars.com/api/?name=Albert+Camus&background=1a1a1a&color=d4af37&size=256', U&'Albert Camus (1913\20131960), Abs\00FCrt felsefenin \00F6nde gelen yazar ve d\00FC\015F\00FCn\00FCrlerindendir. Yabanc\0131, Veba ve D\00FC\015F\00FC\015F romanlar\0131yla modern bireyin yabanc\0131la\015Fmas\0131n\0131 i\015Flemi\015F; 1957''de Nobel Edebiyat \00D6d\00FCl\00FC''n\00FC alm\0131\015Ft\0131r.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Albert Camus')));

UPDATE authors SET
  country = U&'Fransa', birth_year = 1913, death_year = 1960,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Albert+Camus&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Albert Camus (1913\20131960), Abs\00FCrt felsefenin \00F6nde gelen yazar ve d\00FC\015F\00FCn\00FCrlerindendir. Yabanc\0131, Veba ve D\00FC\015F\00FC\015F romanlar\0131yla modern bireyin yabanc\0131la\015Fmas\0131n\0131 i\015Flemi\015F; 1957''de Nobel Edebiyat \00D6d\00FCl\00FC''n\00FC alm\0131\015Ft\0131r.'
WHERE lower(trim(name)) = lower(trim(U&'Albert Camus'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Yabanc\0131', U&'L''\00C9tranger', a.id, 1942, 128,
  U&'Yabanc\0131; Meursault''nun kay\0131ts\0131zl\0131\011F\0131n\0131 ve abs\00FCrt bir d\00FCnyadaki yarg\0131lan\0131\015F\0131n\0131 anlat\0131r. Camus''n\00FCn en bilinen roman\0131d\0131r.', U&'Klasik, Kurgu, Felsefe', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000064464-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Albert Camus'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Yabanc\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Veba', U&'La Peste', a.id, 1947, 320,
  U&'Veba; Oran kentini saran salg\0131n \00FCzerinden direni\015F, dayan\0131\015Fma ve abs\00FCrd\00FC anlat\0131r.', U&'Klasik, Kurgu, Felsefe', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000064631-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Albert Camus'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Veba')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'D\00FC\015F\00FC\015F', U&'La Chute', a.id, 1956, 144,
  U&'D\00FC\015F\00FC\015F; bir avukat\0131n itiraflar\0131 \00FCzerinden su\00E7luluk, yarg\0131lama ve ikiy\00FCzl\00FCl\00FC\011F\00FC anlat\0131r.', U&'Klasik, Kurgu, Felsefe', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000064648-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Albert Camus'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'D\00FC\015F\00FC\015F')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Mutlu \00D6l\00FCm', U&'La Mort heureuse', a.id, 1971, 192,
  U&'Mutlu \00D6l\00FCm; Camus''n\00FCn erken d\00F6nem roman\0131d\0131r. \00D6zg\00FCrl\00FCk ve mutluluk aray\0131\015F\0131n\0131 i\015Fler.', U&'Klasik, Kurgu, Felsefe', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000064282-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Albert Camus'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Mutlu \00D6l\00FCm')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Sisifos S\00F6yleni', U&'Le Mythe de Sisyphe', a.id, 1942, 192,
  U&'Sisifos S\00F6yleni; abs\00FCrt kavram\0131n\0131 kuramsal olarak ortaya koyan denemedir.', U&'Klasik, Felsefe, Deneme', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000064591-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Albert Camus'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Sisifos S\00F6yleni')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ba\015Fkald\0131ran \0130nsan', U&'L''Homme r\00E9volt\00E9', a.id, 1951, 352,
  U&'Ba\015Fkald\0131ran \0130nsan; isyan, \00F6zg\00FCrl\00FCk ve adalet \00FCzerine kapsaml\0131 bir denemedir.', U&'Klasik, Felsefe, Deneme', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000064456-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Albert Camus'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ba\015Fkald\0131ran \0130nsan')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Caligula', U&'Caligula', a.id, 1944, 128,
  U&'Caligula; mutlak iktidar\0131n abs\00FCrtl\00FC\011F\00FCn\00FC i\015Fleyen bir oyundur.', U&'Klasik, Drama, Felsefe', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001887315001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Albert Camus'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Caligula')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Yanl\0131\015Fl\0131k', U&'Le Malentendu', a.id, 1944, 112,
  U&'Yanl\0131\015Fl\0131k; kimlik, yabanc\0131la\015Fma ve trajik bir hatay\0131 anlatan bir Camus oyunudur.', U&'Klasik, Drama', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000636824-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Albert Camus'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Yanl\0131\015Fl\0131k')));

-- Franz Kafka
INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'Franz Kafka', U&'\00C7ekya', 1883, 1924,
  U&'https://ui-avatars.com/api/?name=Franz+Kafka&background=1a1a1a&color=d4af37&size=256', U&'Franz Kafka (1883\20131924), modern edebiyat\0131n en etkili yazarlar\0131ndand\0131r. B\00FCrokrasi, su\00E7luluk ve varolu\015Fsal kayg\0131y\0131 labirentimsi anlat\0131larla i\015Flemi\015Ftir.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka')));

UPDATE authors SET
  country = U&'\00C7ekya', birth_year = 1883, death_year = 1924,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=Franz+Kafka&background=1a1a1a&color=d4af37&size=256'),
  description = U&'Franz Kafka (1883\20131924), modern edebiyat\0131n en etkili yazarlar\0131ndand\0131r. B\00FCrokrasi, su\00E7luluk ve varolu\015Fsal kayg\0131y\0131 labirentimsi anlat\0131larla i\015Flemi\015Ftir.'
WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'D\00F6n\00FC\015F\00FCm', U&'Die Verwandlung', a.id, 1915, 96,
  U&'D\00F6n\00FC\015F\00FCm; Gregor Samsa''n\0131n bir sabah b\00F6ce\011Fe d\00F6n\00FC\015Fmesiyle ba\015Flayan aile, emek ve yabanc\0131la\015Fma \00F6yk\00FCs\00FCd\00FCr.', U&'Klasik, Kurgu, Fantastik', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001866845001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'D\00F6n\00FC\015F\00FCm')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Dava', U&'Der Process', a.id, 1925, 288,
  U&'Dava; Josef K.''n\0131n nedenini bilmedi\011Fi bir su\00E7lamayla yarg\0131lanmas\0131n\0131 anlat\0131r.', U&'Klasik, Kurgu, Gerilim', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002163630001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Dava')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Amerika', U&'Der Verschollene', a.id, 1927, 320,
  U&'Amerika (Kay\0131p); gen\00E7 Karl Rossmann''\0131n Yeni D\00FCnya''daki s\00FCr\00FCkleni\015Fini anlat\0131r.', U&'Klasik, Kurgu, Macera', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001956857001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Amerika')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'A\00E7l\0131k Sanat\00E7\0131s\0131', U&'Ein Hungerk\00FCnstler', a.id, 1924, 112,
  U&'A\00E7l\0131k Sanat\00E7\0131s\0131; g\00F6steri, yaln\0131zl\0131k ve anla\015F\0131lmamay\0131 anlatan \00F6yk\00FClerden olu\015Fur.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001925404001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'A\00E7l\0131k Sanat\00E7\0131s\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ceza S\00F6m\00FCrgesi', U&'In der Strafkolonie', a.id, 1919, 80,
  U&'Ceza S\00F6m\00FCrgesi; bir i\015Fkence makinesi \00FCzerinden adalet, itaat ve vah\015Feti anlat\0131r.', U&'Klasik, Kurgu, Gerilim', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002130663001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ceza S\00F6m\00FCrgesi')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Babaya Mektup', U&'Brief an den Vater', a.id, 1919, 96,
  U&'Babaya Mektup; Kafka''n\0131n babas\0131yla ili\015Fkisini a\00E7\0131\011Fa vuran uzun bir itiraft\0131r.', U&'Klasik, Kurgu D\0131\015F\0131, An\0131', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000708515-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Babaya Mektup')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Aforizmalar', U&'Aphorismen', a.id, 1931, 128,
  U&'Aforizmalar; Kafka''n\0131n k\0131sa, keskin d\00FC\015F\00FCnce par\00E7alar\0131n\0131 bir araya getirir.', U&'Klasik, Felsefe, Deneme', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001885950001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Aforizmalar')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\015Eato', U&'Das Schloss', a.id, 1926, 352,
  U&'\015Eato; K.''n\0131n eri\015Filemeyen bir otoriteye ula\015Fma \00E7abas\0131n\0131 anlat\0131r.', U&'Klasik, Kurgu, Fantastik', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001837125001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\015Eato')));

-- George Orwell
INSERT INTO authors (name, country, birth_year, death_year, portrait, description)
SELECT
  U&'George Orwell', U&'\0130ngiltere', 1903, 1950,
  U&'https://ui-avatars.com/api/?name=George+Orwell&background=1a1a1a&color=d4af37&size=256', U&'George Orwell (1903\20131950), totalitarizm ele\015Ftirisi ve net \00FCslubuyla tan\0131nan \0130ngiliz yazard\0131r. 1984 ve Hayvan \00C7iftli\011Fi ile siyasal distopyan\0131n klasiklerini yazm\0131\015Ft\0131r.'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(U&'George Orwell')));

UPDATE authors SET
  country = U&'\0130ngiltere', birth_year = 1903, death_year = 1950,
  portrait = COALESCE(NULLIF(TRIM(portrait), ''), U&'https://ui-avatars.com/api/?name=George+Orwell&background=1a1a1a&color=d4af37&size=256'),
  description = U&'George Orwell (1903\20131950), totalitarizm ele\015Ftirisi ve net \00FCslubuyla tan\0131nan \0130ngiliz yazard\0131r. 1984 ve Hayvan \00C7iftli\011Fi ile siyasal distopyan\0131n klasiklerini yazm\0131\015Ft\0131r.'
WHERE lower(trim(name)) = lower(trim(U&'George Orwell'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'1984', U&'Nineteen Eighty-Four', a.id, 1949, 352,
  U&'1984; B\00FCy\00FCk Birader''in g\00F6zetimindeki bir totaliter toplumu anlat\0131r.', U&'Klasik, Distopya, Kurgu', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001903206001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'George Orwell'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'1984')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Hayvan \00C7iftli\011Fi', U&'Animal Farm', a.id, 1945, 128,
  U&'Hayvan \00C7iftli\011Fi; bir \00E7iftlik isyan\0131 \00FCzerinden iktidar\0131n yozla\015Fmas\0131n\0131 anlatan alegorik bir novellad\0131r.', U&'Klasik, Distopya, Alegori', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001903207001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'George Orwell'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Hayvan \00C7iftli\011Fi')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Paris ve Londra''da Be\015F Paras\0131z', U&'Down and Out in Paris and London', a.id, 1933, 256,
  U&'Paris ve Londra''da Be\015F Paras\0131z; yoksulluk ve g\00FCvencesiz eme\011Fi anlatan yar\0131 otobiyografik bir anlat\0131d\0131r.', U&'Klasik, Kurgu D\0131\015F\0131, An\0131', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000646397-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'George Orwell'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Paris ve Londra''da Be\015F Paras\0131z')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Katalonya''ya Selam', U&'Homage to Catalonia', a.id, 1938, 288,
  U&'Katalonya''ya Selam; \0130spanya \0130\00E7 Sava\015F\0131''ndaki tan\0131kl\0131\011F\0131n\0131 anlat\0131r.', U&'Klasik, Kurgu D\0131\015F\0131, Tarih', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000364145-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'George Orwell'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Katalonya''ya Selam')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Burma G\00FCnleri', U&'Burmese Days', a.id, 1934, 320,
  U&'Burma G\00FCnleri; s\00F6m\00FCrge d\00FCzeninin \00E7\00FCr\00FCm\00FC\015Fl\00FC\011F\00FCn\00FC Burma''da ge\00E7en bir romanda anlat\0131r.', U&'Klasik, Kurgu, Drama', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001974385001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'George Orwell'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Burma G\00FCnleri')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Aspidistra', U&'Keep the Aspidistra Flying', a.id, 1936, 288,
  U&'Aspidistra; para, s\0131n\0131f ve sanat\00E7\0131 gururunu anlatan erken bir Orwell roman\0131d\0131r.', U&'Klasik, Kurgu, Drama', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001905502001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'George Orwell'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Aspidistra')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kitaplar ve Sigaralar', U&'Books v. Cigarettes', a.id, 1952, 128,
  U&'Kitaplar ve Sigaralar; okuma, yazma ve g\00FCndelik hayat \00FCzerine Orwell denemelerinden bir derlemedir.', U&'Klasik, Deneme', 'eng', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001967208001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'George Orwell'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kitaplar ve Sigaralar')));

COMMIT;

SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE a.name IN (U&'Lev Tolstoy', U&'Albert Camus', U&'Franz Kafka', U&'George Orwell')
GROUP BY a.id, a.name ORDER BY a.name;
