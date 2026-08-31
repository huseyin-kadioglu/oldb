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
        res.on("end", () => resolve({ status: res.statusCode, body: d }));
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

async function verify(id, pathHint) {
  const url = pathHint
    ? `https://www.dr.com.tr${pathHint}`
    : `https://www.dr.com.tr/kitap/x/urunno=${id}`;
  const r = await get(url.startsWith("http") ? url : `https://www.dr.com.tr${url}`);
  const title = ((r.body.match(/<title>([^<]+)/) || [])[1] || "").replace(/\s+/g, " ").trim();
  const isLondon = /jack\s*london/i.test(r.body.slice(0, 80000));
  const cover = `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
  return { id, title: title.slice(0, 110), isLondon, coverStatus: await head(cover) };
}

(async () => {
  // Verify suspect matches
  const suspects = [
    ["/kitap/gun-isigi/edebiyat/roman/fantastik/urunno=0000000681028", "0000000681028"],
    ["/kitap/puyos-london-adventure/foreign-languages/children-and-teen/children/urunno=0001909129001", "0001909129001"],
    ["/kitap/ay-vadisi/edebiyat/roman/dunya-roman/urunno=0001857281001", "0001857281001"],
    ["/kitap/buyuk-evin-kucuk-hanimefendisi/edebiyat/roman/dunya-klasik/urunno=0001758514001", "0001758514001"],
    ["/kitap/guney-denizi-hikayeleri/edebiyat/roman/dunya-klasik/urunno=0002175721001", "0002175721001"],
    ["/kitap/kayip-yuz/edebiyat/roman/polisiye/urunno=0002010913001", "0002010913001"],
    ["/kitap/yol/jack-london/edebiyat/roman/dunya-klasik/urunno=0000000126971", "0000000126971"],
    ["/kitap/ucurum-insanlari/edebiyat/roman/dunya-roman/urunno=0000000585617", "0000000585617"],
  ];
  console.log("=== VERIFY ===");
  for (const [path, id] of suspects) {
    console.log(await verify(id, path));
  }

  const queries = [
    "Gün Işığı Jack London İş Bankası",
    "Burning Daylight Jack London Modern Klasikler",
    "Macera Jack London İş Bankası",
    "Adventure Jack London Türkçe",
    "Adaların Jerry'si",
    "Jerry of the Islands Türkçe",
    "Üç Yürek Jack London",
    "Hearts of Three Türkçe",
    "Smoke ile Shorty",
    "Smoke and Shorty Türkçe",
    "Snark Yolculuğu",
    "Cruise of the Snark Türkçe",
    "Yaşama Sevgisi Jack London Türkçe",
    "Kurt Oğlu Jack London Türkçe",
    "Kayıp Yüz Jack London",
    "Lost Face Jack London Türkçe",
    "Ayazın Çocukları Jack London Türkçe",
    "John Barleycorn Türkçe",
  ];

  for (const q of queries) {
    const html = (await get("https://www.dr.com.tr/search?q=" + encodeURIComponent(q))).body;
    const hrefs = [...new Set(html.match(/\/kitap\/[^"']+urunno=\d+/g) || [])];
    const relevant = hrefs.filter((h) =>
      /london|gun-isigi|burning|macera|adventure|jerry|michael|yurek|hearts|smoke|shorty|snark|yasama|kurt-oglu|kayip|lost-face|ayaz|barleycorn|guney|ucurum|yol|daylight|valley|ay-vadisi|buyuk-evin/i.test(
        h
      )
    );
    console.log("\n===", q);
    relevant.slice(0, 12).forEach((h) => console.log(h));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
