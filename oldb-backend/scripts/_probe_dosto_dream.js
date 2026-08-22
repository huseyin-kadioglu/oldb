const https = require("https");

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
        res.on("end", () => resolve(typeof d === "string" ? d : ""));
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

(async () => {
  const qs = [
    "Gülünç Bir Adamın Düşü Dostoyevski",
    "Gülünç Bir Adam Dostoyevski Can",
    "Dostoyevski seçme hikayeler",
    "Dostoyevski bütün hikayeler",
    "Bir Aptalın Rüyası Dostoyevski",
    "Komik Adamın Rüyası Dostoyevski",
    "Dream of a Ridiculous Man Dostoyevski",
    "Dostoyevski Uysal bir kadın",
  ];
  for (const q of qs) {
    const html = await get("https://www.dr.com.tr/search?q=" + encodeURIComponent(q));
    const hrefs = [...new Set(html.match(/\/kitap\/[^"']+urunno=\d+/g) || [])];
    console.log("\n===", q);
    hrefs
      .filter((h) => /dosto|gulunc|ruya|dus|hikaye|oyku|secme|butun|uysal|ridiculous/i.test(h))
      .slice(0, 15)
      .forEach((h) => console.log(h));
  }

  // Try Open Library ISBN covers as fallback candidates
  const ol = await get(
    "https://openlibrary.org/search.json?title=Dream%20of%20a%20Ridiculous%20Man&author=Dostoevsky&limit=5"
  );
  console.log("\nOL", ol.slice(0, 500));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
