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
    "hasan-ali-yucel victor hugo",
    "victor hugo hasan ali yücel klasikleri",
    "sefiller hasan-ali-yucel",
    "adam ki guler victor hugo",
    "gülen adam hasan ali",
    "doksan üç hasan ali yücel",
  ];
  for (const q of queries) {
    const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`);
    const links = [...new Set([...body.matchAll(/href="(\/kitap\/[^"]*hasan-ali[^"]*)"/gi)].map((m) => m[1]))];
    const hugo = [...new Set([...body.matchAll(/href="(\/kitap\/[^"]*hugo[^"]*)"/gi)].map((m) => m[1]))];
    console.log("\n==", q);
    console.log("HAY links:", links.slice(0, 15).join("\n") || "(none)");
    console.log("Hugo links:", hugo.slice(0, 15).join("\n") || "(none)");
  }

  // Author page style searches
  const body = await get("https://www.dr.com.tr/search?q=" + encodeURIComponent("Victor Hugo"));
  const all = [...new Set([...body.matchAll(/href="(\/kitap\/[^"]+urunno=\d+)"/g)].map((m) => m[1]))]
    .filter((h) => /hugo|sefiller|notre|deniz-isc|idam|doksan|gulen|claude/i.test(h) && !/cocuk|kisalt|biyografi|inceleme/i.test(h));
  console.log("\n== Victor Hugo filtered");
  all.slice(0, 40).forEach((l) => console.log(l));
})();
