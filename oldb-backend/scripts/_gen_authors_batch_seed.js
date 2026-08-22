/**
 * Patch batch seed with verified D&R urunnos for misses + fix bad matches.
 * Then rewrite seed_authors_batch.sql and load.
 */
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
    const req = https.request(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } }, (res) =>
      resolve(res.statusCode)
    );
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

async function findFirst(query, pred) {
  const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(query)}`);
  const links = [...body.matchAll(/href="(\/kitap\/[^"]+urunno=(\d+))"/g)].map((m) => ({
    href: m[1].toLowerCase(),
    id: m[2],
  }));
  const hit = [...new Map(links.map((l) => [l.id, l])).values()].find((l) => pred(l.href));
  if (!hit) return null;
  const c = cover(hit.id);
  if ((await head(c)) !== 200) return null;
  return { ...hit, cover: c };
}

const AUTHORS = [
  {
    name: "Lev Tolstoy",
    country: "Rusya",
    birth_year: 1828,
    death_year: 1910,
    language: "rus",
    portrait: "https://ui-avatars.com/api/?name=Lev+Tolstoy&background=1a1a1a&color=d4af37&size=256",
    description:
      "Lev Nikolayeviç Tolstoy (1828–1910), Rus edebiyatının en büyük romancılarındandır. " +
      "Savaş ve Barış ile Anna Karenina başyapıtları arasında yer alır; ahlak, tarih ve bireysel vicdan temalarını epik bir genişlikte işler.",
    books: [
      ["Savaş ve Barış", "Война и мир", 1869, 1400, "Klasik, Kurgu, Tarih", "0002226516001",
        "Savaş ve Barış; Napolyon savaşları döneminde Rus aristokrasisinin hayatını, tarihi ve bireysel kaderleri iç içe anlatan epik bir romandır."],
      ["Anna Karenina", "Анна Каренина", 1877, 960, "Klasik, Kurgu, Romantik", "0000000374848",
        "Anna Karenina; tutkulu bir aşkın toplumsal ahlakla çatışmasını anlatır. Tolstoy'un en olgun psikolojik romanlarından biridir."],
      ["Diriliş", "Воскресение", 1899, 560, "Klasik, Kurgu, Drama", "0000000304801",
        "Diriliş; bir soylunun vicdan uyanışını ve adalet arayışını anlatır. Tolstoy'un geç döneminin ahlaki yoğunluğunu taşır."],
      ["İvan İlyiç'in Ölümü", "Смерть Ивана Ильича", 1886, 128, "Klasik, Kurgu, Felsefe", "0000000591730",
        "İvan İlyiç'in Ölümü; sıradan bir memurun ölümle yüzleşmesini anlatan kısa ama derin bir novelladır."],
      ["Kreutzer Sonatı", "Крейцерова соната", 1889, 144, "Klasik, Kurgu, Psikolojik", "0000000451302",
        "Kreutzer Sonatı; kıskançlık, evlilik ve ahlak üzerine sert bir anlatıdır."],
      ["Hacı Murat", "Хаджи-Мурат", 1912, 192, "Klasik, Kurgu, Tarih", "0000000276914",
        "Hacı Murat; Kafkasya savaşlarında geçen bir direniş ve onur hikâyesidir."],
      ["Kazaklar", "Казаки", 1863, 224, "Klasik, Kurgu, Macera", "0001782494001",
        "Kazaklar; Kafkasya'da bir subayın Kazak yaşamıyla karşılaşmasını anlatır. Tolstoy'un erken döneminin güçlü bir romanıdır."],
      ["Sivastopol", "Севастопольские рассказы", 1855, 192, "Klasik, Kurgu, Tarih", "0000000303607",
        "Sivastopol; Kırım Savaşı'ndan kesitlerle savaşın gerçek yüzünü anlatan öykülerdir."],
      ["Efendi ile Uşağı", "Хозяин и работник", 1895, 112, "Klasik, Kurgu, Öykü", "0000000641887",
        "Efendi ile Uşağı; bir kar fırtınasında efendi ile uşağın kader birliğini anlatır."],
      ["İtiraf", "Исповедь", 1882, 128, "Klasik, Kurgu Dışı, Felsefe", "0002012492001",
        "İtiraf; Tolstoy'un inanç ve anlam arayışını anlattığı otobiyografik denemesidir."],
    ],
  },
  {
    name: "Albert Camus",
    country: "Fransa",
    birth_year: 1913,
    death_year: 1960,
    language: "fra",
    portrait: "https://ui-avatars.com/api/?name=Albert+Camus&background=1a1a1a&color=d4af37&size=256",
    description:
      "Albert Camus (1913–1960), Absürt felsefenin önde gelen yazar ve düşünürlerindendir. " +
      "Yabancı, Veba ve Düşüş romanlarıyla modern bireyin yabancılaşmasını işlemiş; 1957'de Nobel Edebiyat Ödülü'nü almıştır.",
    books: [
      ["Yabancı", "L'Étranger", 1942, 128, "Klasik, Kurgu, Felsefe", "0000000064464",
        "Yabancı; Meursault'nun kayıtsızlığını ve absürt bir dünyadaki yargılanışını anlatır. Camus'nün en bilinen romanıdır."],
      ["Veba", "La Peste", 1947, 320, "Klasik, Kurgu, Felsefe", "0000000064631",
        "Veba; Oran kentini saran salgın üzerinden direniş, dayanışma ve absürdü anlatır."],
      ["Düşüş", "La Chute", 1956, 144, "Klasik, Kurgu, Felsefe", "0000000064648",
        "Düşüş; bir avukatın itirafları üzerinden suçluluk, yargılama ve ikiyüzlülüğü anlatır."],
      ["Mutlu Ölüm", "La Mort heureuse", 1971, 192, "Klasik, Kurgu, Felsefe", "0000000064282",
        "Mutlu Ölüm; Camus'nün erken dönem romanıdır. Özgürlük ve mutluluk arayışını işler."],
      ["Sisifos Söyleni", "Le Mythe de Sisyphe", 1942, 192, "Klasik, Felsefe, Deneme", "0000000064591",
        "Sisifos Söyleni; absürt kavramını kuramsal olarak ortaya koyan denemedir."],
      ["Başkaldıran İnsan", "L'Homme révolté", 1951, 352, "Klasik, Felsefe, Deneme", "0000000064456",
        "Başkaldıran İnsan; isyan, özgürlük ve adalet üzerine kapsamlı bir denemedir."],
      ["Caligula", "Caligula", 1944, 128, "Klasik, Drama, Felsefe", "0001887315001",
        "Caligula; mutlak iktidarın absürtlüğünü işleyen bir oyundur."],
      ["Yanlışlık", "Le Malentendu", 1944, 112, "Klasik, Drama", "0000000636824",
        "Yanlışlık; kimlik, yabancılaşma ve trajik bir hatayı anlatan bir Camus oyunudur."],
    ],
  },
  {
    name: "Franz Kafka",
    country: "Çekya",
    birth_year: 1883,
    death_year: 1924,
    language: "deu",
    portrait: "https://ui-avatars.com/api/?name=Franz+Kafka&background=1a1a1a&color=d4af37&size=256",
    description:
      "Franz Kafka (1883–1924), modern edebiyatın en etkili yazarlarındandır. " +
      "Bürokrasi, suçluluk ve varoluşsal kaygıyı labirentimsi anlatılarla işlemiştir.",
    books: [
      ["Dönüşüm", "Die Verwandlung", 1915, 96, "Klasik, Kurgu, Fantastik", "0001866845001",
        "Dönüşüm; Gregor Samsa'nın bir sabah böceğe dönüşmesiyle başlayan aile, emek ve yabancılaşma öyküsüdür."],
      ["Dava", "Der Process", 1925, 288, "Klasik, Kurgu, Gerilim", "0002163630001",
        "Dava; Josef K.'nın nedenini bilmediği bir suçlamayla yargılanmasını anlatır."],
      ["Amerika", "Der Verschollene", 1927, 320, "Klasik, Kurgu, Macera", "0001956857001",
        "Amerika (Kayıp); genç Karl Rossmann'ın Yeni Dünya'daki sürüklenişini anlatır."],
      ["Açlık Sanatçısı", "Ein Hungerkünstler", 1924, 112, "Klasik, Kurgu, Öykü", "0001925404001",
        "Açlık Sanatçısı; gösteri, yalnızlık ve anlaşılmamayı anlatan öykülerden oluşur."],
      ["Ceza Sömürgesi", "In der Strafkolonie", 1919, 80, "Klasik, Kurgu, Gerilim", "0002130663001",
        "Ceza Sömürgesi; bir işkence makinesi üzerinden adalet, itaat ve vahşeti anlatır."],
      ["Babaya Mektup", "Brief an den Vater", 1919, 96, "Klasik, Kurgu Dışı, Anı", "0000000708515",
        "Babaya Mektup; Kafka'nın babasıyla ilişkisini açığa vuran uzun bir itiraftır."],
      ["Aforizmalar", "Aphorismen", 1931, 128, "Klasik, Felsefe, Deneme", "0001885950001",
        "Aforizmalar; Kafka'nın kısa, keskin düşünce parçalarını bir araya getirir."],
      ["Şato", "Das Schloss", 1926, 352, "Klasik, Kurgu, Fantastik", "0001837125001",
        "Şato; K.'nın erişilemeyen bir otoriteye ulaşma çabasını anlatır."],
    ],
  },
  {
    name: "George Orwell",
    country: "İngiltere",
    birth_year: 1903,
    death_year: 1950,
    language: "eng",
    portrait: "https://ui-avatars.com/api/?name=George+Orwell&background=1a1a1a&color=d4af37&size=256",
    description:
      "George Orwell (1903–1950), totalitarizm eleştirisi ve net üslubuyla tanınan İngiliz yazardır. " +
      "1984 ve Hayvan Çiftliği ile siyasal distopyanın klasiklerini yazmıştır.",
    books: [
      ["1984", "Nineteen Eighty-Four", 1949, 352, "Klasik, Distopya, Kurgu", "0001903206001",
        "1984; Büyük Birader'in gözetimindeki bir totaliter toplumu anlatır."],
      ["Hayvan Çiftliği", "Animal Farm", 1945, 128, "Klasik, Distopya, Alegori", "0001903207001",
        "Hayvan Çiftliği; bir çiftlik isyanı üzerinden iktidarın yozlaşmasını anlatan alegorik bir novelladır."],
      ["Paris ve Londra'da Beş Parasız", "Down and Out in Paris and London", 1933, 256, "Klasik, Kurgu Dışı, Anı", "0000000646397",
        "Paris ve Londra'da Beş Parasız; yoksulluk ve güvencesiz emeği anlatan yarı otobiyografik bir anlatıdır."],
      ["Katalonya'ya Selam", "Homage to Catalonia", 1938, 288, "Klasik, Kurgu Dışı, Tarih", "0000000364145",
        "Katalonya'ya Selam; İspanya İç Savaşı'ndaki tanıklığını anlatır."],
      ["Burma Günleri", "Burmese Days", 1934, 320, "Klasik, Kurgu, Drama", "0001974385001",
        "Burma Günleri; sömürge düzeninin çürümüşlüğünü Burma'da geçen bir romanda anlatır."],
      ["Aspidistra", "Keep the Aspidistra Flying", 1936, 288, "Klasik, Kurgu, Drama", "0001905502001",
        "Aspidistra; para, sınıf ve sanatçı gururunu anlatan erken bir Orwell romanıdır."],
      ["Kitaplar ve Sigaralar", "Books v. Cigarettes", 1952, 128, "Klasik, Deneme", "0001967208001",
        "Kitaplar ve Sigaralar; okuma, yazma ve gündelik hayat üzerine Orwell denemelerinden bir derlemedir."],
    ],
  },
];

(async () => {
  // Verify all covers
  for (const a of AUTHORS) {
    for (const b of a.books) {
      const status = await head(cover(b[5]));
      console.log(status === 200 ? "OK" : "BAD", a.name, b[0], b[5], status);
      if (status !== 200) throw new Error("bad cover " + b[0]);
    }
  }

  const lines = [
    "-- Batch seed: Tolstoy, Camus, Kafka, Orwell (D&R covers)",
    "-- docker cp oldb-backend/scripts/seed_authors_batch.sql my_postgres:/tmp/seed_authors_batch.sql",
    "-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_authors_batch.sql",
    "",
    "BEGIN;",
    "",
  ];

  for (const author of AUTHORS) {
    lines.push(
      `-- ${author.name}`,
      "INSERT INTO authors (name, country, birth_year, death_year, portrait, description)",
      "SELECT",
      `  ${uEscape(author.name)}, ${uEscape(author.country)}, ${author.birth_year}, ${author.death_year},`,
      `  ${uEscape(author.portrait)}, ${uEscape(author.description)}`,
      `WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(${uEscape(author.name)})));`,
      "",
      "UPDATE authors SET",
      `  country = ${uEscape(author.country)}, birth_year = ${author.birth_year}, death_year = ${author.death_year},`,
      `  portrait = COALESCE(NULLIF(TRIM(portrait), ''), ${uEscape(author.portrait)}),`,
      `  description = ${uEscape(author.description)}`,
      `WHERE lower(trim(name)) = lower(trim(${uEscape(author.name)}));`,
      ""
    );
    for (const [title, original, year, pages, genres, urunno, desc] of author.books) {
      lines.push(
        "INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)",
        "SELECT nextval('book_id_seq'),",
        `  ${uEscape(title)}, ${uEscape(original)}, a.id, ${year}, ${pages},`,
        `  ${uEscape(desc)}, ${uEscape(genres)}, '${author.language}', ${uEscape(cover(urunno))},`,
        "  false, false, false, false, NOW(), NOW(), 'seed', 'seed'",
        "FROM authors a",
        `WHERE lower(trim(a.name)) = lower(trim(${uEscape(author.name)}))`,
        "  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(" +
          uEscape(title) +
          ")));",
        ""
      );
    }
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id",
    "WHERE a.name IN (" + AUTHORS.map((a) => uEscape(a.name)).join(", ") + ")",
    "GROUP BY a.id, a.name ORDER BY a.name;"
  );

  const out = path.join(__dirname, "seed_authors_batch.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out);
  AUTHORS.forEach((a) => console.log(a.name, a.books.length));
})();
