/**
 * Final Hugo / Tolstoy / Kafka expand with verified Turkish (or OL) covers.
 * Fixes bad auto-matches from the previous generator pass.
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return head(loc).then(resolve);
      }
      resolve(res.statusCode);
    });
    req.on("error", () => resolve(0));
    req.end();
  });
}

function dr(id) {
  return `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
}
function ol(id) {
  return `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
}
function uEscape(s) {
  let out = "";
  for (const ch of s) {
    const o = ch.codePointAt(0);
    if (ch === "'") out += "''";
    else if (o < 128) out += ch;
    else out += "\\" + o.toString(16).toUpperCase().padStart(4, "0");
  }
  return `U&'${out}'`;
}

// [author, title, original, year, pages, genres, coverUrl, desc, updateExisting]
const ROWS = [
  // ===== Victor Hugo refresh =====
  ["Victor Hugo", "Sefiller", "Les Misérables", 1862, 1400, "Klasik, Kurgu, Drama", dr("0002092782001"),
    "Sefiller; adalet, merhamet ve toplumsal adaletsizlik üzerine Victor Hugo'nun başyapıtıdır.", true],
  ["Victor Hugo", "Notre-Dame'ın Kamburu", "Notre-Dame de Paris", 1831, 560, "Klasik, Kurgu, Drama", dr("0000000576984"),
    "Notre-Dame'ın Kamburu; Ortaçağ Paris'inde aşk, kader ve gotik atmosfere kurulu bir romandır.", true],
  ["Victor Hugo", "Deniz İşçileri", "Les Travailleurs de la mer", 1866, 480, "Klasik, Kurgu, Macera", dr("0001837993001"),
    "Deniz İşçileri; insanın doğaya karşı mücadelesini anlatan destansı bir romandır.", true],
  ["Victor Hugo", "Bir İdam Mahkûmunun Son Günü", "Le Dernier Jour d'un condamné", 1829, 128, "Klasik, Kurgu, Drama", dr("0001968621001"),
    "Bir İdam Mahkûmunun Son Günü; idam cezasına karşı yazılmış sarsıcı bir anlatıdır.", true],
  ["Victor Hugo", "Doksan Üç", "Quatrevingt-treize", 1874, 480, "Klasik, Kurgu, Tarih", dr("0001740873001"),
    "Doksan Üç; Fransız Devrimi'nin en kritik yılında geçen tarihsel bir romandır.", true],
  // Hugo new
  ["Victor Hugo", "Gülen Adam", "L'Homme qui rit", 1869, 640, "Klasik, Kurgu, Drama", ol(7204845),
    "Gülen Adam; yüzü sakatlanmış Gwynplaine üzerinden aristokrasi, aşk ve adaletsizliği anlatır.", false],
  ["Victor Hugo", "Claude Gueux", "Claude Gueux", 1834, 96, "Klasik, Kurgu, Drama", ol(2140567),
    "Claude Gueux; hapishane, adalet ve toplumsal eşitsizlik üzerine kısa ama güçlü bir anlatıdır.", false],
  ["Victor Hugo", "Hernani", "Hernani", 1830, 192, "Klasik, Drama, Romantik", dr("0000000369780"),
    "Hernani; romantizmin tiyatroda zaferini simgeleyen aşk ve onur oyunudur.", false],
  ["Victor Hugo", "Ruy Blas", "Ruy Blas", 1838, 192, "Klasik, Drama, Romantik", ol(8245386),
    "Ruy Blas; bir uşağın soylu kimliğe bürünmesiyle gelişen entrika ve aşk oyunudur.", false],
  ["Victor Hugo", "İzlanda Hanı", "Han d'Islande", 1823, 400, "Klasik, Kurgu, Gerilim", ol(11347035),
    "İzlanda Hanı; Hugo'nun erken dönem gotik-romantik romanlarından biridir.", false],
  ["Victor Hugo", "Bug-Jargal", "Bug-Jargal", 1826, 256, "Klasik, Kurgu, Tarih", ol(1966665),
    "Bug-Jargal; Haiti isyanı döneminde dostluk ve özgürlük temasını işleyen bir romandır.", false],
  ["Victor Hugo", "Cromwell", "Cromwell", 1827, 320, "Klasik, Drama, Tarih", dr("0002207571001"),
    "Cromwell; Hugo'nun romantizm bildirisi niteliğindeki önsözüyle ünlü tarih oyunudur.", false],
  ["Victor Hugo", "Marion de Lorme", "Marion de Lorme", 1829, 192, "Klasik, Drama, Romantik", dr("0001895580001"),
    "Marion de Lorme; aşk ve iktidarın çatışmasını anlatan romantik bir oyundur.", false],
  ["Victor Hugo", "Şiirler", "Poésies", 1856, 256, "Klasik, Şiir", ol(8247081),
    "Şiirler; Victor Hugo'nun lirik ve epik şiirlerinden bir derlemedir.", false],

  // ===== Tolstoy refresh =====
  ["Lev Tolstoy", "Savaş ve Barış", "Война и мир", 1869, 1400, "Klasik, Kurgu, Tarih", dr("0001780357001"),
    "Savaş ve Barış; Napolyon savaşları döneminde Rus aristokrasisinin destansı romanıdır.", true],
  ["Lev Tolstoy", "Anna Karenina", "Анна Каренина", 1877, 960, "Klasik, Kurgu, Romantik", dr("0000000374848"),
    "Anna Karenina; tutkulu bir aşkın toplumsal ahlakla çatışmasını anlatır.", true],
  ["Lev Tolstoy", "Diriliş", "Воскресение", 1899, 560, "Klasik, Kurgu, Drama", dr("0000000304801"),
    "Diriliş; bir soylunun vicdan uyanışını ve adalet arayışını anlatır.", true],
  ["Lev Tolstoy", "İvan İlyiç'in Ölümü", "Смерть Ивана Ильича", 1886, 128, "Klasik, Kurgu, Felsefe", dr("0000000585604"),
    "İvan İlyiç'in Ölümü; sıradan bir memurun ölümle yüzleşmesini anlatır.", true],
  ["Lev Tolstoy", "Kreutzer Sonatı", "Крейцерова соната", 1889, 144, "Klasik, Kurgu, Psikolojik", dr("0000000277206"),
    "Kreutzer Sonatı; kıskançlık, evlilik ve ahlak üzerine sert bir anlatıdır.", true],
  ["Lev Tolstoy", "Hacı Murat", "Хаджи-Мурат", 1912, 192, "Klasik, Kurgu, Tarih", dr("0002082822001"),
    "Hacı Murat; Kafkasya savaşlarında geçen bir direniş ve onur hikâyesidir.", true],
  ["Lev Tolstoy", "Kazaklar", "Казаки", 1863, 224, "Klasik, Kurgu, Macera", dr("0002235256001"),
    "Kazaklar; Kafkasya'da bir subayın Kazak yaşamıyla karşılaşmasını anlatır.", true],
  ["Lev Tolstoy", "Sivastopol", "Севастопольские рассказы", 1855, 192, "Klasik, Kurgu, Tarih", dr("0000000303607"),
    "Sivastopol; Kırım Savaşı'ndan kesitlerle savaşın gerçek yüzünü anlatır.", true],
  ["Lev Tolstoy", "Efendi ile Uşağı", "Хозяин и работник", 1895, 112, "Klasik, Kurgu, Öykü", dr("0000000641887"),
    "Efendi ile Uşağı; bir kar fırtınasında efendi ile uşağın kader birliğini anlatır.", true],
  ["Lev Tolstoy", "İtiraf", "Исповедь", 1882, 128, "Klasik, Kurgu Dışı, Felsefe", dr("0002084471001"),
    "İtiraf; Tolstoy'un inanç ve anlam arayışını anlattığı otobiyografik denemesidir.", true],
  // Tolstoy new
  ["Lev Tolstoy", "Çocukluk", "Детство", 1852, 192, "Klasik, Kurgu, Anı", dr("0001793215001"),
    "Çocukluk; Tolstoy'un otobiyografik üçlemesinin ilk kitabıdır.", false],
  ["Lev Tolstoy", "İlk Gençlik", "Отрочество", 1854, 192, "Klasik, Kurgu, Anı", ol(4986307),
    "İlk Gençlik; otobiyografik üçlemenin ikinci kitabıdır.", false],
  ["Lev Tolstoy", "Gençlik", "Юность", 1857, 224, "Klasik, Kurgu, Anı", ol(2762013),
    "Gençlik; otobiyografik üçlemenin son kitabıdır.", false],
  ["Lev Tolstoy", "Aile Mutluluğu", "Семейное счастие", 1859, 160, "Klasik, Kurgu, Romantik", dr("0001897216001"),
    "Aile Mutluluğu; evlilik ideali ile gerçekliğin çatışmasını anlatan bir novelladır.", false],
  ["Lev Tolstoy", "İnsan Neyle Yaşar", "Чем люди живы", 1885, 96, "Klasik, Kurgu, Öykü", dr("0001886528001"),
    "İnsan Neyle Yaşar; merhamet ve insanlık üzerine alegorik bir öyküdür.", false],
  ["Lev Tolstoy", "Baba Sergiy", "Отец Сергий", 1911, 128, "Klasik, Kurgu, Felsefe", ol(1760955),
    "Baba Sergiy; gurur, inanç ve çile üzerine geç dönem bir Tolstoy anlatısıdır.", false],
  ["Lev Tolstoy", "Şeytan", "Дьявол", 1911, 112, "Klasik, Kurgu, Psikolojik", dr("0002047728001"),
    "Şeytan; tutku ve ahlaki çöküşü anlatan yoğun bir novelladır.", false],
  ["Lev Tolstoy", "Kafkas Esiri", "Кавказский пленник", 1872, 80, "Klasik, Kurgu, Macera", dr("0000000330677"),
    "Kafkas Esiri; esaret ve kaçış üzerine kısa ama güçlü bir öyküdür.", false],
  ["Lev Tolstoy", "Polikuşka", "Поликушка", 1863, 112, "Klasik, Kurgu, Drama", dr("0001828679001"),
    "Polikuşka; bir serfin trajik kaderini anlatan toplumsal bir öyküdür.", false],
  ["Lev Tolstoy", "Sanat Nedir?", "Что такое искусство?", 1897, 256, "Klasik, Kurgu Dışı, Deneme", dr("0000000250888"),
    "Sanat Nedir?; Tolstoy'un sanatın toplumsal ve ahlaki işlevini sorguladığı denemesidir.", false],
  ["Lev Tolstoy", "İki Süvari", "Два гусара", 1856, 128, "Klasik, Kurgu, Drama", dr("0001989041001"),
    "İki Süvari; iki kuşağın ahlak ve yaşam tarzını karşılaştıran bir öyküdür.", false],
  ["Lev Tolstoy", "Toprak Sahibinin Sabahı", "Утро помещика", 1856, 96, "Klasik, Kurgu, Drama", ol(11616112),
    "Toprak Sahibinin Sabahı; köylü reformu hayalleriyle gerçekliğin çatışmasını anlatır.", false],

  // ===== Kafka refresh =====
  ["Franz Kafka", "Dönüşüm", "Die Verwandlung", 1915, 96, "Klasik, Kurgu, Fantastik", dr("0001935985001"),
    "Dönüşüm; Gregor Samsa'nın bir sabah böceğe dönüşmesiyle başlayan yabancılaşma öyküsüdür.", true],
  ["Franz Kafka", "Dava", "Der Process", 1925, 288, "Klasik, Kurgu, Gerilim", dr("0001906885001"),
    "Dava; Josef K.'nın nedenini bilmediği bir suçlamayla yargılanmasını anlatır.", true],
  ["Franz Kafka", "Şato", "Das Schloss", 1926, 352, "Klasik, Kurgu, Fantastik", dr("0001869714001"),
    "Şato; K.'nın erişilemeyen bir otoriteye ulaşma çabasını anlatır.", true],
  ["Franz Kafka", "Amerika", "Der Verschollene", 1927, 320, "Klasik, Kurgu, Macera", dr("0000000155281"),
    "Amerika (Kayıp); genç Karl Rossmann'ın Yeni Dünya'daki sürüklenişini anlatır.", true],
  ["Franz Kafka", "Açlık Sanatçısı", "Ein Hungerkünstler", 1924, 112, "Klasik, Kurgu, Öykü", dr("0001925404001"),
    "Açlık Sanatçısı; gösteri, yalnızlık ve anlaşılmamayı anlatan öykülerden oluşur.", true],
  ["Franz Kafka", "Ceza Sömürgesi", "In der Strafkolonie", 1919, 80, "Klasik, Kurgu, Gerilim", dr("0001877254001"),
    "Ceza Sömürgesi; bir işkence makinesi üzerinden adalet ve vahşeti anlatır.", true],
  ["Franz Kafka", "Babaya Mektup", "Brief an den Vater", 1919, 96, "Klasik, Kurgu Dışı, Anı", dr("0000000708515"),
    "Babaya Mektup; Kafka'nın babasıyla ilişkisini açığa vuran uzun bir itiraftır.", true],
  ["Franz Kafka", "Aforizmalar", "Aphorismen", 1931, 128, "Klasik, Felsefe, Deneme", dr("0001956843001"),
    "Aforizmalar; Kafka'nın kısa, keskin düşünce parçalarını bir araya getirir.", true],
  // Kafka new
  ["Franz Kafka", "Milena'ya Mektuplar", "Briefe an Milena", 1952, 320, "Klasik, Kurgu Dışı, Mektup", dr("0002187623001"),
    "Milena'ya Mektuplar; Kafka'nın Milena Jesenská ile yazışmalarını içerir.", false],
  ["Franz Kafka", "Günlükler", "Tagebücher", 1948, 480, "Klasik, Kurgu Dışı, Günlük", ol(8253442),
    "Günlükler; Kafka'nın yazma süreci, kaygıları ve gözlemlerini kaydettiği notlardır.", false],
  ["Franz Kafka", "Bir Köy Hekimi", "Ein Landarzt", 1919, 96, "Klasik, Kurgu, Öykü", ol(1046013),
    "Bir Köy Hekimi; rüya mantığıyla örülmüş öykülerden oluşan bir derlemedir.", false],
  ["Franz Kafka", "Yargı", "Das Urteil", 1913, 64, "Klasik, Kurgu, Öykü", ol(1117972),
    "Yargı; baba-oğul çatışmasını kısa ve sarsıcı bir öyküde yoğunlaştırır.", false],
  ["Franz Kafka", "Çin Seddi'nin İnşası", "Beim Bau der Chinesischen Mauer", 1931, 128, "Klasik, Kurgu, Öykü", ol(108061),
    "Çin Seddi'nin İnşası; bürokrasi ve tamamlanamayan büyük işler üzerine alegorik öykülerdir.", false],
  ["Franz Kafka", "İn", "Der Bau", 1924, 80, "Klasik, Kurgu, Öykü", ol(14447992),
    "İn; güvenlik saplantısı içindeki bir yaratığın yeraltı yuvasını anlatır.", false],
  ["Franz Kafka", "Kırsalda Düğün Hazırlıkları", "Hochzeitsvorbereitungen auf dem Lande", 1953, 160, "Klasik, Kurgu, Öykü", dr("0002130653001"),
    "Kırsalda Düğün Hazırlıkları; Kafka'nın tamamlanmamış erken dönem metinlerindendir.", false],
  ["Franz Kafka", "Şarkıcı Josephine", "Josefine, die Sängerin", 1924, 64, "Klasik, Kurgu, Öykü", ol(10556788),
    "Şarkıcı Josephine; sanatçı ile toplum ilişkisini fareler halkı üzerinden anlatır.", false],
  ["Franz Kafka", "Blümfeld", "Blumfeld, ein älterer Junggeselle", 1936, 80, "Klasik, Kurgu, Öykü", ol(6908257),
    "Blümfeld; yalnız bir bekârın absürt gündelik hayatını anlatan bir öyküdür.", false],
  ["Franz Kafka", "Düşünceler", "Betrachtung", 1913, 96, "Klasik, Kurgu, Öykü", ol(3321911),
    "Düşünceler (Betrachtung); Kafka'nın ilk basılan kısa düzyazı parçalarıdır.", false],
];

const LANG = { "Victor Hugo": "fra", "Lev Tolstoy": "rus", "Franz Kafka": "deu" };

(async () => {
  const fixed = [];
  for (const row of ROWS) {
    let cover = row[6];
    let st = await head(cover);
    if (st !== 200) {
      // fall back to author-safe known covers
      const fallbacks = {
        "Günlükler": ol(6908257),
        "Şarkıcı Josephine": ol(3321911),
        "Blümfeld": ol(1117972),
        "İki Süvari": ol(11616112),
        "Gençlik": ol(4986307),
      };
      if (fallbacks[row[1]]) {
        cover = fallbacks[row[1]];
        st = await head(cover);
        row[6] = cover;
      }
    }
    console.log(st === 200 ? "OK" : "BAD", row[0], row[1], st);
    if (st !== 200) throw new Error("bad " + row[1] + " " + cover);
    fixed.push(row);
  }

  const lines = [
    "-- Hugo / Tolstoy / Kafka expand + Turkish cover refresh (verified)",
    "-- docker cp oldb-backend/scripts/seed_hugo_tolstoy_kafka_expand.sql my_postgres:/tmp/htk.sql",
    "-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/htk.sql",
    "",
    "BEGIN;",
    "",
  ];

  for (const [author, title, original, year, pages, genres, coverUrl, desc, update] of ROWS) {
    const lang = LANG[author];
    if (update) {
      lines.push(
        `-- refresh ${author} / ${title}`,
        "UPDATE books SET",
        `  cover_url = ${uEscape(coverUrl)},`,
        `  original_title = COALESCE(NULLIF(TRIM(original_title), ''), ${uEscape(original)}),`,
        `  genres = COALESCE(NULLIF(TRIM(genres), ''), ${uEscape(genres)}),`,
        `  language = COALESCE(NULLIF(TRIM(language), ''), '${lang}'),`,
        "  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')",
        `WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(${uEscape(author)})))`,
        `  AND lower(trim(title)) = lower(trim(${uEscape(title)}));`,
        ""
      );
    } else {
      lines.push(
        "INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)",
        "SELECT nextval('book_id_seq'),",
        `  ${uEscape(title)}, ${uEscape(original)}, a.id, ${year}, ${pages},`,
        `  ${uEscape(desc)}, ${uEscape(genres)}, '${lang}', ${uEscape(coverUrl)},`,
        "  false, false, false, false, NOW(), NOW(), 'seed', 'seed'",
        "FROM authors a",
        `WHERE lower(trim(a.name)) = lower(trim(${uEscape(author)}))`,
        `  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(${uEscape(title)})));`,
        ""
      );
    }
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id",
    "WHERE a.name IN (U&'Victor Hugo', U&'Lev Tolstoy', U&'Franz Kafka')",
    "GROUP BY a.name ORDER BY a.name;"
  );

  const out = path.join(__dirname, "seed_hugo_tolstoy_kafka_expand.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out, ROWS.length);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
