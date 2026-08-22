const https = require("https");
const fs = require("fs");
const path = require("path");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
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

function slugify(s) {
  return s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function findCover(queries, preds) {
  for (const q of queries) {
    const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`);
    const links = [...body.matchAll(/href="(\/kitap\/[^"]+urunno=(\d+))"/g)].map((m) => ({
      href: m[1].toLowerCase(),
      id: m[2],
    }));
    const uniq = [...new Map(links.map((l) => [l.id, l])).values()];
    for (const pred of preds) {
      const hit = uniq.find((l) => pred(l.href));
      if (hit && (await head(cover(hit.id))) === 200) {
        return hit;
      }
    }
  }
  return null;
}

const BOOKS = [
  {
    author: "Fyodor Dostoyevski",
    lang: "rus",
    items: [
      {
        title: "Delikanlı",
        original: "Подросток",
        year: 1875,
        pages: 672,
        genres: "Klasik, Kurgu, Psikolojik",
        urunno: "0000000058766",
        coverUrl: null,
        queries: [],
        preds: [],
        desc:
          "Delikanlı; gayrimeşru bir gencin kimlik, gurur ve ait olma arayışını anlatır. " +
          "Dostoyevski, gençliğin karmaşasını aile, sınıf ve ideolojiyle iç içe işler.",
      },
      {
        title: "İnsancıklar",
        original: "Бедные люди",
        year: 1846,
        pages: 192,
        genres: "Klasik, Kurgu, Drama",
        urunno: "0000000058678",
        coverUrl: null,
        queries: [],
        preds: [],
        desc:
          "İnsancıklar; yoksul bir memur ile genç bir kadının mektuplaşması üzerinden " +
          "Petersburg'un küçük insanlarının onurunu ve kırılganlığını anlatır. Dostoyevski'nin ilk romanıdır.",
      },
      {
        title: "Öteki",
        original: "Двойник",
        year: 1846,
        pages: 176,
        genres: "Klasik, Kurgu, Psikolojik",
        urunno: "0001887776001",
        coverUrl: null,
        queries: [],
        preds: [],
        desc:
          "Öteki (İkiz); Golyadkin'in kendi ikiziyle karşılaşması üzerinden " +
          "paranooya, kimlik bölünmesi ve bürokratik aşağılamanın psikolojik portresini çizer.",
      },
      {
        title: "Ebedi Koca",
        original: "Вечный муж",
        year: 1870,
        pages: 176,
        genres: "Klasik, Kurgu, Psikolojik",
        urunno: "0001932888001",
        coverUrl: null,
        queries: [],
        preds: [],
        desc:
          "Ebedi Koca; kıskançlık, utanç ve intikamın iç içe geçtiği yoğun bir novelladır. " +
          "Dostoyevski, evlilik ve ihanetin psikolojik labirentini kısa ama keskin bir anlatıda kurar.",
      },
      {
        title: "Uysal Kız",
        original: "Кроткая",
        year: 1876,
        pages: 96,
        genres: "Klasik, Kurgu, Psikolojik",
        urunno: "0002216214001",
        coverUrl: null,
        queries: [],
        preds: [],
        desc:
          "Uysal Kız; bir tefecinin genç karısının ölümü üzerine kurduğu iç monoloğu anlatır. " +
          "İktidar, sevgi ve suçluluk duygusu, Dostoyevski'nin en yoğun kısa eserlerinden birinde birleşir.",
      },
      {
        title: "Gülünç Bir Adamın Düşü",
        original: "Сон смешного человека",
        year: 1877,
        pages: 64,
        genres: "Klasik, Kurgu, Felsefe",
        urunno: null,
        coverUrl: "https://covers.openlibrary.org/b/id/12261360-L.jpg",
        queries: [],
        preds: [],
        desc:
          "Gülünç Bir Adamın Düşü; intiharın eşiğindeki bir adamın rüyasında " +
          "masum bir dünyayı ve kendi suçunu görmesini anlatır. Dostoyevski'nin ahlaki vizyonunu yoğunlaştıran bir öyküdür.",
      },
      {
        title: "Timsah",
        original: "Крокодил",
        year: 1865,
        pages: 80,
        genres: "Klasik, Kurgu, Satir",
        urunno: "0002017363001",
        coverUrl: null,
        queries: [],
        preds: [],
        desc:
          "Timsah; bir memurun canlı bir timsah tarafından yutulması üzerine kurulu " +
          "absürt ve satirical bir anlatıdır. Bürokrasi, kamuoyu ve çıkarcılık alaya alınır.",
      },
      {
        title: "Yaz İzlenimleri Üzerine Kış Notları",
        original: "Зимние заметки о летних впечатлениях",
        year: 1863,
        pages: 144,
        genres: "Klasik, Kurgu Dışı, Deneme",
        urunno: "0001885998001",
        coverUrl: null,
        queries: [],
        preds: [],
        desc:
          "Yaz İzlenimleri Üzerine Kış Notları; Dostoyevski'nin Avrupa gezisinden " +
          "doğan gözlem ve eleştiri yazısıdır. Batı modernliği, bireycilik ve Rus kimliği üzerine düşünür.",
      },
    ],
  },
  {
    author: "Sabahattin Ali",
    lang: "tur",
    items: [
      {
        title: "Dağlar ve Rüzgâr",
        original: "Dağlar ve Rüzgâr",
        year: 1934,
        pages: 96,
        genres: "Klasik, Şiir",
        urunno: "0001859585001",
        coverUrl: null,
        queries: [],
        preds: [],
        desc:
          "Dağlar ve Rüzgâr; Sabahattin Ali'nin şiir kitabıdır. " +
          "Doğa, yalnızlık ve toplumsal duyarlılığı lirik bir dilde bir araya getirir.",
      },
    ],
  },
];

(async () => {
  for (const group of BOOKS) {
    for (const book of group.items) {
      if (book.coverUrl) {
        const st = await head(book.coverUrl);
        console.log(st === 200 ? "OL" : "BAD", group.author, book.title, st);
        if (st !== 200) throw new Error("bad coverUrl " + book.title);
        continue;
      }
      if (book.urunno) {
        const st = await head(cover(book.urunno));
        console.log(st === 200 ? "HARD" : "BAD", group.author, book.title, book.urunno, st);
        if (st !== 200) throw new Error("bad hardcoded " + book.title);
        continue;
      }
      const hit = await findCover(book.queries, book.preds);
      if (!hit) {
        console.log("MISS", group.author, book.title);
        continue;
      }
      book.urunno = hit.id;
      console.log("OK", group.author, book.title, hit.id, hit.href);
    }
  }

  const missing = BOOKS.flatMap((g) =>
    g.items.filter((b) => !b.urunno && !b.coverUrl).map((b) => b.title)
  );
  if (missing.length) {
    console.error("Missing covers:", missing.join(", "));
    process.exit(1);
  }

  const lines = [
    "-- Dostoyevski + Sabahattin Ali missing titles (D&R / OL covers)",
    "-- docker cp oldb-backend/scripts/seed_dostoyevski_ali_extra.sql my_postgres:/tmp/seed_dostoyevski_ali_extra.sql",
    "-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_dostoyevski_ali_extra.sql",
    "",
    "BEGIN;",
    "",
  ];

  for (const group of BOOKS) {
    lines.push(`-- ${group.author}`);
    for (const b of group.items) {
      const coverUrl = b.coverUrl || cover(b.urunno);
      lines.push(
        "INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)",
        "SELECT nextval('book_id_seq'),",
        `  ${uEscape(b.title)}, ${uEscape(b.original)}, a.id, ${b.year}, ${b.pages},`,
        `  ${uEscape(b.desc)}, ${uEscape(b.genres)}, '${group.lang}', ${uEscape(coverUrl)},`,
        "  false, false, false, false, NOW(), NOW(), 'seed', 'seed'",
        "FROM authors a",
        `WHERE lower(trim(a.name)) = lower(trim(${uEscape(group.author)}))`,
        "  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(" +
          uEscape(b.title) +
          ")));",
        ""
      );
    }
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id",
    "WHERE a.name IN (U&'Fyodor Dostoyevski', U&'Sabahattin Ali')",
    "GROUP BY a.id, a.name ORDER BY a.id;"
  );

  const out = path.join(__dirname, "seed_dostoyevski_ali_extra.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
