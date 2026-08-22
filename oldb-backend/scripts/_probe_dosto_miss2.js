const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" }, maxRedirects: 5 }, (res) => {
        let d = "";
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = res.headers.location.startsWith("http")
            ? res.headers.location
            : "https://www.dr.com.tr" + res.headers.location;
          return get(loc).then(resolve, reject);
        }
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve({ status: res.statusCode, body: d }));
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
  const ids = [
    "0000000184919",
    "0000000564472",
    "0000000058766",
    "0001725150001",
    "0000000267623",
    "0002017363001",
  ];
  for (const id of ids) {
    const url = `https://www.dr.com.tr/kitap/x/urunno=${id}`;
    // Better: search product by following known paths
  }

  const urls = [
    "https://www.dr.com.tr/kitap/delikanli/edebiyat/roman/dunya-klasik/urunno=0000000184919",
    "https://www.dr.com.tr/kitap/delikanli/edebiyat/roman/dunya-klasik/urunno=0000000564472",
    "https://www.dr.com.tr/kitap/delikanli/edebiyat/roman/dunya-klasik/urunno=0000000058766",
    "https://www.dr.com.tr/kitap/delikanli/edebiyat/roman/dunya-klasik/urunno=0001725150001",
    "https://www.dr.com.tr/kitap/timsah/edebiyat/roman/dunya-roman/urunno=0000000267623",
    "https://www.dr.com.tr/kitap/timsah-kisa-klasikler-77/edebiyat/roman/dunya-klasik/urunno=0002017363001",
  ];

  for (const u of urls) {
    const r = await get(u);
    const title = (r.body.match(/<title>([^<]+)/) || [])[1];
    const author =
      (r.body.match(/itemprop="author"[^>]*content="([^"]+)"/i) ||
        r.body.match(/"author"\s*:\s*"([^"]+)"/i) ||
        r.body.match(/Yazar[^<]{0,40}<[^>]+>([^<]+)/i) ||
        [])[1] || "";
    const id = u.match(/urunno=(\d+)/)[1];
    const cover = `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
    console.log(await head(cover), id, (title || "").slice(0, 90), "|", author.slice(0, 40));
  }

  // More dream-title variants
  for (const q of [
    "Gülünç Bir Adam Dostoyevski",
    "Komik Bir Adamın Rüyası",
    "Dream of a Ridiculous Man Türkçe",
    "Dostoyevski Uysal Kız Gülünç",
    "Dostoyevski öyküleri Can Yayınları",
    "Dostoyevski seçme öyküler",
  ]) {
    const html = await get("https://www.dr.com.tr/search?q=" + encodeURIComponent(q));
    const hrefs = [...new Set(html.match(/\/kitap\/[^"']+urunno=\d+/g) || [])];
    console.log("\n===", q);
    hrefs
      .filter((h) => /dosto|gulunc|ruya|dus|oyku|uysal|timsah|secme/i.test(h))
      .slice(0, 15)
      .forEach((h) => console.log(h));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
