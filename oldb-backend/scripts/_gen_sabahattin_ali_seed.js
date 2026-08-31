/**
 * Generate UTF-8-safe SQL seed for Sabahattin Ali.
 * Usage: node oldb-backend/scripts/_gen_sabahattin_ali_seed.js
 */
const fs = require("fs");
const path = require("path");

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
  name: "Sabahattin Ali",
  country: "Türkiye",
  birth_year: 1907,
  death_year: 1948,
  portrait:
    "https://ui-avatars.com/api/?name=Sabahattin+Ali&background=1a1a1a&color=d4af37&size=256",
  description:
    "Sabahattin Ali (1907–1948), Türk edebiyatının önde gelen öykü ve roman yazarlarındandır. " +
    "Toplumsal gerçekçilik, bireysel yalnızlık ve adalet arayışını sade, güçlü bir dille işler. " +
    "Kürk Mantolu Madonna ve İçimizdeki Şeytan başlıca eserleri arasındadır.",
};

const BOOKS = [
  {
    title: "Kürk Mantolu Madonna",
    original_title: "Kürk Mantolu Madonna",
    year: 1943,
    pages: 160,
    genres: "Klasik, Kurgu, Romantik",
    cover: "https://covers.openlibrary.org/b/isbn/9789753638029-L.jpg",
    description:
      "Kürk Mantolu Madonna; Raif Efendi'nin Berlin'de tanıştığı Maria Puder'e duyduğu " +
      "sessiz ve derin aşkı anlatır. Sabahattin Ali, yalnızlık, kaçırılmış mutluluk ve " +
      "sıradan bir hayatın içinde gizlenen büyük duyguları sade bir dille işler.",
  },
  {
    title: "İçimizdeki Şeytan",
    original_title: "İçimizdeki Şeytan",
    year: 1940,
    pages: 272,
    genres: "Klasik, Kurgu, Psikolojik",
    cover: "https://covers.openlibrary.org/b/isbn/9789753638036-L.jpg",
    description:
      "İçimizdeki Şeytan; genç aydın Ömer'in idealler, aşk ve toplumsal baskı arasında " +
      "sıkışmasını anlatır. Sabahattin Ali, bireyin içindeki çelişkiyi ve dönemin entelektüel " +
      "iklimini keskin bir gözlemle yansıtır.",
  },
  {
    title: "Kuyucaklı Yusuf",
    original_title: "Kuyucaklı Yusuf",
    year: 1937,
    pages: 224,
    genres: "Klasik, Kurgu, Drama",
    cover: "https://covers.openlibrary.org/b/isbn/9789753638012-L.jpg",
    description:
      "Kuyucaklı Yusuf; Anadolu taşrasında geçen bir yetimlik, adalet ve aşk romanıdır. " +
      "Yusuf'un sert kaderi, feodal düzenin baskısı ve bireysel direniş üzerinden anlatılır.",
  },
  {
    title: "Değirmen",
    original_title: "Değirmen",
    year: 1935,
    pages: 160,
    genres: "Klasik, Kurgu, Öykü",
    cover: "https://covers.openlibrary.org/b/isbn/9789750802911-L.jpg",
    description:
      "Değirmen; Sabahattin Ali'nin erken dönem öykülerini bir araya getirir. " +
      "Köy ve taşra hayatından kesitlerle yoksulluk, haksızlık ve insan hallerini " +
      "kısa, çarpıcı anlatımlarla işler.",
  },
  {
    title: "Kağnı",
    original_title: "Kağnı",
    year: 1936,
    pages: 128,
    genres: "Klasik, Kurgu, Öykü",
    cover: "https://covers.openlibrary.org/b/isbn/9789750802928-L.jpg",
    description:
      "Kağnı; Anadolu insanının gündelik mücadelesini ve toplumsal eşitsizliği " +
      "öykü formunda anlatır. Sabahattin Ali'nin sade üslubu, güçlü gözlemle birleşir.",
  },
  {
    title: "Ses",
    original_title: "Ses",
    year: 1937,
    pages: 144,
    genres: "Klasik, Kurgu, Öykü",
    cover: "https://covers.openlibrary.org/b/isbn/9789750802935-L.jpg",
    description:
      "Ses; Sabahattin Ali'nin öykücülüğünü pekiştiren bir derlemedir. " +
      "Bireysel yalnızlık, sınıfsal gerilim ve gündelik hayatın kırılganlıkları " +
      "kısa anlatılarda yankılanır.",
  },
  {
    title: "Yeni Dünya",
    original_title: "Yeni Dünya",
    year: 1943,
    pages: 176,
    genres: "Klasik, Kurgu, Öykü",
    cover: "https://covers.openlibrary.org/b/isbn/9789753638043-L.jpg",
    description:
      "Yeni Dünya; savaş ve toplumsal değişim döneminin izlerini taşıyan öykülerden oluşur. " +
      "Sabahattin Ali, umut ile hayal kırıklığını aynı düzlemde tutarak insanı merkeze alır.",
  },
  {
    title: "Sırça Köşk",
    original_title: "Sırça Köşk",
    year: 1947,
    pages: 192,
    genres: "Klasik, Kurgu, Öykü",
    cover: "https://covers.openlibrary.org/b/isbn/9789753638050-L.jpg",
    description:
      "Sırça Köşk; Sabahattin Ali'nin alegorik ve eleştirel anlatılarının öne çıktığı " +
      "son dönem öykü kitabıdır. İktidar, korku ve özgürlük temaları masalsı bir dilde işlenir.",
  },
];

const lines = [
  "-- Sabahattin Ali katalog seed (Türkçe)",
  "-- Yükleme:",
  "--   docker cp oldb-backend/scripts/seed_sabahattin_ali.sql my_postgres:/tmp/seed_sabahattin_ali.sql",
  "--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_sabahattin_ali.sql",
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

for (const b of BOOKS) {
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
    "  'tur',",
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
  "SELECT b.id, b.title, b.publication_year, b.genres, length(b.description) AS desc_len",
  "FROM books b JOIN authors a ON a.id = b.author_id",
  `WHERE lower(trim(a.name)) = lower(trim(${uEscape(AUTHOR.name)}))`,
  "ORDER BY b.publication_year DESC, b.title;"
);

const out = path.join(__dirname, "seed_sabahattin_ali.sql");
fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
console.log("wrote", out);
