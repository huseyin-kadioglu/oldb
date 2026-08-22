const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let d = "";
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          return get(loc).then(resolve, reject);
        }
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });
}

(async () => {
  // Open Library Turkish search
  const olUrl =
    "https://openlibrary.org/search.json?q=" +
    encodeURIComponent("Gülünç Bir Adamın Düşü Dostoyevski") +
    "&limit=10";
  const ol = JSON.parse(await get(olUrl));
  console.log(
    "OL hits",
    ol.docs.slice(0, 8).map((d) => ({
      title: d.title,
      year: d.first_publish_year,
      isbn: (d.isbn || []).slice(0, 2),
      cover: d.cover_i,
      key: d.key,
    }))
  );

  const ol2 = JSON.parse(
    await get(
      "https://openlibrary.org/search.json?title=" +
        encodeURIComponent("Dream of a Ridiculous Man") +
        "&author=Dostoevsky&limit=8"
    )
  );
  console.log(
    "OL eng",
    ol2.docs.slice(0, 5).map((d) => ({
      title: d.title,
      isbn: (d.isbn || []).slice(0, 2),
      cover: d.cover_i,
    }))
  );

  // Kitapyurdu search page
  const ky = await get(
    "https://www.kitapyurdu.com/index.php?route=product/search&filter_name=" +
      encodeURIComponent("Gülünç Bir Adamın Düşü Dostoyevski")
  );
  const titles = [...ky.matchAll(/product-name[^>]*>[\s\S]*?<a[^>]*>([^<]+)/gi)].map((m) =>
    m[1].trim()
  );
  console.log("KY titles", titles.slice(0, 10));
  const imgs = [...ky.matchAll(/cdn\.kitapyurdu\.com\/[^"']+\.(?:jpg|png|webp)/gi)].slice(0, 8);
  console.log("KY imgs", imgs.map((m) => m[0]));

  // Direct D&R slug guesses
  const guesses = [
    "https://www.dr.com.tr/kitap/gulunc-bir-adamin-dusu/fyodor-mihaylovic-dostoyevski/edebiyat/roman/dunya-klasik/urunno=0000000058780",
    "https://www.dr.com.tr/kitap/gulunc-bir-adamin-ruyasi/fyodor-mihaylovic-dostoyevski/edebiyat/roman/dunya-klasik/urunno=0000000058797",
    "https://www.dr.com.tr/kitap/gulunc-bir-adamin-dusu/edebiyat/roman/dunya-klasik/urunno=0001887777001",
    "https://www.dr.com.tr/kitap/gulunc-bir-adamin-dusu/edebiyat/roman/dunya-klasik/urunno=0001930588001",
  ];
  for (const u of guesses) {
    const html = await get(u);
    const title = (html.match(/<title>([^<]+)/) || [])[1];
    console.log("guess", u.match(/urunno=(\d+)/)[1], (title || "").slice(0, 100));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
