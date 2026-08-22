const https = require("https");
function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (r) => {
      let d = "";
      r.on("data", (c) => (d += c));
      r.on("end", () => res(d));
    }).on("error", rej);
  });
}
(async () => {
  const q = process.argv[2] || "stefan zweig satranç";
  const body = await get("https://www.dr.com.tr/search?q=" + encodeURIComponent(q));
  const links = [...body.matchAll(/href="(\/kitap\/[^"]+urunno=(\d+))"/gi)].map((m) => ({
    href: m[1].toLowerCase(),
    id: m[2],
  }));
  const unique = [...new Map(links.map((l) => [l.id, l])).values()].slice(0, 20);
  console.log(JSON.stringify(unique, null, 2));
})();
