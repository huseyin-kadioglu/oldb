/**
 * Shakespeare missing titles — prefer D&R Turkish covers, Open Library fallback.
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let data = "";
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = res.headers.location.startsWith("http")
            ? res.headers.location
            : "https://www.dr.com.tr" + res.headers.location;
          return get(loc).then(resolve, reject);
        }
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

async function findDr(queries, preds) {
  for (const q of queries) {
    const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`);
    const links = [...body.matchAll(/href="(\/kitap\/[^"]+urunno=(\d+))"/g)].map((m) => ({
      href: m[1].toLowerCase(),
      id: m[2],
    }));
    const uniq = [...new Map(links.map((l) => [l.id, l])).values()];
    for (const pred of preds) {
      for (const hit of uniq) {
        if (!pred(hit.href)) continue;
        // Prefer Shakespeare in path; verify cover
        if ((await head(dr(hit.id))) === 200) return hit;
      }
    }
  }
  return null;
}

async function verifyTitle(id, href) {
  const html = await get(`https://www.dr.com.tr${href}`);
  const title = ((html.match(/<title>([^<]+)/) || [])[1] || "").replace(/\s+/g, " ");
  const ok = /shakespeare/i.test(title) || /shakespeare/i.test(html.slice(0, 50000));
  return { ok, title: title.slice(0, 100) };
}

async function olCover(title) {
  const j = JSON.parse(
    await get(
      "https://openlibrary.org/search.json?title=" +
        encodeURIComponent(title) +
        "&author=Shakespeare&limit=5"
    )
  );
  for (const d of j.docs || []) {
    if (!d.cover_i) continue;
    const url = ol(d.cover_i);
    if ((await head(url)) === 200) return url;
  }
  return null;
}

// Kuru Gürültü = Boş Yere Yaygara — tek kayıt
const BOOKS = [
  {
    title: "Kral Richard III",
    original: "Richard III",
    year: 1593,
    pages: 288,
    genres: "Klasik, Drama, Tarih",
    queries: ["Kral Richard III Shakespeare", "Richard III Shakespeare Türkçe"],
    preds: [(h) => /richard-iii|richard-3|iii-richard|kral-richard/i.test(h) && /shakespeare|william/i.test(h)],
    altPreds: [(h) => /richard-iii|richard-3/i.test(h)],
    olTitle: "Richard III",
    desc: "Kral Richard III; iktidar hırsı ve entrikayla tahta yükselen Richard'ın trajik düşüşünü anlatır.",
  },
  {
    title: "Coriolanus",
    original: "Coriolanus",
    year: 1608,
    pages: 320,
    genres: "Klasik, Drama, Trajedi",
    queries: ["Coriolanus Shakespeare", "Coriolanus Shakespeare Türkçe"],
    preds: [(h) => /coriolanus/i.test(h)],
    olTitle: "Coriolanus",
    desc: "Coriolanus; gururlu bir Romalı komutanın halk, siyaset ve ihanetle çatışmasını anlatır.",
  },
  {
    title: "Atinalı Timon",
    original: "Timon of Athens",
    year: 1606,
    pages: 256,
    genres: "Klasik, Drama, Trajedi",
    queries: ["Atinalı Timon Shakespeare", "Timon of Athens Shakespeare Türkçe", "Timon Shakespeare"],
    preds: [(h) => /timon|atinali-timon/i.test(h)],
    olTitle: "Timon of Athens",
    desc: "Atinalı Timon; cömertliğin ihanete dönüşmesiyle misantropiye sürüklenen bir soylunun trajedisidir.",
  },
  {
    title: "Titus Andronicus",
    original: "Titus Andronicus",
    year: 1594,
    pages: 256,
    genres: "Klasik, Drama, Trajedi",
    queries: ["Titus Andronicus Shakespeare", "Titus Andronicus Türkçe"],
    preds: [(h) => /titus/i.test(h)],
    olTitle: "Titus Andronicus",
    desc: "Titus Andronicus; intikam, şiddet ve Roma siyasetinin karanlık yüzünü işleyen erken bir trajedidir.",
  },
  {
    title: "Hırçın Kız",
    original: "The Taming of the Shrew",
    year: 1593,
    pages: 256,
    genres: "Klasik, Drama, Komedi",
    queries: ["Hırçın Kız Shakespeare", "Taming of the Shrew Shakespeare Türkçe"],
    preds: [(h) => /hircin-kiz|taming-of-the-shrew/i.test(h)],
    olTitle: "The Taming of the Shrew",
    desc: "Hırçın Kız; evlilik, güç ve toplumsal roller üzerine kurulu canlı bir komedidir.",
  },
  {
    title: "Boş Yere Yaygara",
    original: "Much Ado About Nothing",
    year: 1599,
    pages: 256,
    genres: "Klasik, Drama, Komedi",
    queries: [
      "Boş Yere Yaygara Shakespeare",
      "Much Ado About Nothing Shakespeare Türkçe",
      "Kuru Gürültü Shakespeare",
    ],
    preds: [(h) => /bos-yere-yaygara|kuru-gurultu|much-ado/i.test(h)],
    olTitle: "Much Ado About Nothing",
    desc: "Boş Yere Yaygara (Kuru Gürültü); Beatrice ile Benedick'in söz düellosu ve yanlış anlaşılmalar üzerine neşeli bir komedidir.",
  },
  {
    title: "Yanlışlıklar Komedyası",
    original: "The Comedy of Errors",
    year: 1594,
    pages: 192,
    genres: "Klasik, Drama, Komedi",
    queries: ["Yanlışlıklar Komedyası Shakespeare", "Comedy of Errors Shakespeare Türkçe"],
    preds: [(h) => /yanlisliklar-komedyasi|comedy-of-errors/i.test(h)],
    olTitle: "The Comedy of Errors",
    desc: "Yanlışlıklar Komedyası; ikiz kardeşlerin karışmasıyla gelişen hızlı tempolu bir komedidir.",
  },
  {
    title: "Nasıl Hoşunuza Giderse",
    original: "As You Like It",
    year: 1600,
    pages: 256,
    genres: "Klasik, Drama, Komedi",
    queries: ["Nasıl Hoşunuza Giderse Shakespeare", "As You Like It Shakespeare Türkçe"],
    preds: [(h) => /nasil-hosunuza|as-you-like-it/i.test(h)],
    olTitle: "As You Like It",
    desc: "Nasıl Hoşunuza Giderse; Arden ormanında aşk, sürgün ve kimlik oyunlarını anlatan pastoral bir komedidir.",
  },
  {
    title: "V. Henry",
    original: "Henry V",
    year: 1599,
    pages: 288,
    genres: "Klasik, Drama, Tarih",
    queries: ["V. Henry Shakespeare", "Henry V Shakespeare Türkçe", "Beşinci Henry Shakespeare"],
    preds: [(h) => /v-henry|henry-v|besinci-henry|henry-5/i.test(h)],
    olTitle: "Henry V",
    desc: "V. Henry; genç kralın Agincourt zaferine giden yolunu anlatan ulusal bir tarih oyunudur.",
  },
  {
    title: "II. Richard",
    original: "Richard II",
    year: 1595,
    pages: 256,
    genres: "Klasik, Drama, Tarih",
    queries: ["II. Richard Shakespeare", "Richard II Shakespeare Türkçe", "İkinci Richard Shakespeare"],
    preds: [(h) => /ii-richard|richard-ii|ikinci-richard|richard-2/i.test(h) && !/iii|3/i.test(h)],
    olTitle: "Richard II",
    desc: "II. Richard; tahttan indirilen bir kralın kimlik ve iktidar krizini şiirsel bir dille anlatır.",
  },
  {
    title: "I. Henry",
    original: "Henry IV, Part 1",
    year: 1597,
    pages: 288,
    genres: "Klasik, Drama, Tarih",
    queries: ["I. Henry Shakespeare", "Henry IV Shakespeare Türkçe", "Birinci Henry Shakespeare"],
    preds: [(h) => /i-henry|henry-iv|birinci-henry|henry-4/i.test(h)],
    olTitle: "Henry IV Part 1",
    desc: "I. Henry; Prens Hal, Falstaff ve isyan arasında geçen Henry IV'ün ilk bölümüdür.",
  },
  {
    title: "II. Henry",
    original: "Henry IV, Part 2",
    year: 1598,
    pages: 288,
    genres: "Klasik, Drama, Tarih",
    queries: ["II. Henry Shakespeare", "Henry IV Part 2 Shakespeare Türkçe", "İkinci Henry Shakespeare"],
    preds: [(h) => /ii-henry|henry-iv-part-2|ikinci-henry/i.test(h)],
    olTitle: "Henry IV Part 2",
    desc: "II. Henry; Prens Hal'in kral oluşuna giden yolunu ve Falstaff'ın sonunu anlatır.",
  },
  {
    title: "Kral John",
    original: "King John",
    year: 1596,
    pages: 224,
    genres: "Klasik, Drama, Tarih",
    queries: ["Kral John Shakespeare", "King John Shakespeare Türkçe"],
    preds: [(h) => /kral-john|king-john/i.test(h)],
    olTitle: "King John",
    desc: "Kral John; taht meşruiyeti, savaş ve siyasi entrika üzerine bir tarih oyunudur.",
  },
];

(async () => {
  for (const book of BOOKS) {
    const preds = [...(book.preds || []), ...(book.altPreds || [])];
    let hit = await findDr(book.queries, preds);
    if (hit) {
      const v = await verifyTitle(hit.id, hit.href);
      if (!v.ok) {
        console.log("REJECT", book.title, hit.id, v.title);
        hit = null;
      } else {
        book.coverUrl = dr(hit.id);
        console.log("DR", book.title, hit.id, v.title.slice(0, 70));
      }
    }
    if (!book.coverUrl) {
      const url = await olCover(book.olTitle);
      if (!url) throw new Error("no cover for " + book.title);
      book.coverUrl = url;
      console.log("OL", book.title, url);
    }
  }

  const lines = [
    "-- Shakespeare missing titles (D&R / Open Library)",
    "-- docker cp oldb-backend/scripts/seed_shakespeare_extra.sql my_postgres:/tmp/seed_shakespeare_extra.sql",
    "-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_shakespeare_extra.sql",
    "",
    "BEGIN;",
    "",
  ];

  for (const b of BOOKS) {
    lines.push(
      "INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)",
      "SELECT nextval('book_id_seq'),",
      `  ${uEscape(b.title)}, ${uEscape(b.original)}, a.id, ${b.year}, ${b.pages},`,
      `  ${uEscape(b.desc)}, ${uEscape(b.genres)}, 'eng', ${uEscape(b.coverUrl)},`,
      "  false, false, false, false, NOW(), NOW(), 'seed', 'seed'",
      "FROM authors a",
      "WHERE lower(trim(a.name)) = lower(trim(U&'William Shakespeare'))",
      "  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(" +
        uEscape(b.title) +
        ")));",
      ""
    );
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id",
    "WHERE a.name = U&'William Shakespeare' GROUP BY a.id, a.name;",
    "",
    "SELECT title FROM books WHERE author_id = (SELECT id FROM authors WHERE name = U&'William Shakespeare') ORDER BY title;"
  );

  const out = path.join(__dirname, "seed_shakespeare_extra.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out, BOOKS.length);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
