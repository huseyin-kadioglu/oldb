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

function extract(html) {
  const out = [];
  const re =
    /href="(\/kitap\/[^"]+urunno=(\d+))"[^>]*>[\s\S]{0,800}?<(?:span|div|h[1-6]|a)[^>]*>\s*([^<]{3,120})/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 20) {
    const title = m[3].replace(/\s+/g, " ").trim();
    if (!/kitap|incele|sepet|favori|hediye/i.test(title)) {
      out.push({ title, id: m[2], href: m[1] });
    }
  }
  if (!out.length) {
    const ids = [...new Set(html.match(/\/kitap\/[^"']+urunno=\d+/g) || [])].slice(0, 15);
    return ids.map((href) => ({
      href,
      id: href.match(/urunno=(\d+)/)[1],
      title: href.split("/")[2],
    }));
  }
  return out;
}

(async () => {
  const queries = [
    "Boğaza Dolanan Soluk George Orwell",
    "Boğaza Dolanan Soluk Can Yayınları",
    "Fil Öldürmek Orwell",
    "Fil Öldürmek ve Diğer Denemeler",
    "Coming Up for Air Orwell Türkçe",
  ];
  for (const q of queries) {
    const html = await get("https://www.dr.com.tr/search?q=" + encodeURIComponent(q));
    console.log("\n===", q);
    for (const row of extract(html).slice(0, 8)) {
      console.log(row.id, row.title, row.href);
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
