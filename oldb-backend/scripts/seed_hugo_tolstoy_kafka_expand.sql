-- Hugo / Tolstoy / Kafka expand + Turkish cover refresh (verified)
-- docker cp oldb-backend/scripts/seed_hugo_tolstoy_kafka_expand.sql my_postgres:/tmp/htk.sql
-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/htk.sql

BEGIN;

-- refresh Victor Hugo / Sefiller
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0002092782001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Les Mis\00E9rables'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Drama'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'fra'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Victor Hugo')))
  AND lower(trim(title)) = lower(trim(U&'Sefiller'));

-- refresh Victor Hugo / Notre-Dame'ın Kamburu
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000576984-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Notre-Dame de Paris'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Drama'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'fra'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Victor Hugo')))
  AND lower(trim(title)) = lower(trim(U&'Notre-Dame''\0131n Kamburu'));

-- refresh Victor Hugo / Deniz İşçileri
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001837993001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Les Travailleurs de la mer'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Macera'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'fra'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Victor Hugo')))
  AND lower(trim(title)) = lower(trim(U&'Deniz \0130\015F\00E7ileri'));

-- refresh Victor Hugo / Bir İdam Mahkûmunun Son Günü
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001968621001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Le Dernier Jour d''un condamn\00E9'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Drama'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'fra'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Victor Hugo')))
  AND lower(trim(title)) = lower(trim(U&'Bir \0130dam Mahk\00FBmunun Son G\00FCn\00FC'));

-- refresh Victor Hugo / Doksan Üç
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001740873001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Quatrevingt-treize'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Tarih'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'fra'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Victor Hugo')))
  AND lower(trim(title)) = lower(trim(U&'Doksan \00DC\00E7'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'G\00FClen Adam', U&'L''Homme qui rit', a.id, 1869, 640,
  U&'G\00FClen Adam; y\00FCz\00FC sakatlanm\0131\015F Gwynplaine \00FCzerinden aristokrasi, a\015Fk ve adaletsizli\011Fi anlat\0131r.', U&'Klasik, Kurgu, Drama', 'fra', U&'https://covers.openlibrary.org/b/id/7204845-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'G\00FClen Adam')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Claude Gueux', U&'Claude Gueux', a.id, 1834, 96,
  U&'Claude Gueux; hapishane, adalet ve toplumsal e\015Fitsizlik \00FCzerine k\0131sa ama g\00FC\00E7l\00FC bir anlat\0131d\0131r.', U&'Klasik, Kurgu, Drama', 'fra', U&'https://covers.openlibrary.org/b/id/2140567-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Claude Gueux')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Hernani', U&'Hernani', a.id, 1830, 192,
  U&'Hernani; romantizmin tiyatroda zaferini simgeleyen a\015Fk ve onur oyunudur.', U&'Klasik, Drama, Romantik', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000369780-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Hernani')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ruy Blas', U&'Ruy Blas', a.id, 1838, 192,
  U&'Ruy Blas; bir u\015Fa\011F\0131n soylu kimli\011Fe b\00FCr\00FCnmesiyle geli\015Fen entrika ve a\015Fk oyunudur.', U&'Klasik, Drama, Romantik', 'fra', U&'https://covers.openlibrary.org/b/id/8245386-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ruy Blas')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130zlanda Han\0131', U&'Han d''Islande', a.id, 1823, 400,
  U&'\0130zlanda Han\0131; Hugo''nun erken d\00F6nem gotik-romantik romanlar\0131ndan biridir.', U&'Klasik, Kurgu, Gerilim', 'fra', U&'https://covers.openlibrary.org/b/id/11347035-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130zlanda Han\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Bug-Jargal', U&'Bug-Jargal', a.id, 1826, 256,
  U&'Bug-Jargal; Haiti isyan\0131 d\00F6neminde dostluk ve \00F6zg\00FCrl\00FCk temas\0131n\0131 i\015Fleyen bir romand\0131r.', U&'Klasik, Kurgu, Tarih', 'fra', U&'https://covers.openlibrary.org/b/id/1966665-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Bug-Jargal')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Cromwell', U&'Cromwell', a.id, 1827, 320,
  U&'Cromwell; Hugo''nun romantizm bildirisi niteli\011Findeki \00F6ns\00F6z\00FCyle \00FCnl\00FC tarih oyunudur.', U&'Klasik, Drama, Tarih', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002207571001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Cromwell')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Marion de Lorme', U&'Marion de Lorme', a.id, 1829, 192,
  U&'Marion de Lorme; a\015Fk ve iktidar\0131n \00E7at\0131\015Fmas\0131n\0131 anlatan romantik bir oyundur.', U&'Klasik, Drama, Romantik', 'fra', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001895580001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Marion de Lorme')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\015Eiirler', U&'Po\00E9sies', a.id, 1856, 256,
  U&'\015Eiirler; Victor Hugo''nun lirik ve epik \015Fiirlerinden bir derlemedir.', U&'Klasik, \015Eiir', 'fra', U&'https://covers.openlibrary.org/b/id/8247081-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Victor Hugo'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\015Eiirler')));

-- refresh Lev Tolstoy / Savaş ve Barış
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001780357001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0412\043E\0439\043D\0430 \0438 \043C\0438\0440'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Tarih'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'Sava\015F ve Bar\0131\015F'));

-- refresh Lev Tolstoy / Anna Karenina
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000374848-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0410\043D\043D\0430 \041A\0430\0440\0435\043D\0438\043D\0430'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Romantik'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'Anna Karenina'));

-- refresh Lev Tolstoy / Diriliş
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000304801-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0412\043E\0441\043A\0440\0435\0441\0435\043D\0438\0435'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Drama'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'Dirili\015F'));

-- refresh Lev Tolstoy / İvan İlyiç'in Ölümü
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000585604-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0421\043C\0435\0440\0442\044C \0418\0432\0430\043D\0430 \0418\043B\044C\0438\0447\0430'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Felsefe'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'\0130van \0130lyi\00E7''in \00D6l\00FCm\00FC'));

-- refresh Lev Tolstoy / Kreutzer Sonatı
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000277206-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\041A\0440\0435\0439\0446\0435\0440\043E\0432\0430 \0441\043E\043D\0430\0442\0430'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Psikolojik'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'Kreutzer Sonat\0131'));

-- refresh Lev Tolstoy / Hacı Murat
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0002082822001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0425\0430\0434\0436\0438-\041C\0443\0440\0430\0442'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Tarih'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'Hac\0131 Murat'));

-- refresh Lev Tolstoy / Kazaklar
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0002235256001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\041A\0430\0437\0430\043A\0438'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Macera'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'Kazaklar'));

-- refresh Lev Tolstoy / Sivastopol
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000303607-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0421\0435\0432\0430\0441\0442\043E\043F\043E\043B\044C\0441\043A\0438\0435 \0440\0430\0441\0441\043A\0430\0437\044B'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Tarih'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'Sivastopol'));

-- refresh Lev Tolstoy / Efendi ile Uşağı
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000641887-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0425\043E\0437\044F\0438\043D \0438 \0440\0430\0431\043E\0442\043D\0438\043A'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, \00D6yk\00FC'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'Efendi ile U\015Fa\011F\0131'));

-- refresh Lev Tolstoy / İtiraf
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0002084471001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0418\0441\043F\043E\0432\0435\0434\044C'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu D\0131\015F\0131, Felsefe'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'rus'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Lev Tolstoy')))
  AND lower(trim(title)) = lower(trim(U&'\0130tiraf'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\00C7ocukluk', U&'\0414\0435\0442\0441\0442\0432\043E', a.id, 1852, 192,
  U&'\00C7ocukluk; Tolstoy''un otobiyografik \00FC\00E7lemesinin ilk kitab\0131d\0131r.', U&'Klasik, Kurgu, An\0131', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001793215001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\00C7ocukluk')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130lk Gen\00E7lik', U&'\041E\0442\0440\043E\0447\0435\0441\0442\0432\043E', a.id, 1854, 192,
  U&'\0130lk Gen\00E7lik; otobiyografik \00FC\00E7lemenin ikinci kitab\0131d\0131r.', U&'Klasik, Kurgu, An\0131', 'rus', U&'https://covers.openlibrary.org/b/id/4986307-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130lk Gen\00E7lik')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Gen\00E7lik', U&'\042E\043D\043E\0441\0442\044C', a.id, 1857, 224,
  U&'Gen\00E7lik; otobiyografik \00FC\00E7lemenin son kitab\0131d\0131r.', U&'Klasik, Kurgu, An\0131', 'rus', U&'https://covers.openlibrary.org/b/id/2762013-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Gen\00E7lik')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Aile Mutlulu\011Fu', U&'\0421\0435\043C\0435\0439\043D\043E\0435 \0441\0447\0430\0441\0442\0438\0435', a.id, 1859, 160,
  U&'Aile Mutlulu\011Fu; evlilik ideali ile ger\00E7ekli\011Fin \00E7at\0131\015Fmas\0131n\0131 anlatan bir novellad\0131r.', U&'Klasik, Kurgu, Romantik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001897216001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Aile Mutlulu\011Fu')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130nsan Neyle Ya\015Far', U&'\0427\0435\043C \043B\044E\0434\0438 \0436\0438\0432\044B', a.id, 1885, 96,
  U&'\0130nsan Neyle Ya\015Far; merhamet ve insanl\0131k \00FCzerine alegorik bir \00F6yk\00FCd\00FCr.', U&'Klasik, Kurgu, \00D6yk\00FC', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001886528001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130nsan Neyle Ya\015Far')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Baba Sergiy', U&'\041E\0442\0435\0446 \0421\0435\0440\0433\0438\0439', a.id, 1911, 128,
  U&'Baba Sergiy; gurur, inan\00E7 ve \00E7ile \00FCzerine ge\00E7 d\00F6nem bir Tolstoy anlat\0131s\0131d\0131r.', U&'Klasik, Kurgu, Felsefe', 'rus', U&'https://covers.openlibrary.org/b/id/1760955-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Baba Sergiy')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\015Eeytan', U&'\0414\044C\044F\0432\043E\043B', a.id, 1911, 112,
  U&'\015Eeytan; tutku ve ahlaki \00E7\00F6k\00FC\015F\00FC anlatan yo\011Fun bir novellad\0131r.', U&'Klasik, Kurgu, Psikolojik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002047728001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\015Eeytan')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Kafkas Esiri', U&'\041A\0430\0432\043A\0430\0437\0441\043A\0438\0439 \043F\043B\0435\043D\043D\0438\043A', a.id, 1872, 80,
  U&'Kafkas Esiri; esaret ve ka\00E7\0131\015F \00FCzerine k\0131sa ama g\00FC\00E7l\00FC bir \00F6yk\00FCd\00FCr.', U&'Klasik, Kurgu, Macera', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000330677-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Kafkas Esiri')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Poliku\015Fka', U&'\041F\043E\043B\0438\043A\0443\0448\043A\0430', a.id, 1863, 112,
  U&'Poliku\015Fka; bir serfin trajik kaderini anlatan toplumsal bir \00F6yk\00FCd\00FCr.', U&'Klasik, Kurgu, Drama', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001828679001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Poliku\015Fka')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Sanat Nedir?', U&'\0427\0442\043E \0442\0430\043A\043E\0435 \0438\0441\043A\0443\0441\0441\0442\0432\043E?', a.id, 1897, 256,
  U&'Sanat Nedir?; Tolstoy''un sanat\0131n toplumsal ve ahlaki i\015Flevini sorgulad\0131\011F\0131 denemesidir.', U&'Klasik, Kurgu D\0131\015F\0131, Deneme', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000250888-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Sanat Nedir?')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130ki S\00FCvari', U&'\0414\0432\0430 \0433\0443\0441\0430\0440\0430', a.id, 1856, 128,
  U&'\0130ki S\00FCvari; iki ku\015Fa\011F\0131n ahlak ve ya\015Fam tarz\0131n\0131 kar\015F\0131la\015Ft\0131ran bir \00F6yk\00FCd\00FCr.', U&'Klasik, Kurgu, Drama', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001989041001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130ki S\00FCvari')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Toprak Sahibinin Sabah\0131', U&'\0423\0442\0440\043E \043F\043E\043C\0435\0449\0438\043A\0430', a.id, 1856, 96,
  U&'Toprak Sahibinin Sabah\0131; k\00F6yl\00FC reformu hayalleriyle ger\00E7ekli\011Fin \00E7at\0131\015Fmas\0131n\0131 anlat\0131r.', U&'Klasik, Kurgu, Drama', 'rus', U&'https://covers.openlibrary.org/b/id/11616112-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Lev Tolstoy'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Toprak Sahibinin Sabah\0131')));

-- refresh Franz Kafka / Dönüşüm
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001935985001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Die Verwandlung'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Fantastik'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'deu'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka')))
  AND lower(trim(title)) = lower(trim(U&'D\00F6n\00FC\015F\00FCm'));

-- refresh Franz Kafka / Dava
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001906885001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Der Process'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Gerilim'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'deu'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka')))
  AND lower(trim(title)) = lower(trim(U&'Dava'));

-- refresh Franz Kafka / Şato
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001869714001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Das Schloss'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Fantastik'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'deu'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka')))
  AND lower(trim(title)) = lower(trim(U&'\015Eato'));

-- refresh Franz Kafka / Amerika
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000155281-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Der Verschollene'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Macera'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'deu'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka')))
  AND lower(trim(title)) = lower(trim(U&'Amerika'));

-- refresh Franz Kafka / Açlık Sanatçısı
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001925404001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Ein Hungerk\00FCnstler'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, \00D6yk\00FC'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'deu'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka')))
  AND lower(trim(title)) = lower(trim(U&'A\00E7l\0131k Sanat\00E7\0131s\0131'));

-- refresh Franz Kafka / Ceza Sömürgesi
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001877254001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'In der Strafkolonie'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu, Gerilim'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'deu'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka')))
  AND lower(trim(title)) = lower(trim(U&'Ceza S\00F6m\00FCrgesi'));

-- refresh Franz Kafka / Babaya Mektup
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000708515-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Brief an den Vater'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Kurgu D\0131\015F\0131, An\0131'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'deu'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka')))
  AND lower(trim(title)) = lower(trim(U&'Babaya Mektup'));

-- refresh Franz Kafka / Aforizmalar
UPDATE books SET
  cover_url = U&'https://i.dr.com.tr/cache/600x600-0/originals/0001956843001-1.jpg',
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'Aphorismen'),
  genres = COALESCE(NULLIF(TRIM(genres), ''), U&'Klasik, Felsefe, Deneme'),
  language = COALESCE(NULLIF(TRIM(language), ''), 'deu'),
  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(U&'Franz Kafka')))
  AND lower(trim(title)) = lower(trim(U&'Aforizmalar'));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Milena''ya Mektuplar', U&'Briefe an Milena', a.id, 1952, 320,
  U&'Milena''ya Mektuplar; Kafka''n\0131n Milena Jesensk\00E1 ile yaz\0131\015Fmalar\0131n\0131 i\00E7erir.', U&'Klasik, Kurgu D\0131\015F\0131, Mektup', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002187623001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Milena''ya Mektuplar')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'G\00FCnl\00FCkler', U&'Tageb\00FCcher', a.id, 1948, 480,
  U&'G\00FCnl\00FCkler; Kafka''n\0131n yazma s\00FCreci, kayg\0131lar\0131 ve g\00F6zlemlerini kaydetti\011Fi notlard\0131r.', U&'Klasik, Kurgu D\0131\015F\0131, G\00FCnl\00FCk', 'deu', U&'https://covers.openlibrary.org/b/id/8253442-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'G\00FCnl\00FCkler')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Bir K\00F6y Hekimi', U&'Ein Landarzt', a.id, 1919, 96,
  U&'Bir K\00F6y Hekimi; r\00FCya mant\0131\011F\0131yla \00F6r\00FClm\00FC\015F \00F6yk\00FClerden olu\015Fan bir derlemedir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://covers.openlibrary.org/b/id/1046013-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Bir K\00F6y Hekimi')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Yarg\0131', U&'Das Urteil', a.id, 1913, 64,
  U&'Yarg\0131; baba-o\011Ful \00E7at\0131\015Fmas\0131n\0131 k\0131sa ve sars\0131c\0131 bir \00F6yk\00FCde yo\011Funla\015Ft\0131r\0131r.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://covers.openlibrary.org/b/id/1117972-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Yarg\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\00C7in Seddi''nin \0130n\015Fas\0131', U&'Beim Bau der Chinesischen Mauer', a.id, 1931, 128,
  U&'\00C7in Seddi''nin \0130n\015Fas\0131; b\00FCrokrasi ve tamamlanamayan b\00FCy\00FCk i\015Fler \00FCzerine alegorik \00F6yk\00FClerdir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://covers.openlibrary.org/b/id/108061-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\00C7in Seddi''nin \0130n\015Fas\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130n', U&'Der Bau', a.id, 1924, 80,
  U&'\0130n; g\00FCvenlik saplant\0131s\0131 i\00E7indeki bir yarat\0131\011F\0131n yeralt\0131 yuvas\0131n\0131 anlat\0131r.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://covers.openlibrary.org/b/id/14447992-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130n')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'K\0131rsalda D\00FC\011F\00FCn Haz\0131rl\0131klar\0131', U&'Hochzeitsvorbereitungen auf dem Lande', a.id, 1953, 160,
  U&'K\0131rsalda D\00FC\011F\00FCn Haz\0131rl\0131klar\0131; Kafka''n\0131n tamamlanmam\0131\015F erken d\00F6nem metinlerindendir.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002130653001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'K\0131rsalda D\00FC\011F\00FCn Haz\0131rl\0131klar\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\015Eark\0131c\0131 Josephine', U&'Josefine, die S\00E4ngerin', a.id, 1924, 64,
  U&'\015Eark\0131c\0131 Josephine; sanat\00E7\0131 ile toplum ili\015Fkisini fareler halk\0131 \00FCzerinden anlat\0131r.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://covers.openlibrary.org/b/id/10556788-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\015Eark\0131c\0131 Josephine')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Bl\00FCmfeld', U&'Blumfeld, ein \00E4lterer Junggeselle', a.id, 1936, 80,
  U&'Bl\00FCmfeld; yaln\0131z bir bek\00E2r\0131n abs\00FCrt g\00FCndelik hayat\0131n\0131 anlatan bir \00F6yk\00FCd\00FCr.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://covers.openlibrary.org/b/id/6908257-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Bl\00FCmfeld')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'D\00FC\015F\00FCnceler', U&'Betrachtung', a.id, 1913, 96,
  U&'D\00FC\015F\00FCnceler (Betrachtung); Kafka''n\0131n ilk bas\0131lan k\0131sa d\00FCzyaz\0131 par\00E7alar\0131d\0131r.', U&'Klasik, Kurgu, \00D6yk\00FC', 'deu', U&'https://covers.openlibrary.org/b/id/3321911-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Franz Kafka'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'D\00FC\015F\00FCnceler')));

COMMIT;

SELECT a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE a.name IN (U&'Victor Hugo', U&'Lev Tolstoy', U&'Franz Kafka')
GROUP BY a.name ORDER BY a.name;
