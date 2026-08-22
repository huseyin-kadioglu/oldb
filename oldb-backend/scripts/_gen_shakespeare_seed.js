/**
 * Generate UTF-8-safe SQL seed for William Shakespeare.
 * Usage: node oldb-backend/scripts/_gen_shakespeare_seed.js
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
  name: "William Shakespeare",
  country: "İngiltere",
  birth_year: 1564,
  death_year: 1616,
  portrait:
    "https://upload.wikimedia.org/wikipedia/commons/a/a2/Shakespeare.jpg",
  description:
    "William Shakespeare (1564–1616), İngiliz edebiyatının en etkili oyun yazarlarından ve şairlerindendir. " +
    "Trajedi, komedi ve tarih oyunlarıyla modern tiyatronun temelini atmış; Hamlet, Romeo ve Juliet, " +
    "Macbeth gibi eserleriyle evrensel temaları işlemiştir.",
};

const BOOKS = [
  {
    title: "Hamlet",
    original_title: "Hamlet",
    year: 1601,
    pages: 320,
    genres: "Klasik, Drama, Trajedi",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128540-L.jpg",
    description:
      "Hamlet; Danimarka prensinin babasının öldürülüşünün ardından intikam, vicdan ve delilik " +
      "arasında sıkışmasını anlatır. Shakespeare'in en derin psikolojik trajedilerinden biridir.",
  },
  {
    title: "Romeo ve Juliet",
    original_title: "Romeo and Juliet",
    year: 1595,
    pages: 256,
    genres: "Klasik, Drama, Romantik",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128571-L.jpg",
    description:
      "Romeo ve Juliet; Verona'da düşman iki ailenin çocukları arasındaki imkânsız aşkı anlatır. " +
      "Tutku, kader ve gençliğin trajedisi, Shakespeare'in en bilinen oyunlarından birinde buluşur.",
  },
  {
    title: "Macbeth",
    original_title: "Macbeth",
    year: 1606,
    pages: 240,
    genres: "Klasik, Drama, Trajedi",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128564-L.jpg",
    description:
      "Macbeth; iktidar hırsı, kehanet ve suçun ruhsal yıkımını anlatan karanlık bir trajedidir. " +
      "Ambisyon ile vicdan çatışması, Shakespeare'in en yoğun politik oyunlarından birinde yükselir.",
  },
  {
    title: "Kral Lear",
    original_title: "King Lear",
    year: 1606,
    pages: 320,
    genres: "Klasik, Drama, Trajedi",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128557-L.jpg",
    description:
      "Kral Lear; yaşlı bir kralın krallığını kızları arasında paylaştırmasıyla başlayan " +
      "güç, ihanet ve delilik trajedisidir. Aile bağları ve adalet, fırtınalı bir dünyada sınanır.",
  },
  {
    title: "Othello",
    original_title: "Othello",
    year: 1604,
    pages: 288,
    genres: "Klasik, Drama, Trajedi",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128588-L.jpg",
    description:
      "Othello; kıskançlık, ırkçılık ve manipülasyonun yıkıcı gücünü anlatır. " +
      "Iago'nun entrikaları, Othello ile Desdemona'nın aşkını trajediye sürükler.",
  },
  {
    title: "Fırtına",
    original_title: "The Tempest",
    year: 1611,
    pages: 224,
    genres: "Klasik, Drama, Fantastik",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128632-L.jpg",
    description:
      "Fırtına; Prospero'nun ada üzerindeki büyü, intikam ve bağışlama yolculuğunu anlatır. " +
      "Shakespeare'in geç dönem oyunlarından biri olarak özgürlük ve güç temalarını işler.",
  },
  {
    title: "Bir Yaz Gecesi Rüyası",
    original_title: "A Midsummer Night's Dream",
    year: 1595,
    pages: 192,
    genres: "Klasik, Drama, Komedi",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128595-L.jpg",
    description:
      "Bir Yaz Gecesi Rüyası; aşk, büyü ve kimlik karmaşasını orman perileriyle " +
      "iç içe anlatan neşeli bir komedidir. Shakespeare'in en sevimli oyunlarından biridir.",
  },
  {
    title: "Venedik Taciri",
    original_title: "The Merchant of Venice",
    year: 1596,
    pages: 224,
    genres: "Klasik, Drama, Komedi",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128601-L.jpg",
    description:
      "Venedik Taciri; borç, adalet ve merhamet üzerine kurulu bir oyundur. " +
      "Shylock'un davası, Shakespeare'in en tartışmalı ve güçlü sahnelerinden bazılarını barındırır.",
  },
  {
    title: "Julius Caesar",
    original_title: "Julius Caesar",
    year: 1599,
    pages: 240,
    genres: "Klasik, Drama, Tarih",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128618-L.jpg",
    description:
      "Julius Caesar; siyasi entrika, ihanet ve retorik gücünü Roma'nın kalbinde anlatır. " +
      "Brutus'un ikilemi, iktidarın bedelini sorgulayan klasik bir trajedi-tarih oyunudur.",
  },
  {
    title: "On İkinci Gece",
    original_title: "Twelfth Night",
    year: 1601,
    pages: 208,
    genres: "Klasik, Drama, Komedi",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128625-L.jpg",
    description:
      "On ikinci Gece; kimlik karışıklığı, aşk ve karnaval atmosferiyle örülü bir komedidir. " +
      "Viola'nın kılık değiştirmesi, Shakespeare'in en zarif ve eğlenceli oyunlarından birini doğurur.",
  },
  {
    title: "Soneler",
    original_title: "Shakespeare's Sonnets",
    year: 1609,
    pages: 192,
    genres: "Klasik, Şiir",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128649-L.jpg",
    description:
      "Soneler; zaman, güzellik, aşk ve ölümsüzlük üzerine 154 şiiri bir araya getirir. " +
      "Shakespeare'in lirik ustalığının en yoğun örneklerinden biridir.",
  },
  {
    title: "Antonius ve Kleopatra",
    original_title: "Antony and Cleopatra",
    year: 1607,
    pages: 320,
    genres: "Klasik, Drama, Trajedi",
    cover: "https://covers.openlibrary.org/b/isbn/9780143128652-L.jpg",
    description:
      "Antonius ve Kleopatra; siyaset ile tutkunun çatışmasını Roma ve Mısır arasında anlatır. " +
      "İki büyük figürün aşkı, imparatorlukların kaderiyle iç içe geçer.",
  },
];

const lines = [
  "-- William Shakespeare katalog seed (Türkçe)",
  "-- Yükleme:",
  "--   docker cp oldb-backend/scripts/seed_shakespeare.sql my_postgres:/tmp/seed_shakespeare.sql",
  "--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_shakespeare.sql",
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
    "  'eng',",
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

const out = path.join(__dirname, "seed_shakespeare.sql");
fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
console.log("wrote", out, "books:", BOOKS.length);
