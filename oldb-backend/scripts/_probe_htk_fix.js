const https = require("https");
const fs = require("fs");
const path = require("path");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let d = "";
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = res.headers.location.startsWith("http")
            ? res.headers.location
            : "https://www.dr.com.tr" + res.headers.location;
          return get(loc).then(resolve, reject);
        }
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
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

(async () => {
  const checks = [
    ["https://www.dr.com.tr/kitap/sefiller/victor-hugo/edebiyat/roman/dunya-klasik/urunno=0002092782001", "Sefiller keep"],
    ["https://www.dr.com.tr/search?q=" + encodeURIComponent("Dava Franz Kafka Can Yayınları"), "Dava search"],
    ["https://www.dr.com.tr/search?q=" + encodeURIComponent("Şeytan Lev Tolstoy"), "Seytan"],
    ["https://www.dr.com.tr/search?q=" + encodeURIComponent("Kafka Günlükleri"), "Gunluk"],
    ["https://www.dr.com.tr/search?q=" + encodeURIComponent("İn Der Bau Kafka"), "In"],
    ["https://www.dr.com.tr/search?q=" + encodeURIComponent("Josefine Kafka Türkçe"), "Josefine"],
    ["https://www.dr.com.tr/search?q=" + encodeURIComponent("Blümfeld Kafka"), "Blumfeld"],
    ["https://www.dr.com.tr/search?q=" + encodeURIComponent("İki Süvari Tolstoy"), "Iki Suvari"],
    ["https://www.dr.com.tr/search?q=" + encodeURIComponent("Sefiller Victor Hugo Hasan Ali Yücel"), "Sefiller HAY"],
    ["https://www.dr.com.tr/search?q=" + encodeURIComponent("Dava Modern Klasikler Kafka"), "Dava MK"],
  ];

  for (const [url, label] of checks) {
    const html = await get(url);
    if (url.includes("/search")) {
      const hrefs = [...new Set(html.match(/\/kitap\/[^"']+urunno=\d+/g) || [])]
        .filter((h) =>
          /dava|sefiller|seytan|gunluk|bau|in-|josefine|josephine|blumfeld|suvari|kafka|tolstoy|hugo|miserables|trial/i.test(
            h
          )
        )
        .slice(0, 10);
      console.log("\n===", label);
      hrefs.forEach((h) => console.log(h));
    } else {
      const title = ((html.match(/<title>([^<]+)/) || [])[1] || "").slice(0, 90);
      console.log(label, title);
    }
  }

  // Verify specific IDs
  for (const id of [
    "0002092782001",
    "0000000064038",
    "0001866845001",
    "0001935985001",
    "0001837125001",
    "0000000142873",
    "0001903206001",
  ]) {
    // skip
  }

  // OL for misses
  for (const [title, author] of [
    ["The Diaries of Franz Kafka", "Franz Kafka"],
    ["The Burrow", "Franz Kafka"],
    ["Josephine the Singer", "Franz Kafka"],
    ["Blumfeld", "Franz Kafka"],
    ["Two Hussars", "Leo Tolstoy"],
    ["A Landowner's Morning", "Leo Tolstoy"],
    ["The Devil", "Leo Tolstoy"],
    ["The Trial", "Franz Kafka"],
    ["Les Miserables", "Victor Hugo"],
  ]) {
    const j = JSON.parse(
      await get(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=3`
      )
    );
    for (const d of j.docs || []) {
      if (!d.cover_i) continue;
      const st = await head(ol(d.cover_i));
      console.log("OL", title, d.cover_i, st, d.title);
      break;
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
