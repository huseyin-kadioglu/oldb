const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve({ status: res.statusCode, body: d, loc: res.headers.location }));
      })
      .on("error", reject);
  });
}

(async () => {
  const urls = [
    "https://www.dr.com.tr/kitap/kitaplar-ve-sigaralar/george-orwell/edebiyat/roman/dunya-roman/urunno=0001967208001",
    "https://www.dr.com.tr/kitap/edebiyat-uzerine/george-orwell/edebiyat/deneme-yazin/urunno=0001967209001",
    "https://www.dr.com.tr/kitap/savas-gunlukleri/george-orwell/edebiyat/roman/dunya-roman/urunno=0001967207001",
    "https://www.dr.com.tr/kitap/george-orwell-denemeler-everest-acikhava-24/edebiyat/edebiyat-inceleme/urunno=0001975282001",
    "https://www.dr.com.tr/kitap/coming-up-for-air-mk-world-classics/foreign-languages/literature-and-novel/classics/urunno=0001903969001",
    "https://www.dr.com.tr/Kitap/Product?code=0000000364152",
  ];
  for (const u of urls) {
    let r = await get(u);
    if (r.status >= 300 && r.status < 400 && r.loc) r = await get(r.loc.startsWith("http") ? r.loc : "https://www.dr.com.tr" + r.loc);
    const title = (r.body.match(/<title>([^<]+)/) || [])[1];
    const author = (r.body.match(/itemprop="author"[^>]*content="([^"]+)"/) ||
      r.body.match(/Yazar[:\s]*<[^>]+>([^<]+)/i) ||
      [])[1];
    console.log(r.status, title, author || "", u.match(/urunno=(\d+)|code=(\d+)/).slice(1).filter(Boolean)[0]);
  }
  for (const id of ["0001967208001", "0001967209001", "0001967207001", "0001975282001", "0001903969001", "0000000364152"]) {
    const cover = `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
    const r = await get(cover);
    console.log("cover", id, r.status);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
