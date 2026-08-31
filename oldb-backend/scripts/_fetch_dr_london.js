const fs = require("fs");
const https = require("https");

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 OLDB-seed/1.0" } }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
      })
      .on("error", reject);
  });
}

(async () => {
  const q = encodeURIComponent("Jack London İş Bankası Modern Klasikler");
  const url = `https://www.dr.com.tr/search?q=${q}`;
  const { status, body } = await fetch(url);
  console.log("status", status, "len", body.length);
  fs.writeFileSync(__dirname + "/_dr_london_search.html", body, "utf8");

  const imgIds = [...body.matchAll(/originals\/(\d{10,})-1\.jpg/g)].map((m) => m[1]);
  console.log("unique image ids", [...new Set(imgIds)].slice(0, 40));

  // Look for product cards near Jack London
  const chunks = body.split(/Jack London/i);
  console.log("Jack London mentions", chunks.length - 1);

  // Extract href product links
  const links = [...body.matchAll(/href="(\/kitap\/[^"]+)"/g)].map((m) => m[1]);
  const londonLinks = [...new Set(links)].filter((l) =>
    /london|vahset|beyaz-dis|martin-eden|deniz-kurdu|demir-oyen|ayak-izi|atesi|gunes|aylak|yaban|kurtun|oyun|adam/i.test(l)
  );
  console.log("product links", londonLinks.slice(0, 40));

  // Try common DR API patterns
  const apiCandidates = [
    `https://www.dr.com.tr/api/search?q=${q}`,
    `https://www.dr.com.tr/api/catalog/search?q=${q}`,
    `https://frontend.dr.com.tr/api/search?q=${q}`,
  ];
  for (const a of apiCandidates) {
    try {
      const r = await fetch(a);
      console.log("API", a, r.status, r.body.slice(0, 120).replace(/\s+/g, " "));
    } catch (e) {
      console.log("API fail", a, e.message);
    }
  }
})();
