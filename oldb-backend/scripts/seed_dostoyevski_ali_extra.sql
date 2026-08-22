-- Dostoyevski + Sabahattin Ali missing titles (D&R / OL covers)
-- docker cp oldb-backend/scripts/seed_dostoyevski_ali_extra.sql my_postgres:/tmp/seed_dostoyevski_ali_extra.sql
-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_dostoyevski_ali_extra.sql

BEGIN;

-- Fyodor Dostoyevski
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Delikanl\0131', U&'\041F\043E\0434\0440\043E\0441\0442\043E\043A', a.id, 1875, 672,
  U&'Delikanl\0131; gayrime\015Fru bir gencin kimlik, gurur ve ait olma aray\0131\015F\0131n\0131 anlat\0131r. Dostoyevski, gen\00E7li\011Fin karma\015Fas\0131n\0131 aile, s\0131n\0131f ve ideolojiyle i\00E7 i\00E7e i\015Fler.', U&'Klasik, Kurgu, Psikolojik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000058766-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Fyodor Dostoyevski'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Delikanl\0131')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\0130nsanc\0131klar', U&'\0411\0435\0434\043D\044B\0435 \043B\044E\0434\0438', a.id, 1846, 192,
  U&'\0130nsanc\0131klar; yoksul bir memur ile gen\00E7 bir kad\0131n\0131n mektupla\015Fmas\0131 \00FCzerinden Petersburg''un k\00FC\00E7\00FCk insanlar\0131n\0131n onurunu ve k\0131r\0131lganl\0131\011F\0131n\0131 anlat\0131r. Dostoyevski''nin ilk roman\0131d\0131r.', U&'Klasik, Kurgu, Drama', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0000000058678-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Fyodor Dostoyevski'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\0130nsanc\0131klar')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'\00D6teki', U&'\0414\0432\043E\0439\043D\0438\043A', a.id, 1846, 176,
  U&'\00D6teki (\0130kiz); Golyadkin''in kendi ikiziyle kar\015F\0131la\015Fmas\0131 \00FCzerinden paranooya, kimlik b\00F6l\00FCnmesi ve b\00FCrokratik a\015Fa\011F\0131laman\0131n psikolojik portresini \00E7izer.', U&'Klasik, Kurgu, Psikolojik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001887776001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Fyodor Dostoyevski'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'\00D6teki')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Ebedi Koca', U&'\0412\0435\0447\043D\044B\0439 \043C\0443\0436', a.id, 1870, 176,
  U&'Ebedi Koca; k\0131skan\00E7l\0131k, utan\00E7 ve intikam\0131n i\00E7 i\00E7e ge\00E7ti\011Fi yo\011Fun bir novellad\0131r. Dostoyevski, evlilik ve ihanetin psikolojik labirentini k\0131sa ama keskin bir anlat\0131da kurar.', U&'Klasik, Kurgu, Psikolojik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001932888001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Fyodor Dostoyevski'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Ebedi Koca')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Uysal K\0131z', U&'\041A\0440\043E\0442\043A\0430\044F', a.id, 1876, 96,
  U&'Uysal K\0131z; bir tefecinin gen\00E7 kar\0131s\0131n\0131n \00F6l\00FCm\00FC \00FCzerine kurdu\011Fu i\00E7 monolo\011Fu anlat\0131r. \0130ktidar, sevgi ve su\00E7luluk duygusu, Dostoyevski''nin en yo\011Fun k\0131sa eserlerinden birinde birle\015Fir.', U&'Klasik, Kurgu, Psikolojik', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002216214001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Fyodor Dostoyevski'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Uysal K\0131z')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'G\00FCl\00FCn\00E7 Bir Adam\0131n D\00FC\015F\00FC', U&'\0421\043E\043D \0441\043C\0435\0448\043D\043E\0433\043E \0447\0435\043B\043E\0432\0435\043A\0430', a.id, 1877, 64,
  U&'G\00FCl\00FCn\00E7 Bir Adam\0131n D\00FC\015F\00FC; intihar\0131n e\015Fi\011Findeki bir adam\0131n r\00FCyas\0131nda masum bir d\00FCnyay\0131 ve kendi su\00E7unu g\00F6rmesini anlat\0131r. Dostoyevski''nin ahlaki vizyonunu yo\011Funla\015Ft\0131ran bir \00F6yk\00FCd\00FCr.', U&'Klasik, Kurgu, Felsefe', 'rus', U&'https://covers.openlibrary.org/b/id/12261360-L.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Fyodor Dostoyevski'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'G\00FCl\00FCn\00E7 Bir Adam\0131n D\00FC\015F\00FC')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Timsah', U&'\041A\0440\043E\043A\043E\0434\0438\043B', a.id, 1865, 80,
  U&'Timsah; bir memurun canl\0131 bir timsah taraf\0131ndan yutulmas\0131 \00FCzerine kurulu abs\00FCrt ve satirical bir anlat\0131d\0131r. B\00FCrokrasi, kamuoyu ve \00E7\0131karc\0131l\0131k alaya al\0131n\0131r.', U&'Klasik, Kurgu, Satir', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0002017363001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Fyodor Dostoyevski'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Timsah')));

INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Yaz \0130zlenimleri \00DCzerine K\0131\015F Notlar\0131', U&'\0417\0438\043C\043D\0438\0435 \0437\0430\043C\0435\0442\043A\0438 \043E \043B\0435\0442\043D\0438\0445 \0432\043F\0435\0447\0430\0442\043B\0435\043D\0438\044F\0445', a.id, 1863, 144,
  U&'Yaz \0130zlenimleri \00DCzerine K\0131\015F Notlar\0131; Dostoyevski''nin Avrupa gezisinden do\011Fan g\00F6zlem ve ele\015Ftiri yaz\0131s\0131d\0131r. Bat\0131 modernli\011Fi, bireycilik ve Rus kimli\011Fi \00FCzerine d\00FC\015F\00FCn\00FCr.', U&'Klasik, Kurgu D\0131\015F\0131, Deneme', 'rus', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001885998001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Fyodor Dostoyevski'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Yaz \0130zlenimleri \00DCzerine K\0131\015F Notlar\0131')));

-- Sabahattin Ali
INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)
SELECT nextval('book_id_seq'),
  U&'Da\011Flar ve R\00FCzg\00E2r', U&'Da\011Flar ve R\00FCzg\00E2r', a.id, 1934, 96,
  U&'Da\011Flar ve R\00FCzg\00E2r; Sabahattin Ali''nin \015Fiir kitab\0131d\0131r. Do\011Fa, yaln\0131zl\0131k ve toplumsal duyarl\0131l\0131\011F\0131 lirik bir dilde bir araya getirir.', U&'Klasik, \015Eiir', 'tur', U&'https://i.dr.com.tr/cache/600x600-0/originals/0001859585001-1.jpg',
  false, false, false, false, NOW(), NOW(), 'seed', 'seed'
FROM authors a
WHERE lower(trim(a.name)) = lower(trim(U&'Sabahattin Ali'))
  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(U&'Da\011Flar ve R\00FCzg\00E2r')));

COMMIT;

SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id
WHERE a.name IN (U&'Fyodor Dostoyevski', U&'Sabahattin Ali')
GROUP BY a.id, a.name ORDER BY a.id;
