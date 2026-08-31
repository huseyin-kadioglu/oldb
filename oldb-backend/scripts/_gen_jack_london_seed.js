const https = require("https");
const fs = require("fs");
const path = require("path");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 OLDB-seed/1.0" } }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
      })
      .on("error", reject);
  });
}

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      resolve({ status: res.statusCode, type: res.headers["content-type"], len: res.headers["content-length"] });
    });
    req.on("error", (e) => resolve({ status: 0, err: e.message }));
    req.end();
  });
}

function cover(urunno) {
  return `https://i.dr.com.tr/cache/600x600-0/originals/${urunno}-1.jpg`;
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
  name: "Jack London",
  country: "ABD",
  birth_year: 1876,
  death_year: 1916,
  portrait:
    "https://upload.wikimedia.org/wikipedia/commons/2/2d/Jack_London_young.jpg",
  description:
    "Jack London (1876–1916), Amerikan edebiyatının macera ve toplumsal gerçekçilik ustalarındandır. " +
    "Kuzey toprakları, deniz ve sınıf mücadelesi temalarını güçlü bir anlatımla işler. " +
    "Martin Eden, Vahşetin Çağrısı ve Beyaz Diş başlıca eserleri arasındadır.",
};

// D&R ürün no (urunno) → İş Bankası Modern Klasikler kapakları
// Not: Jack London İş Bankası'nda HAY değil, Modern Klasikler dizisinde.
const BOOKS = [
  {
    title: "Martin Eden",
    original_title: "Martin Eden",
    year: 1909,
    pages: 480,
    genres: "Klasik, Kurgu, Drama",
    urunno: "0000000608697",
    description:
      "Martin Eden; yoksul bir gencin yazar olma tutkusunu, sınıf atlama hayalini ve " +
      "aşkı anlatır. Jack London'ın en kişisel romanlarından biri olarak başarı ile yalnızlığı iç içe işler.",
  },
  {
    title: "Vahşetin Çağrısı",
    original_title: "The Call of the Wild",
    year: 1903,
    pages: 160,
    genres: "Klasik, Kurgu, Macera",
    urunno: "0000000323262",
    description:
      "Vahşetin Çağrısı; evcil köpek Buck'ın Yukon'da vahşi doğaya dönüşünü anlatır. " +
      "Jack London, doğanın yasaları ile uygarlığın kırılganlığını kısa ama güçlü bir romanda buluşturur.",
  },
  {
    title: "Beyaz Diş",
    original_title: "White Fang",
    year: 1906,
    pages: 288,
    genres: "Klasik, Kurgu, Macera",
    urunno: "0000000347422",
    description:
      "Beyaz Diş; yarı kurt bir köpeğin Kuzey topraklarında hayatta kalışını ve insan dünyasına " +
      "dönüşünü anlatır. Vahşetin Çağrısı'nın tamamlayıcısı niteliğinde bir doğa ve uygarlık romanıdır.",
  },
  {
    title: "Deniz Kurdu",
    original_title: "The Sea-Wolf",
    year: 1904,
    pages: 368,
    genres: "Klasik, Kurgu, Macera",
    urunno: "0000000587748",
    description:
      "Deniz Kurdu; Kaptan Wolf Larsen'in zalim otoritesi altında geçen bir deniz macera ve " +
      "güç mücadelesi romanıdır. Jack London, irade, ahlak ve hayatta kalmayı sert bir denizde sınar.",
  },
  {
    title: "Demir Ökçe",
    original_title: "The Iron Heel",
    year: 1908,
    pages: 320,
    genres: "Klasik, Kurgu, Distopya",
    urunno: "0001935597001", // may verify; fallback search later
    description:
      "Demir Ökçe; oligarşik bir baskı rejimine karşı yükselen toplumsal mücadeleyi anlatan " +
      "erken bir distopyadır. Jack London'ın siyasal vizyonunu en keskin biçimde ortaya koyar.",
  },
  {
    title: "Oyun",
    original_title: "The Game",
    year: 1905,
    pages: 128,
    genres: "Klasik, Kurgu, Drama",
    urunno: "0002026951001",
    description:
      "Oyun; boks ringinin sert dünyasında aşk, gurur ve bedensel mücadeleyi anlatır. " +
      "Kısa ama yoğun bir Jack London romanıdır.",
  },
  {
    title: "Kızıl Veba",
    original_title: "The Scarlet Plague",
    year: 1912,
    pages: 112,
    genres: "Klasik, Bilimkurgu, Kurgu",
    urunno: "0001872902001",
    description:
      "Kızıl Veba; uygarlığı çökerten bir salgın sonrası hayatta kalanların dünyasını anlatır. " +
      "Jack London'ın karanlık bir gelecek tasviridir.",
  },
  {
    title: "Bir Kuzey Macerası",
    original_title: "A Daughter of the Snows",
    year: 1902,
    pages: 288,
    genres: "Klasik, Kurgu, Macera",
    urunno: "0001744842001",
    description:
      "Bir Kuzey Macerası; Alaska'nın sert coğrafyasında geçen bir macera ve karakter romanıdır. " +
      "Jack London'ın Kuzey anlatılarının erken örneklerindendir.",
  },
  {
    title: "Ateş Yakmak",
    original_title: "To Build a Fire",
    year: 1908,
    pages: 96,
    genres: "Klasik, Kurgu, Öykü",
    urunno: "0001807404001",
    description:
      "Ateş Yakmak; Yukon soğuğunda bir adamın hayatta kalma mücadelesini anlatan ünlü öyküdür. " +
      "Doğanın acımasızlığı, Jack London'ın en çarpıcı kısa anlatılarından birinde billurlaşır.",
  },
  {
    title: "Yıldız Gezgini",
    original_title: "The Star Rover",
    year: 1915,
    pages: 320,
    genres: "Klasik, Kurgu, Fantastik",
    urunno: "0000000622480",
    description:
      "Yıldız Gezgini; hapishanedeki bir mahkûmun bilinç yolculuklarını anlatan " +
      "sıradışı bir romandır. Jack London, beden ile ruh, zaman ile bellek arasında gezinir.",
  },
  {
    title: "Âdemden Önce",
    original_title: "Before Adam",
    year: 1907,
    pages: 192,
    genres: "Klasik, Kurgu, Fantastik",
    urunno: "0001801829001",
    description:
      "Âdemden Önce; modern bir insanın ilkel atalarının dünyasına dair rüyalarını anlatır. " +
      "Jack London, evrim ve kolektif bellek üzerine spekülatif bir hikâye kurar.",
  },
  {
    title: "Cehennem Canavarı",
    original_title: "The Hell-Fire Club / The Abysmal Brute",
    year: 1913,
    pages: 160,
    genres: "Klasik, Kurgu, Drama",
    urunno: "0002206616001",
    description:
      "Cehennem Canavarı; boks ve gösteri dünyasının karanlık yüzünü anlatan bir Jack London romanıdır. " +
      "Güç, şöhret ve manipülasyon temaları öne çıkar.",
  },
];

(async () => {
  // Verify Demir Ökçe and a few covers; fix urunno via search if needed
  const verifyQueries = {
    "Demir Ökçe": "Demir%20%C3%96k%C3%A7e%20Jack%20London%20Modern%20Klasikler",
    "Ay Vadisi": "Ay%20Vadisi%20Jack%20London%20Modern%20Klasikler",
  };
  for (const [title, q] of Object.entries(verifyQueries)) {
    const { body } = await get(`https://www.dr.com.tr/search?q=${q}`);
    const links = [...body.matchAll(/href="(\/kitap\/[^"]+urunno=(\d+))"/g)];
    const hits = links
      .map((m) => ({ href: m[1], id: m[2] }))
      .filter((x) => /london|demir|vadi|modern-klasik/i.test(x.href));
    console.log(title, [...new Map(hits.map((h) => [h.id, h])).values()].slice(0, 8));
  }

  for (const b of BOOKS) {
    const url = cover(b.urunno);
    const h = await head(url);
    console.log(b.title, b.urunno, h.status, h.type || h.err);
    b.cover = url;
  }

  // If Demir Ökçe cover failed, try alternate from search
  const demir = BOOKS.find((b) => b.title === "Demir Ökçe");
  if (demir) {
    const h = await head(demir.cover);
    if (h.status !== 200) {
      const { body } = await get(
        "https://www.dr.com.tr/search?q=" + encodeURIComponent("Demir Ökçe Jack London")
      );
      const m = body.match(/\/kitap\/[^"]*demir[^"]*urunno=(\d+)/i) ||
        body.match(/\/kitap\/[^"]*jack-london[^"]*urunno=(\d+)/i);
      if (m) {
        demir.urunno = m[1];
        demir.cover = cover(m[1]);
        console.log("Demir Ökçe fixed to", demir.urunno, await head(demir.cover));
      }
    }
  }

  const lines = [
    "-- Jack London katalog seed (Türkçe)",
    "-- Kapaklar: D&R / İş Bankası Modern Klasikler (urunno → i.dr.com.tr)",
    "-- Not: Jack London HAY dizisinde değil; aynı yayınevinin Modern Klasikler kapakları kullanıldı.",
    "-- Yükleme:",
    "--   docker cp oldb-backend/scripts/seed_jack_london.sql my_postgres:/tmp/seed_jack_london.sql",
    "--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_jack_london.sql",
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
    "SELECT b.id, b.title, b.publication_year, left(b.cover_url, 70) AS cover, length(b.description) AS desc_len",
    "FROM books b JOIN authors a ON a.id = b.author_id",
    `WHERE lower(trim(a.name)) = lower(trim(${uEscape(AUTHOR.name)}))`,
    "ORDER BY b.publication_year DESC, b.title;"
  );

  const out = path.join(__dirname, "seed_jack_london.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out, "books:", BOOKS.length);
})();
