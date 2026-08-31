/**
 * Jack London missing titles — hardcoded verified covers (D&R / Open Library).
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

const BOOKS = [
  // Romanlar
  ["Gün Işığı", "Burning Daylight", 1910, 384, "Klasik, Kurgu, Macera", ol(8245391),
    "Gün Işığı; Yukon'da altın arayan Elam Harnish'in servet, aşk ve uygarlıkla yüzleşmesini anlatır."],
  ["Macera", "Adventure", 1911, 320, "Klasik, Kurgu, Macera", ol(8233626),
    "Macera; Solomon Adaları'nda bir plantasyon sahibinin tehlikeli dünyasını anlatır."],
  ["Ay Vadisi", "The Valley of the Moon", 1913, 480, "Klasik, Kurgu, Drama", dr("0001857281001"),
    "Ay Vadisi; işçi sınıfından bir çiftin şehirden kıra kaçışını ve toprak arayışını anlatır."],
  ["Büyük Evin Küçük Hanımı", "The Little Lady of the Big House", 1916, 352, "Klasik, Kurgu, Drama", dr("0001758514001"),
    "Büyük Evin Küçük Hanımı; California'da bir çiftlik evinde aşk, kıskançlık ve modern yaşamın gerilimini işler."],
  ["Adaların Jerry'si", "Jerry of the Islands", 1917, 288, "Klasik, Kurgu, Macera", dr("0002077420001"),
    "Adaların Jerry'si; Güney Denizleri'nde bir köpeğin maceralarını anlatır."],
  ["Jerry'nin Kardeşi Michael", "Michael, Brother of Jerry", 1917, 320, "Klasik, Kurgu, Macera", dr("0002077437001"),
    "Jerry'nin Kardeşi Michael; hayvanlar üzerinden sömürü, gösteri ve özgürlük temasını işler."],
  ["Üç Yürek", "Hearts of Three", 1920, 384, "Klasik, Kurgu, Macera", ol(9383473),
    "Üç Yürek; hazine avı, aşk ve macera dolu bir Güney Amerika anlatısıdır."],
  // Öykü
  ["Yaşama Sevgisi", "Love of Life", 1907, 192, "Klasik, Kurgu, Öykü", dr("0002042208001"),
    "Yaşama Sevgisi; Kuzey'de hayatta kalma mücadelesini anlatan öyküleri bir araya getirir."],
  ["Kurt Oğlu", "The Son of the Wolf", 1900, 224, "Klasik, Kurgu, Öykü", dr("0001978374001"),
    "Kurt Oğlu; Jack London'ın Kuzey öykülerinin ilk derlemelerinden biridir."],
  ["Smoke Bellew", "Smoke Bellew", 1912, 320, "Klasik, Kurgu, Öykü", dr("0002077452001"),
    "Smoke Bellew; Klondike'da bir gazetecinin maceracıya dönüşümünü anlatan öykülerden oluşur."],
  ["Smoke ile Shorty", "Smoke and Shorty", 1920, 256, "Klasik, Kurgu, Öykü", ol(10664514),
    "Smoke ile Shorty; Smoke Bellew serisinin devam öykülerini bir araya getirir."],
  ["Güney Denizleri Hikâyeleri", "South Sea Tales", 1911, 256, "Klasik, Kurgu, Öykü", dr("0002175721001"),
    "Güney Denizleri Hikâyeleri; Pasifik adalarında geçen macera ve sömürgecilik öyküleridir."],
  ["Ayazın Çocukları", "Children of the Frost", 1902, 224, "Klasik, Kurgu, Öykü", dr("0002041994001"),
    "Ayazın Çocukları; Kuzey halklarının yaşamını anlatan öykü derlemesidir."],
  ["Kayıp Yüz", "Lost Face", 1910, 192, "Klasik, Kurgu, Öykü", dr("0002077429001"),
    "Kayıp Yüz; Kuzey'de geçen sert ve unutulmaz öyküleri içerir."],
  // Kurgu dışı
  ["Yol", "The Road", 1907, 224, "Klasik, Kurgu Dışı, Anı", dr("0002130373001"),
    "Yol; Jack London'ın serseri yıllarını ve tren üstü yolculuklarını anlattığı anı kitabıdır."],
  ["Uçurum İnsanları", "The People of the Abyss", 1903, 288, "Klasik, Kurgu Dışı, Sosyoloji", dr("0000000585617"),
    "Uçurum İnsanları; London'ın Doğu Londra yoksulluğu üzerine yazdığı etkileyici bir incelemedir."],
  ["John Barleycorn", "John Barleycorn", 1913, 256, "Klasik, Kurgu Dışı, Anı", dr("0002179557001"),
    "John Barleycorn; Jack London'ın alkolle ilişkisini anlattığı otobiyografik eseridir."],
  ["Snark Yolculuğu", "The Cruise of the Snark", 1911, 320, "Klasik, Kurgu Dışı, Gezi", ol(8247748),
    "Snark Yolculuğu; Jack London'ın kendi gemisiyle Pasifik'te yaptığı yolculuğun anlatısıdır."],
];

(async () => {
  for (const [title, , , , , coverUrl] of BOOKS) {
    const st = await head(coverUrl);
    console.log(st === 200 ? "OK" : "BAD", title, st, coverUrl.slice(-40));
    if (st !== 200) throw new Error("bad cover " + title);
  }

  const lines = [
    "-- Jack London missing titles (D&R / Open Library covers)",
    "-- docker cp oldb-backend/scripts/seed_jack_london_extra.sql my_postgres:/tmp/seed_jack_london_extra.sql",
    "-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_jack_london_extra.sql",
    "",
    "BEGIN;",
    "",
  ];

  for (const [title, original, year, pages, genres, coverUrl, desc] of BOOKS) {
    lines.push(
      "INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)",
      "SELECT nextval('book_id_seq'),",
      `  ${uEscape(title)}, ${uEscape(original)}, a.id, ${year}, ${pages},`,
      `  ${uEscape(desc)}, ${uEscape(genres)}, 'eng', ${uEscape(coverUrl)},`,
      "  false, false, false, false, NOW(), NOW(), 'seed', 'seed'",
      "FROM authors a",
      "WHERE lower(trim(a.name)) = lower(trim(U&'Jack London'))",
      "  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(" +
        uEscape(title) +
        ")));",
      ""
    );
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id",
    "WHERE a.name = U&'Jack London' GROUP BY a.id, a.name;",
    "",
    "SELECT title FROM books WHERE author_id = (SELECT id FROM authors WHERE name = U&'Jack London') ORDER BY title;"
  );

  const out = path.join(__dirname, "seed_jack_london_extra.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out, BOOKS.length);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
