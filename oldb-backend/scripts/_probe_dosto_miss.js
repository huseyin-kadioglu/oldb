const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });
}

(async () => {
  const queries = [
    "Delikanlı Dostoyevski",
    "Delikanlı Fyodor",
    "The Adolescent Dostoyevski Türkçe",
    "Podrostok Dostoyevski",
    "Gülünç Bir Adamın Düşü",
    "Gülünç Bir Adamın Rüyası",
    "Bir Adamın Rüyası Dostoyevski",
    "Timsah Dostoyevski",
    "Krokodil Dostoyevski",
    "Dostoyevski Timsah",
    "Dostoyevski öyküleri",
    "Dostoyevski kısa öyküler",
  ];
  for (const q of queries) {
    const html = await get("https://www.dr.com.tr/search?q=" + encodeURIComponent(q));
    const hrefs = [...new Set(html.match(/\/kitap\/[^"']+urunno=\d+/g) || [])];
    const relevant = hrefs.filter((h) =>
      /dosto|delikan|gulunc|timsah|krokodil|ruya|dus|oyku|adolescent|podrost/i.test(h)
    );
    console.log("\n===", q);
    relevant.slice(0, 12).forEach((h) => console.log(h));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
