const https = require("https");
const fs = require("fs");
const path = require("path");

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      resolve(res.statusCode);
    });
    req.on("error", () => resolve(0));
    req.end();
  });
}

function cover(id) {
  return `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
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

const AUTHOR = {
  name: "Victor Hugo",
  country: "Fransa",
  birth_year: 1802,
  death_year: 1885,
  portrait:
    "https://ui-avatars.com/api/?name=Victor+Hugo&background=1a1a1a&color=d4af37&size=256",
  description:
    "Victor Hugo (1802–1885), Fransız romantizminin önde gelen şair, romancı ve oyun yazarlarındandır. " +
    "Adalet, merhamet ve toplumsal eşitsizlik temalarını güçlü bir dille işler. " +
    "Sefiller ve Notre-Dame'ın Kamburu başlıca eserleri arasındadır.",
};

/**
 * D&R urunno — manuel doğrulanmış.
 * HAY = Hasan Ali Yücel Klasikleri (İş Bankası)
 * DR  = D&R'da bulunan Victor Hugo dünya klasiği baskısı (Sefiller HAY şu an listede yok)
 */
const BOOKS = [
  {
    title: "Sefiller",
    original_title: "Les Misérables",
    year: 1862,
    pages: 1488,
    genres: "Klasik, Kurgu, Drama",
    urunno: "0002092782001",
    series: "DR",
    description:
      "Sefiller; Jean Valjean'ın kurtuluş arayışını, Javert'in adalet takıntısını ve Paris'in toplumsal uçurumunu " +
      "anlatan epik bir romandır. Victor Hugo'nun merhamet ve insan onuru üzerine en kapsamlı eseridir.",
  },
  {
    title: "Notre-Dame'ın Kamburu",
    original_title: "Notre-Dame de Paris",
    year: 1831,
    pages: 560,
    genres: "Klasik, Kurgu, Drama",
    urunno: "0000000576984",
    series: "HAY",
    description:
      "Notre-Dame'ın Kamburu; Ortaçağ Paris'inde Quasimodo, Esmeralda ve Claude Frollo'nun kaderlerini anlatır. " +
      "Victor Hugo, aşk, dışlanma ve katedralin ruhunu romantik bir anlatıda birleştirir.",
  },
  {
    title: "Deniz İşçileri",
    original_title: "Les Travailleurs de la mer",
    year: 1866,
    pages: 432,
    genres: "Klasik, Kurgu, Macera",
    urunno: "0001837993001",
    series: "HAY",
    description:
      "Deniz İşçileri; Guernsey adasında geçen bir doğa, emek ve fedakârlık romanıdır. " +
      "Victor Hugo, insanın denizle mücadelesini destansı bir üslupla anlatır.",
  },
  {
    title: "Bir İdam Mahkûmunun Son Günü",
    original_title: "Le Dernier Jour d'un condamné",
    year: 1829,
    pages: 128,
    genres: "Klasik, Kurgu, Drama",
    urunno: "0000000567743",
    series: "HAY",
    description:
      "Bir İdam Mahkûmunun Son Günü; idam cezasını mahkûmun bilincinden anlatan kısa ama çarpıcı bir metindir. " +
      "Victor Hugo'nun adalet eleştirisinin erken ve güçlü örneklerindendir.",
  },
  {
    title: "Doksan Üç",
    original_title: "Quatrevingt-treize",
    year: 1874,
    pages: 448,
    genres: "Klasik, Kurgu, Tarih",
    urunno: "0002002886001",
    series: "DR",
    description:
      "Doksan Üç; Fransız Devrimi'nin en şiddetli yılında geçen bir tarih ve vicdan romanıdır. " +
      "Victor Hugo, idealler ile insanlık arasındaki gerilimi kanlı bir coğrafyada işler.",
  },
  {
    title: "Nişanlıya Mektuplar",
    original_title: "Lettres à la fiancée",
    year: 1822,
    pages: 240,
    genres: "Klasik, Kurgu Dışı, Anı",
    urunno: "0001983079001",
    series: "HAY",
    description:
      "Nişanlıya Mektuplar; Victor Hugo'nun Adèle Foucher'ye yazdığı mektuplardan oluşur. " +
      "Gençlik aşkı, edebiyat tutkusu ve dönem Paris'inin izlerini taşır.",
  },
  {
    title: "Sefiller (Dünya Klasikleri)",
    original_title: "Les Misérables",
    year: 1862,
    pages: 800,
    urunno: "0002026788001",
    series: "DR",
    skip: true, // duplicate of Sefiller
  },
];

(async () => {
  const active = BOOKS.filter((b) => !b.skip);
  for (const b of active) {
    b.cover = cover(b.urunno);
    const status = await head(b.cover);
    console.log(status === 200 ? "OK" : "BAD", b.series, b.title, b.urunno, status);
    if (status !== 200) throw new Error("Cover failed: " + b.title);
  }

  const lines = [
    "-- Victor Hugo katalog seed (Türkçe)",
    "-- Kapaklar: D&R (HAY = Hasan Ali Yücel; DR = D&R dünya klasiği baskısı)",
    "-- Not: Sefiller ve Doksan Üç için D&R'da HAY baskısı bulunamadı; D&R Victor Hugo kapakları kullanıldı.",
    "-- Yükleme:",
    "--   docker cp oldb-backend/scripts/seed_victor_hugo.sql my_postgres:/tmp/seed_victor_hugo.sql",
    "--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_victor_hugo.sql",
    "",
    "BEGIN;",
    "",
    "INSERT INTO authors (name, country, birth_year, death_year, portrait, description)",
    "SELECT",
    `  ${uEscape(AUTHOR.name)},`,
    `  ${uEscape(AUTHOR.country)},`,
    `  ${AUTHOR.birth_year},`,
    `  ${AUTHOR.death_year},`,
    `  ${uEscape(AUTHOR.portrait)},`,
    `  ${uEscape(AUTHOR.description)}`,
    `WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(${uEscape(AUTHOR.name)})));`,
    "",
    "UPDATE authors SET",
    `  country = ${uEscape(AUTHOR.country)},`,
    `  birth_year = ${AUTHOR.birth_year},`,
    `  death_year = ${AUTHOR.death_year},`,
    `  portrait = COALESCE(NULLIF(TRIM(portrait), ''), ${uEscape(AUTHOR.portrait)}),`,
    `  description = ${uEscape(AUTHOR.description)}`,
    `WHERE lower(trim(name)) = lower(trim(${uEscape(AUTHOR.name)}));`,
    "",
  ];

  for (const b of active) {
    lines.push(
      "INSERT INTO books (",
      "  id, title, original_title, author_id, publication_year, page_count,",
      "  description, genres, language, cover_url,",
      "  is_won_nobel_prize, editor_choice, weekly_pick, new_release,",
      "  created_at, updated_at, created_by, updated_by",
      ")",
      "SELECT nextval('book_id_seq'),",
      `  ${uEscape(b.title)},`,
      `  ${uEscape(b.original_title)},`,
      "  a.id,",
      `  ${b.year},`,
      `  ${b.pages},`,
      `  ${uEscape(b.description)},`,
      `  ${uEscape(b.genres)},`,
      "  'fra',",
      `  ${uEscape(b.cover)},`,
      "  false, false, false, false,",
      "  NOW(), NOW(), 'seed', 'seed'",
      "FROM authors a",
      `WHERE lower(trim(a.name)) = lower(trim(${uEscape(AUTHOR.name)}))`,
      "  AND NOT EXISTS (",
      "    SELECT 1 FROM books bx",
      "    WHERE bx.author_id = a.id",
      `      AND lower(trim(bx.title)) = lower(trim(${uEscape(b.title)}))`,
      "  );",
      ""
    );
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT a.id AS author_id, a.name, COUNT(b.id) AS book_count",
    "FROM authors a LEFT JOIN books b ON b.author_id = a.id",
    `WHERE lower(trim(a.name)) = lower(trim(${uEscape(AUTHOR.name)}))`,
    "GROUP BY a.id, a.name;",
    "",
    "SELECT b.id, b.title, b.publication_year, length(b.description) AS desc_len,",
    "  substring(b.cover_url from 'originals/([0-9]+)-') AS urunno",
    "FROM books b JOIN authors a ON a.id = b.author_id",
    `WHERE lower(trim(a.name)) = lower(trim(${uEscape(AUTHOR.name)}))`,
    "ORDER BY b.publication_year DESC, b.title;"
  );

  const out = path.join(__dirname, "seed_victor_hugo.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out, "books:", active.length);
})();
