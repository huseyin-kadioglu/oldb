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

async function searchDr(q) {
  const html = await get("https://www.dr.com.tr/search?q=" + encodeURIComponent(q));
  return [...new Set(html.match(/\/kitap\/[^"']+urunno=\d+/g) || [])];
}

async function olCover(title) {
  const j = JSON.parse(
    await get(
      "https://openlibrary.org/search.json?title=" +
        encodeURIComponent(title) +
        "&author=Jack+London&limit=5"
    )
  );
  return j.docs.slice(0, 5).map((d) => ({
    title: d.title,
    cover: d.cover_i,
    year: d.first_publish_year,
    url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
  }));
}

(async () => {
  for (const q of [
    "burning daylight jack london",
    "adventure jack london classics",
    "hearts of three jack london",
    "smoke and shorty",
    "cruise of the snark",
    "love of life jack london türkçe",
    "yasama sevgisi jack london",
    "burning-daylight",
  ]) {
    console.log("\nDR", q);
    const hrefs = await searchDr(q);
    hrefs
      .filter((h) =>
        /burning|daylight|adventure|hearts|smoke|shorty|snark|love-of-life|yasama|gun-isigi|macera|yurek/i.test(h)
      )
      .slice(0, 10)
      .forEach((h) => console.log(h));
  }

  for (const t of [
    "Burning Daylight",
    "Adventure",
    "Hearts of Three",
    "Smoke and Shorty",
    "The Cruise of the Snark",
    "Love of Life",
    "Lost Face",
  ]) {
    console.log("\nOL", t);
    const rows = await olCover(t);
    for (const r of rows) {
      if (!r.url) continue;
      console.log(await head(r.url), r.cover, r.title, r.year);
    }
  }

  // verify specific IDs
  for (const id of [
    "0002077420001",
    "0002077437001",
    "0001978374001",
    "0002179557001",
    "0002130373001",
    "0002077429001",
    "0001936719001",
    "0002042208001",
    "0002077452001",
    "0002041994001",
  ]) {
    const cover = `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
    console.log("cover", id, await head(cover));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
