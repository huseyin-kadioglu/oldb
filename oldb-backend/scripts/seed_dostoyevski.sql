-- Dostoyevski katalog seed (Türkçe açıklama + tür + dil)
--
-- Windows'ta güvenli yükleme (UTF-8 bozulmasın):
--   docker cp oldb-backend/scripts/seed_dostoyevski.sql my_postgres:/tmp/seed_dostoyevski.sql
--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_dostoyevski.sql
--
-- Eksik alanları düzeltmek için:
--   python oldb-backend/scripts/_gen_dostoyevski_fix.py
--   docker cp oldb-backend/scripts/seed_dostoyevski_fix.sql my_postgres:/tmp/fix.sql
--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/fix.sql
--
-- Alternatif yollar:
--   1) UI: /catalogEditor  (staff — tek tek, ISBN lookup ile)
--   2) Open Library toplu: POST /admin/catalog/import-open-library  (İngilizce ağırlıklı)
--   3) Bu SQL seed: kontrollü Türkçe içerik

BEGIN;

-- Yazar metadata (id=1 varsayımı; yoksa isimle bul)
UPDATE authors SET
  country = COALESCE(NULLIF(TRIM(country), ''), 'Rusya'),
  birth_year = COALESCE(birth_year, 1821),
  death_year = COALESCE(death_year, 1881),
  description = COALESCE(NULLIF(TRIM(description), ''),
    'Fyodor Mihayloviç Dostoyevski (1821–1881), Rus edebiyatının en etkili romancılarındandır. '
    'Suç, vicdan, inanç ve özgür irade temalarını psikolojik derinliklerle işler. '
    'Eserleri modern romanın temel taşları arasında yer alır.')
WHERE id = 1 OR name ILIKE 'Fyodor Dostoyevski';

-- Mevcut kitapları zenginleştir
UPDATE books SET
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), 'Преступление и наказание'),
  language = 'rus',
  genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Psikolojik'),
  description = CASE
    WHEN description IS NULL OR LENGTH(TRIM(description)) < 80 THEN
      'Suç ve Ceza; Rodion Romanoviç Raskolnikov''un işlediği cinayet sonrası vicdanı, '
      'ideolojisi ve Petersburg''un yoksul sokakları arasında sıkışan ruhsal çöküşünü anlatır. '
      'Dostoyevski, suçun ahlaki bedelini ve kurtuluş ihtimalini modern bireyin iç dünyasında arar.'
    ELSE description
  END,
  updated_at = NOW(),
  updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = 1 AND title = 'Suç ve Ceza';

UPDATE books SET
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), 'Братья Карамазовы'),
  language = 'rus',
  genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Felsefe'),
  page_count = COALESCE(page_count, 1040),
  description =
    'Karamazov Kardeşler; baba–oğul ilişkisi, inanç, özgürlük ve sorumluluk üzerine '
    'Dostoyevski''nin en kapsamlı romanıdır. Dimitri, İvan ve Alyoşa''nın yolları, '
    'bir cinayet etrafında ahlaki ve metafizik bir çatışmaya dönüşür.',
  updated_at = NOW(),
  updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = 1 AND title = 'Karamazov Kardeşler';

UPDATE books SET
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), 'Идиот'),
  language = 'rus',
  genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Drama'),
  description = CASE
    WHEN description IS NULL OR LENGTH(TRIM(description)) < 80 THEN
      'Budala; saf ve iyiliksever Prens Mışkin''in Petersburg toplumuna dönüşünü anlatır. '
      'Masumiyetin yozlaşmış bir dünyada nasıl karşılandığını, aşk, gurur ve acı üzerinden işler.'
    ELSE description
  END,
  updated_at = NOW(),
  updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = 1 AND title = 'Budala';

UPDATE books SET
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), 'Игрок'),
  language = 'rus',
  genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Psikolojik'),
  description = CASE
    WHEN description IS NULL OR LENGTH(TRIM(description)) < 80 THEN
      'Kumarbaz; kumar bağımlılığı ile takıntılı bir aşkı birleştiren kısa ama yoğun bir romandır. '
      'İrade, utanç ve tutku, Avrupa''nın kumar salonlarında iç içe geçer.'
    ELSE description
  END,
  updated_at = NOW(),
  updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = 1 AND title = 'Kumarbaz';

UPDATE books SET
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), 'Записки из подполья'),
  language = 'rus',
  genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Felsefe'),
  description = CASE
    WHEN description IS NULL OR LENGTH(TRIM(description)) < 80 THEN
      'Yeraltından Notlar; modern bireyin yalnızlığını, öfkesini ve iç çatışmasını '
      'keskin bir monologla anlatır. Dostoyevski''nin varoluşsal romanlarının kapısını aralar.'
    ELSE description
  END,
  updated_at = NOW(),
  updated_by = COALESCE(updated_by, 'seed')
WHERE author_id = 1 AND title = 'Yeraltından Notlar';

-- Eksik başlıca eserler (yinelenen title+year varsa atla)
INSERT INTO books (
  id, title, original_title, author_id, publication_year, page_count,
  description, genres, language, cover_url,
  is_won_nobel_prize, editor_choice, weekly_pick, new_release,
  created_at, updated_at, created_by, updated_by
)
SELECT nextval('book_id_seq'), v.title, v.original_title, 1, v.year, v.pages,
       v.description, v.genres, 'rus', v.cover_url,
       false, false, false, false,
       NOW(), NOW(), 'seed', 'seed'
FROM (VALUES
  (
    'Ecinniler',
    'Бесы',
    1872,
    760,
    'Ecinniler; ideolojik fanatizm, manipülasyon ve toplumsal çöküşü anlatan karanlık bir romandır. '
    'Küçük bir taşra kentinde yükselen siyasal şiddet, inançsızlık ve ahlaki boşluğu görünür kılar.',
    'Klasik, Kurgu, Gerilim',
    'https://covers.openlibrary.org/b/isbn/9780140447608-L.jpg'
  ),
  (
    'Beyaz Geceler',
    'Белые ночи',
    1848,
    96,
    'Beyaz Geceler; Petersburg''un beyaz gecelerinde geçen kısa bir aşk ve yalnızlık hikâyesidir. '
    'Düş ile gerçek arasında salınan anlatıcı, kısa bir tanışmanın izini taşır.',
    'Klasik, Kurgu, Romantik',
    'https://covers.openlibrary.org/b/isbn/9780140447486-L.jpg'
  ),
  (
    'Ölüler Evinden Anılar',
    'Записки из Мёртвого дома',
    1861,
    368,
    'Ölüler Evinden Anılar; Dostoyevski''nin sürgün ve hapishane deneyiminden beslenen '
    'yarı otobiyografik bir eserdir. İnsan onuru, ceza ve dayanışmayı sert bir gerçekçilikle anlatır.',
    'Klasik, Kurgu Dışı, Anı',
    'https://covers.openlibrary.org/b/isbn/9780140444560-L.jpg'
  ),
  (
    'Ezilenler',
    'Униженные и оскорблённые',
    1861,
    416,
    'Ezilenler; yoksulluk, gurur ve yaralı onur etrafında örülen erken dönem bir romandır. '
    'Aile bağları ve fedakârlık, Petersburg''un toplumsal uçurumunda sınanır.',
    'Klasik, Kurgu, Drama',
    'https://covers.openlibrary.org/b/isbn/9781847492944-L.jpg'
  )
) AS v(title, original_title, year, pages, description, genres, cover_url)
WHERE NOT EXISTS (
  SELECT 1 FROM books b
  WHERE b.author_id = 1
    AND lower(trim(b.title)) = lower(trim(v.title))
);

COMMIT;

SELECT id, title, publication_year, genres, length(description) AS desc_len
FROM books
WHERE author_id = 1
ORDER BY publication_year DESC;
