const https = require("https");

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

(async () => {
  const qs = [
    "Yabancı Albert Camus Modern Klasikler",
    "Veba Albert Camus Modern Klasikler",
    "Dönüşüm Franz Kafka Modern Klasikler",
    "Şato Franz Kafka",
    "Amerika Kafka Modern Klasikler",
    "Boğaza Dolanan Soluk Orwell",
    "Fil Öldürmek Orwell deneme",
    "Çocukluk Lev Tolstoy Hasan Ali",
    "Yabancı Camus Can Yayınları",
  ];
  for (const q of qs) {
    const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`);
    const links = [...new Set([...body.matchAll(/href="(\/kitap\/[^"]+urunno=\d+)"/g)].map((m) => m[1]))]
      .filter((h) => !/cocuk-ve-genclik|kisalt|seti|takim|biyografi/i.test(h))
      .slice(0, 10);
    console.log("\n==", q);
    links.forEach((l) => console.log(l));
  }
})();
