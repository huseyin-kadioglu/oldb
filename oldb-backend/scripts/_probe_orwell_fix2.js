const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
      })
      .on("error", reject);
  });
}

(async () => {
  const queries = [
    "George Orwell Can Yayınları",
    "George Orwell İş Bankası",
    "George Orwell Modern Klasikler",
    "aspidistra orwell",
    "burma günleri orwell",
  ];
  for (const q of queries) {
    const { body: html } = await get(
      "https://www.dr.com.tr/search?q=" + encodeURIComponent(q)
    );
    const hrefs = [...new Set(html.match(/\/kitap\/[^"']+urunno=\d+/g) || [])];
    console.log("\n===", q, "count", hrefs.length);
    for (const h of hrefs.slice(0, 25)) {
      if (/orwell|hayvan|1984|burma|aspidistra|paris|katalonya|fil|soluk|deneme|coming/i.test(h)) {
        console.log(h);
      }
    }
  }

  // Direct slug guesses
  const guesses = [
    "https://www.dr.com.tr/kitap/bogaza-dolanan-soluk/george-orwell/edebiyat/roman/dunya-roman/urunno=0000000364152",
    "https://www.dr.com.tr/kitap/bogaza-dolanan-soluk/george-orwell/edebiyat/roman/dunya-roman/urunno=0000000364160",
    "https://www.dr.com.tr/kitap/coming-up-for-air/george-orwell/edebiyat/roman/dunya-roman/urunno=0001903969001",
  ];
  for (const u of guesses) {
    const r = await get(u);
    console.log("guess", r.status, u.slice(-40), (r.body.match(/<title>([^<]+)/) || [])[1]);
  }

  // Head covers near known Orwell Can IDs
  const near = [];
  for (let i = 364100; i < 364200; i++) {
    near.push(String(i).padStart(13, "0"));
  }
  // Too many - just check a few known patterns from paris/katalonya neighbors
  const ids = [
    "0000000364138",
    "0000000364145",
    "0000000364152",
    "0000000364169",
    "0000000364176",
    "0000000646380",
    "0000000646397",
    "0000000646403",
    "0001903205001",
    "0001903208001",
    "0001905501001",
    "0001905503001",
  ];
  for (const id of ids) {
    const cover = `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
    const r = await get(cover);
    console.log("cover", id, r.status);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
