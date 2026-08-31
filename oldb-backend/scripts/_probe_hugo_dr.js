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
  const queries = [
    "Sefiller Hasan Ali Yücel",
    "Sefiller Victor Hugo İş Bankası",
    "Gülen Adam Victor Hugo",
    "L'Homme qui rit Hugo",
    "93 Quatrevingt Victor Hugo Hasan",
    "Doksan Üç Victor Hugo",
    "Hernani Victor Hugo İş Bankası",
    "Sefiller Cilt Hasan Ali Yücel",
  ];
  for (const q of queries) {
    const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`);
    const links = [...new Set([...body.matchAll(/href="(\/kitap\/[^"]+)"/g)].map((m) => m[1]))]
      .filter((h) => /hugo|sefiller|gulen|homme|hernani|93|doksan|miserables/i.test(h))
      .slice(0, 12);
    console.log("\n==", q);
    links.forEach((l) => console.log(l));
  }
})();
