/**
 * Extra titles: Saramago, Zweig, Gogol, Hesse
 * node _gen_saramago_zweig_gogol_hesse_extra.js
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
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c");
}

function slugPred(...needles) {
  const n = needles.map((x) => normalize(x));
  return (href) => {
    const h = normalize(href);
    return n.every((x) => h.includes(x));
  };
}

async function findCover(query, pred, altQueries = []) {
  const queries = [query, ...altQueries];
  for (const q of queries) {
    const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`);
    const links = [...body.matchAll(/href="(\/kitap\/[^"]+urunno=(\d+))"/gi)].map((m) => ({
      href: m[1].toLowerCase(),
      id: m[2],
    }));
    const unique = [...new Map(links.map((l) => [l.id, l])).values()];
    const ranked = unique.sort((a, b) => {
      const score = (h) =>
        (h.includes("-seti") || h.includes("/seti") || h.includes("takim") || h.includes("toplu-") ? 10 : 0) +
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
    console.warn("BAD HEAD", hit.id, st);
  }
  return null;
}

const BOOKS = [
  // —— José Saramago (Nobel)
  {
    author: "José Saramago",
    language: "por",
    nobel: true,
    title: "Bütün İsimler",
    original: "Todos os Nomes",
    year: 1997,
    pages: 272,
    genres: "Klasik, Kurgu, Felsefe",
    urunno: "0000000388760",
    desc:
      "Bütün İsimler; nüfus dairesinde çalışan sıradan bir memurun, bir dosyadaki kadının peşine düşmesini anlatır. " +
      "Saramago, kimlik, bürokrasi ve arzuyu labirentimsi bir anlatıyla birleştirir. " +
      "Körlük sonrası döneminin en güçlü romanlarından biridir.",
  },
  {
    author: "José Saramago",
    language: "por",
    nobel: true,
    title: "Kopyalanmış Adam",
    original: "O Homem Duplicado",
    year: 2002,
    pages: 320,
    genres: "Klasik, Kurgu, Gerilim",
    urunno: "0001553110002",
    desc:
      "Kopyalanmış Adam; bir tarih öğretmeninin kendisinin birebir kopyasıyla karşılaşmasını anlatır. " +
      "Kimlik, kıskançlık ve 'öteki ben' teması üzerine gerilimli, keskin bir romandır. " +
      "Saramago'nun geç döneminin en akıcı ve sinematik eserlerindendir.",
  },
  {
    author: "José Saramago",
    language: "por",
    nobel: true,
    title: "Lizbon Kuşatmasının Tarihi",
    original: "História do Cerco de Lisboa",
    year: 1989,
    pages: 368,
    genres: "Klasik, Kurgu, Tarih",
    urunno: "0000000705702",
    desc:
      "Lizbon Kuşatmasının Tarihi; bir düzeltmenin tek bir kelimeyle tarihi yeniden yazmasını anlatır. " +
      "Gerçek ile kurgu, geçmiş ile şimdi iç içe geçer. " +
      "Saramago'nun tarih, dil ve aşk üzerine en zekice kurulmuş romanlarından biridir.",
  },
  {
    author: "José Saramago",
    language: "por",
    nobel: true,
    title: "Taş Sal",
    original: "A Jangada de Pedra",
    year: 1986,
    pages: 336,
    genres: "Klasik, Kurgu, Fantastik",
    coverUrl: "https://covers.openlibrary.org/b/id/8176060-L.jpg",
    desc:
      "Taş Sal; İber Yarımadası'nın Avrupa'dan kopup Atlas Okyanusu'nda yüzmeye başlamasını anlatır. " +
      "Jeopolitik alegori, yolculuk ve kimlik arayışı bir aradadır. " +
      "Saramago'nun en cesur ve şiirsel romanlarından biridir.",
  },

  // —— Stefan Zweig
  {
    author: "Stefan Zweig",
    language: "deu",
    nobel: false,
    title: "Sabırsız Yürek",
    original: "Ungeduld des Herzens",
    year: 1939,
    pages: 416,
    genres: "Klasik, Kurgu, Drama",
    urunno: "0002186377001",
    desc:
      "Sabırsız Yürek; I. Dünya Savaşı öncesi bir garnizon kasabasında, genç bir teğmenin felçli bir kıza duyduğu acıma ile aşk arasındaki çizgiyi anlatır. " +
      "Zweig'ın tek tamamlanmış uzun romanıdır. " +
      "Vicdan, yanılgı ve trajik sonuçlarıyla yazarın en önemli eserlerinden biri kabul edilir.",
  },
  {
    author: "Stefan Zweig",
    language: "deu",
    nobel: false,
    title: "Mecburiyet",
    original: "Der Zwang",
    year: 1920,
    pages: 96,
    genres: "Klasik, Kurgu, Novella",
    urunno: "0001909760001",
    desc:
      "Mecburiyet; savaş çağrısı alan bir sanatçının vicdanı ile yurttaşlık baskısı arasında sıkışmasını anlatır. " +
      "Zweig'ın pasifizmini ve bireysel özgürlük kaygısını yoğun bir novellada toplar. " +
      "Kısa ama sarsıcı bir ahlaki gerilim metnidir.",
  },
  {
    author: "Stefan Zweig",
    language: "deu",
    nobel: false,
    title: "Marie Antoinette",
    original: "Marie Antoinette",
    year: 1932,
    pages: 560,
    genres: "Klasik, Biyografi, Tarih",
    urunno: "0000000225408",
    desc:
      "Marie Antoinette; Fransız kraliçesinin yükselişini, Versailles'ı ve giyotine giden yolunu psikolojik bir portreyle anlatır. " +
      "Zweig, tarihî olayları bireysel trajediye çevirir. " +
      "Maria Stuart ile birlikte yazarın en kapsamlı biyografik eserlerindendir.",
  },

  // —— Nikolay Gogol (Delinin Hatıra Defteri zaten var — yeni kayıt açılmıyor)
  {
    author: "Nikolay Gogol",
    language: "rus",
    nobel: false,
    title: "Dikanka Yakınlarında Bir Çiftlikte Akşam Toplantıları",
    original: "Вечера на хуторе близ Диканьки",
    year: 1832,
    pages: 320,
    genres: "Klasik, Kurgu, Öykü",
    urunno: "0002231870001",
    desc:
      "Dikanka Yakınlarında Bir Çiftlikte Akşam Toplantıları; Ukrayna halk masalları, şeytan, aşk ve taşra mizahını bir araya getirir. " +
      "Gogol'un erken döneminin parlak, renkli ve folklorik derlemesidir. " +
      "Rus edebiyatında fantastik öykünün kapısını aralayan temel kitaplardan biridir.",
  },
  {
    author: "Nikolay Gogol",
    language: "rus",
    nobel: false,
    title: "Arabeskler",
    original: "Арабески",
    year: 1835,
    pages: 288,
    genres: "Klasik, Kurgu, Deneme",
    coverUrl: "https://covers.openlibrary.org/b/id/4383158-L.jpg",
    desc:
      "Arabeskler; öykü, deneme ve sanat yazılarını bir araya getiren bir derlemedir. " +
      "Nevski Bulvarı ve Portre gibi Petersburg metinlerinin de yer aldığı bu kitap, " +
      "Gogol'un sanat ve şehir üzerine düşüncelerinin erken bir toplamıdır.",
  },
  {
    author: "Nikolay Gogol",
    language: "rus",
    nobel: false,
    title: "Evlenme",
    original: "Женитьба",
    year: 1842,
    pages: 96,
    genres: "Klasik, Drama, Komedi",
    urunno: "0000000253613",
    desc:
      "Evlenme; evlenmek isteyen ama karar veremeyen bir memurun komedisini anlatır. " +
      "Gogol, evlilik pazarlığını absürt diyaloglarla hicveder. " +
      "Müfettiş ile birlikte sahne edebiyatının en bilinen eserlerindendir.",
  },
  {
    author: "Nikolay Gogol",
    language: "rus",
    nobel: false,
    title: "Kumarbazlar",
    original: "Игроки",
    year: 1842,
    pages: 80,
    genres: "Klasik, Drama, Komedi",
    coverUrl: "https://covers.openlibrary.org/b/id/8226191-L.jpg",
    desc:
      "Kumarbazlar; dolandırıcıların birbirini kandırmaya çalıştığı bir komedidir. " +
      "Gogol, sahtekârlık ve açgözlülüğü sahne üzerinde eğlenceli bir labirentte toplar. " +
      "Kısa, keskin ve tiyatroda sık sahnelenen bir metindir.",
  },

  // —— Hermann Hesse (Nobel)
  {
    author: "Hermann Hesse",
    language: "deu",
    nobel: true,
    title: "Peter Camenzind",
    original: "Peter Camenzind",
    year: 1904,
    pages: 192,
    genres: "Klasik, Kurgu, Drama",
    coverUrl: "https://covers.openlibrary.org/b/id/10795701-L.jpg",
    desc:
      "Peter Camenzind; doğayla iç içe büyüyen bir gencin yazarlık, dostluk ve aşk arayışını anlatır. " +
      "Hesse'nin ilk romanı, sonraki tüm temalarının tohumlarını taşır. " +
      "Dağlar, göller ve yalnızlık; yazarın şiirsel gerçekçiliğinin erken örneğidir.",
  },
  {
    author: "Hermann Hesse",
    language: "deu",
    nobel: true,
    title: "Gertrud",
    original: "Gertrud",
    year: 1910,
    pages: 208,
    genres: "Klasik, Kurgu, Drama",
    urunno: "0000000135600",
    desc:
      "Gertrud; topal bir bestecinin aşk, kıskançlık ve sanat arasındaki gerilimini anlatır. " +
      "Müzik ve kader, Hesse'nin erken döneminin duygusal yoğunluğunu taşır. " +
      "Sanatçı romanı olarak Rosshalde ile akrabadır.",
  },
  {
    author: "Hermann Hesse",
    language: "deu",
    nobel: true,
    title: "Klingsor'un Son Yazı",
    original: "Klingsors letzter Sommer",
    year: 1920,
    pages: 128,
    genres: "Klasik, Kurgu, Novella",
    urunno: "0001983215001",
    desc:
      "Klingsor'un Son Yazı; bir ressamın son yazındaki yaratıcı coşku, dostluk ve ölüm bilincini anlatır. " +
      "Renk, şarap ve Akdeniz ışığıyla dolu kısa ama yoğun bir novelladır. " +
      "Hesse'nin sanatçı portrelerinin en parlaklarındandır.",
  },
];

(async () => {
  for (const book of BOOKS) {
    if (book.coverUrl) {
      const st = await head(book.coverUrl);
      console.log(st === 200 ? "OL" : "OL-BAD", book.title, st);
      if (st !== 200) throw new Error("bad OL cover " + book.title);
      continue;
    }
    if (book.urunno) {
      book.coverUrl = cover(book.urunno);
      const st = await head(book.coverUrl);
      console.log(st === 200 ? "DR" : "DR-BAD", book.title, book.urunno, st);
      if (st !== 200) throw new Error("bad D&R cover " + book.title);
      continue;
    }
    throw new Error("No cover for " + book.title);
  }

  const lines = [
    "-- Extra: Saramago, Zweig, Gogol, Hesse (D&R covers, TR blurbs)",
    "-- Not: Gogol Delinin Hatıra Defteri zaten var — tekrar eklenmedi.",
    "-- docker cp oldb-backend/scripts/seed_saramago_zweig_gogol_hesse_extra.sql my_postgres:/tmp/seed_extra3.sql",
    "-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_extra3.sql",
    "",
    "BEGIN;",
    "",
  ];

  for (const book of BOOKS) {
    const nobel = book.nobel ? "true" : "false";
    lines.push(
      `-- ${book.author} — ${book.title}`,
      "INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)",
      "SELECT nextval('book_id_seq'),",
      `  ${uEscape(book.title)}, ${uEscape(book.original)}, a.id, ${book.year}, ${book.pages},`,
      `  ${uEscape(book.desc)}, ${uEscape(book.genres)}, '${book.language}', ${uEscape(book.coverUrl)},`,
      `  ${nobel}, false, false, false, NOW(), NOW(), 'seed', 'seed'`,
      "FROM authors a",
      `WHERE lower(trim(a.name)) = lower(trim(${uEscape(book.author)}))`,
      "  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(" +
        uEscape(book.title) +
        ")));",
      ""
    );
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT a.name, b.title FROM authors a JOIN books b ON b.author_id = a.id",
    "WHERE a.name IN (U&'José Saramago', U&'Stefan Zweig', U&'Nikolay Gogol', U&'Hermann Hesse')",
    "  AND b.title IN (",
    BOOKS.map((b) => "    " + uEscape(b.title)).join(",\n"),
    "  )",
    "ORDER BY a.name, b.title;"
  );

  const out = path.join(__dirname, "seed_saramago_zweig_gogol_hesse_extra.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out, BOOKS.length, "books");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
