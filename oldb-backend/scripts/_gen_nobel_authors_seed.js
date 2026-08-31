/**
 * Nobel authors + books: Orhan Pamuk, García Márquez, Hemingway
 * node _gen_nobel_authors_seed.js
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; OLDB/1.0)" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location).then(resolve, reject);
        }
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

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
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(0);
    });
    req.end();
  });
}

function cover(id) {
  return `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
}

function uEscape(s) {
  let out = "";
  for (const ch of String(s)) {
    const o = ch.codePointAt(0);
    if (ch === "'") out += "''";
    else if (o < 128) out += ch;
    else out += "\\" + o.toString(16).toUpperCase().padStart(4, "0");
  }
  return `U&'${out}'`;
}

function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ışğüöçİŞĞÜÖÇ]/g, (m) => ({
      ı: "i",
      ş: "s",
      ğ: "g",
      ü: "u",
      ö: "o",
      ç: "c",
      İ: "i",
      Ş: "s",
      Ğ: "g",
      Ü: "u",
      Ö: "o",
      Ç: "c",
    }[m]));
}

function slugPred(...needles) {
  const n = needles.map(normalize);
  return (href) => n.every((x) => normalize(href).includes(x));
}

async function findCover(query, pred, altQueries = []) {
  for (const q of [query, ...altQueries]) {
    const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`);
    const links = [...body.matchAll(/href="(\/kitap\/[^"]+urunno=(\d+))"/gi)].map((m) => ({
      href: m[1].toLowerCase(),
      id: m[2],
    }));
    const unique = [...new Map(links.map((l) => [l.id, l])).values()];
    const ranked = unique.sort((a, b) => {
      const score = (h) =>
        (h.includes("-seti") || h.includes("takim") || h.includes("toplu-") ? 10 : 0) +
        (h.includes("abonelik") ? 20 : 0);
      return score(a.href) - score(b.href);
    });
    const hit = ranked.find(
      (l) => pred(l.href) && !l.href.includes("abonelik") && !l.href.includes("takim") && !l.href.includes("-seti")
    );
    if (!hit) continue;
    const c = cover(hit.id);
    const st = await head(c);
    if (st === 200) {
      console.log("OK", q, hit.id);
      return hit.id;
    }
  }
  return null;
}

const AUTHORS = [
  {
    name: "Orhan Pamuk",
    country: "Türkiye",
    birth_year: 1952,
    death_year: null,
    language: "tur",
    nobel_year: 2006,
    portrait: "https://ui-avatars.com/api/?name=Orhan+Pamuk&background=1a1a1a&color=d4af37&size=256",
    description:
      "Orhan Pamuk (1952–), Türk romancı ve 2006 Nobel Edebiyat Ödülü sahibidir. " +
      "İstanbul, kimlik, Doğu-Batı gerilimi ve anlatının kendisi üzerine yazdığı romanlarla dünya çapında tanınır. " +
      "Benim Adım Kırmızı, Kara Kitap ve Masumiyet Müzesi en bilinen eserleri arasındadır.",
    books: [
      {
        title: "Benim Adım Kırmızı",
        original: "Benim Adım Kırmızı",
        year: 1998,
        pages: 472,
        genres: "Kurgu, Tarih, Polisiye",
        q: "orhan pamuk benim adım kırmızı",
        pred: slugPred("benim-adim-kirmizi"),
        desc:
          "Benim Adım Kırmızı; 16. yüzyıl İstanbul'unda minyatür sanatçıları, cinayet ve aşkı iç içe anlatır. " +
          "Pamuk'un Nobel'e giden yolundaki başyapıtlarından biridir.",
      },
      {
        title: "Kara Kitap",
        original: "Kara Kitap",
        year: 1990,
        pages: 480,
        genres: "Kurgu, Gizem, İstanbul",
        q: "orhan pamuk kara kitap",
        pred: slugPred("kara-kitap", "pamuk"),
        desc:
          "Kara Kitap; kaybolan eşinin peşine düşen bir avukatın İstanbul labirentinde kimlik arayışını anlatır. " +
          "Pamuk'un en katmanlı ve şehirli romanlarından biridir.",
      },
      {
        title: "Masumiyet Müzesi",
        original: "Masumiyet Müzesi",
        year: 2008,
        pages: 592,
        genres: "Kurgu, Aşk, İstanbul",
        q: "orhan pamuk masumiyet müzesi",
        pred: slugPred("masumiyet"),
        desc:
          "Masumiyet Müzesi; bir aşkın ve koleksiyon tutkusunun İstanbul'unda geçen romanıdır. " +
          "Nesne, bellek ve arzu Pamuk'un geç döneminin duygusal yoğunluğunu taşır.",
      },
      {
        title: "Kar",
        original: "Kar",
        year: 2002,
        pages: 480,
        genres: "Kurgu, Siyaset, Drama",
        q: "orhan pamuk kar",
        pred: (h) => normalize(h).includes("pamuk") && (normalize(h).endsWith("/kar") || normalize(h).includes("/kar/")),
        desc:
          "Kar; Kars'a kar altında gelen bir şairin siyaset, inanç ve aşkla yüzleşmesini anlatır. " +
          "Pamuk'un Türkiye'nin gerilimlerini doğrudan ele aldığı romanıdır.",
      },
    ],
  },
  {
    name: "Gabriel García Márquez",
    country: "Kolombiya",
    birth_year: 1927,
    death_year: 2014,
    language: "spa",
    nobel_year: 1982,
    portrait: "https://ui-avatars.com/api/?name=Gabriel+Garcia+Marquez&background=1a1a1a&color=d4af37&size=256",
    description:
      "Gabriel García Márquez (1927–2014), Kolombiyalı romancı ve 1982 Nobel Edebiyat Ödülü sahibidir. " +
      "Büyülü gerçekçilik akımının usta ismi; Yüzyıllık Yalnızlık ile Latin Amerika edebiyatını dünyaya açmıştır. " +
      "Aile efsaneleri, siyaset ve aşkı şiirsel bir dille birleştirir.",
    books: [
      {
        title: "Yüzyıllık Yalnızlık",
        original: "Cien años de soledad",
        year: 1967,
        pages: 464,
        genres: "Klasik, Kurgu, Büyülü Gerçekçilik",
        q: "garcia marquez yüzyıllık yalnızlık",
        alt: ["gabriel garcia marquez yuzyillik yalnizlik"],
        pred: slugPred("yuzyillik-yalnizlik"),
        desc:
          "Yüzyıllık Yalnızlık; Buendía ailesinin Macondo'daki kuşaklar boyu hikâyesini anlatır. " +
          "Büyülü gerçekçiliğin başyapıtı ve 20. yüzyıl edebiyatının dönüm noktalarından biridir.",
      },
      {
        title: "Kolera Günlerinde Aşk",
        original: "El amor en los tiempos del cólera",
        year: 1985,
        pages: 432,
        genres: "Klasik, Kurgu, Aşk",
        q: "garcia marquez kolera günlerinde aşk",
        pred: slugPred("kolera"),
        desc:
          "Kolera Günlerinde Aşk; yarım yüzyıl süren bir aşkın sabır, yaşlılık ve kaderle imtihanını anlatır. " +
          "García Márquez'in en dokunaklı romanlarından biridir.",
      },
      {
        title: "Kırmızı Pazartesi",
        original: "Crónica de una muerte anunciada",
        year: 1981,
        pages: 128,
        genres: "Klasik, Kurgu, Gerilim",
        q: "garcia marquez kırmızı pazartesi",
        pred: slugPred("kirmizi-pazartesi"),
        desc:
          "Kırmızı Pazartesi; herkesin bildiği bir cinayetin öncesini kronikleştirir. " +
          "Kader, onur ve kolektif suç ortaklığı üzerine kısa ama keskin bir romandır.",
      },
    ],
  },
  {
    name: "Ernest Hemingway",
    country: "ABD",
    birth_year: 1899,
    death_year: 1961,
    language: "eng",
    nobel_year: 1954,
    portrait: "https://ui-avatars.com/api/?name=Ernest+Hemingway&background=1a1a1a&color=d4af37&size=256",
    description:
      "Ernest Hemingway (1899–1961), Amerikalı romancı, öykücü ve 1954 Nobel Edebiyat Ödülü sahibidir. " +
      "Yalın üslubu, savaş, avcılık ve erkeklik temalarıyla modern Amerikan edebiyatını biçimlendirmiştir. " +
      "Yaşlı Adam ve Deniz, Silahlara Veda ve Güneş de Doğar klasikleşmiş eserleridir.",
    books: [
      {
        title: "Yaşlı Adam ve Deniz",
        original: "The Old Man and the Sea",
        year: 1952,
        pages: 128,
        genres: "Klasik, Kurgu, Novella",
        q: "hemingway yaşlı adam ve deniz",
        pred: slugPred("yasli-adam"),
        desc:
          "Yaşlı Adam ve Deniz; yaşlı bir Kübalı balıkçının büyük balıkla mücadelesini anlatır. " +
          "Hemingway'in Nobel'e giden yolundaki en bilinen novellasıdır.",
      },
      {
        title: "Silahlara Veda",
        original: "A Farewell to Arms",
        year: 1929,
        pages: 352,
        genres: "Klasik, Kurgu, Savaş",
        q: "hemingway silahlara veda",
        pred: slugPred("silahlara-veda"),
        desc:
          "Silahlara Veda; I. Dünya Savaşı'nda bir ambulans şoförü ile hemşirenin aşkını anlatır. " +
          "Savaşın absürtlüğü ve bireysel kaçış Hemingway'in erken başyapıtıdır.",
      },
      {
        title: "Güneş de Doğar",
        original: "The Sun Also Rises",
        year: 1926,
        pages: 272,
        genres: "Klasik, Kurgu, Drama",
        q: "hemingway güneş de doğar",
        pred: slugPred("gunes-de-dogar"),
        desc:
          "Güneş de Doğar; Kayıp Kuşak'ın Paris ve İspanya'daki bohem yaşamını anlatır. " +
          "Hemingway'in ilk büyük romanı ve modern Amerikan edebiyatının dönüm noktasıdır.",
      },
    ],
  },
];

(async () => {
  for (const author of AUTHORS) {
    for (const book of author.books) {
      if (book.urunno) {
        book.coverUrl = cover(book.urunno);
        continue;
      }
      if (book.coverUrl) continue;
      const id = await findCover(book.q, book.pred, book.alt || []);
      if (!id) throw new Error("Cover not found: " + author.name + " / " + book.title);
      book.urunno = id;
      book.coverUrl = cover(id);
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  const lines = [
    "-- Nobel authors: Pamuk, García Márquez, Hemingway",
    "-- Book flags stay false; author won_nobel_prize / nobel_year set",
    "",
    "BEGIN;",
    "",
  ];

  for (const author of AUTHORS) {
    const death = author.death_year == null ? "NULL" : String(author.death_year);
    lines.push(
      `-- ${author.name} (Nobel ${author.nobel_year})`,
      "INSERT INTO authors (name, country, birth_year, death_year, portrait, description, won_nobel_prize, nobel_year)",
      "SELECT",
      `  ${uEscape(author.name)}, ${uEscape(author.country)}, ${author.birth_year}, ${death},`,
      `  ${uEscape(author.portrait)}, ${uEscape(author.description)}, true, ${author.nobel_year}`,
      `WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(${uEscape(author.name)})));`,
      "",
      "UPDATE authors SET",
      `  country = ${uEscape(author.country)}, birth_year = ${author.birth_year}, death_year = ${death},`,
      `  portrait = COALESCE(NULLIF(TRIM(portrait), ''), ${uEscape(author.portrait)}),`,
      `  description = ${uEscape(author.description)},`,
      `  won_nobel_prize = true, nobel_year = ${author.nobel_year}`,
      `WHERE lower(trim(name)) = lower(trim(${uEscape(author.name)}));`,
      ""
    );

    for (const book of author.books) {
      lines.push(
        "INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)",
        "SELECT nextval('book_id_seq'),",
        `  ${uEscape(book.title)}, ${uEscape(book.original)}, a.id, ${book.year}, ${book.pages},`,
        `  ${uEscape(book.desc)}, ${uEscape(book.genres)}, '${author.language}', ${uEscape(book.coverUrl)},`,
        "  false, false, false, false, NOW(), NOW(), 'seed', 'seed'",
        "FROM authors a",
        `WHERE lower(trim(a.name)) = lower(trim(${uEscape(author.name)}))`,
        "  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(" +
          uEscape(book.title) +
          ")));",
        ""
      );
    }
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT name, won_nobel_prize, nobel_year FROM authors WHERE won_nobel_prize ORDER BY nobel_year;",
    "SELECT a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id",
    "WHERE a.name IN (" + AUTHORS.map((a) => uEscape(a.name)).join(", ") + ")",
    "GROUP BY a.name ORDER BY a.name;"
  );

  const out = path.join(__dirname, "seed_nobel_authors.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
