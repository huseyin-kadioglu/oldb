/**
 * Expand Victor Hugo, Lev Tolstoy, Franz Kafka with Turkish D&R covers.
 * Also refresh covers for existing titles when a better Turkish edition is found.
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let data = "";
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = res.headers.location.startsWith("http")
            ? res.headers.location
            : "https://www.dr.com.tr" + res.headers.location;
          return get(loc).then(resolve, reject);
        }
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
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

function dr(id) {
  return `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
}

function ol(id) {
  return `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
}

function uEscape(s) {
  let out = "";
  for (const ch of s) {
    const o = ch.codePointAt(0);
    if (ch === "'") out += "''";
    else if (o < 128) out += ch;
    else out += "\\" + o.toString(16).toUpperCase().padStart(4, "0");
  }
  return `U&'${out}'`;
}

async function searchDr(q) {
  const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`);
  return [...body.matchAll(/href="(\/kitap\/[^"]+urunno=(\d+))"/g)].map((m) => ({
    href: m[1].toLowerCase(),
    id: m[2],
  }));
}

async function pageMeta(href) {
  const html = await get(`https://www.dr.com.tr${href}`);
  const title = ((html.match(/<title>([^<]+)/) || [])[1] || "").replace(/\s+/g, " ").trim();
  return { title, html: html.slice(0, 60000) };
}

function scoreHit(href, title, authorRe, titleRes, prefer) {
  let s = 0;
  const blob = `${href} ${title}`.toLowerCase();
  if (!authorRe.test(blob) && !authorRe.test(href)) return -1;
  for (const re of titleRes) if (re.test(blob)) s += 50;
  if (/hasan-ali-yucel|hay-|modern-klasikler|can-yayinlari|is-bankasi/i.test(blob)) s += 30;
  if (/dunya-klasik|klasikler/i.test(blob)) s += 15;
  if (/seti|takim|kutulu|ingilizce|foreign-languages|english/i.test(blob)) s -= 40;
  if (prefer) for (const re of prefer) if (re.test(blob)) s += 25;
  return s;
}

async function resolveCover(book) {
  if (book.urunno) {
    const url = dr(book.urunno);
    if ((await head(url)) === 200) return { url, source: "HARD", id: book.urunno };
  }

  let best = null;
  for (const q of book.queries) {
    const links = await searchDr(q);
    const uniq = [...new Map(links.map((l) => [l.id, l])).values()];
    const candidates = [];
    for (const hit of uniq.slice(0, 25)) {
      const hrefScore = scoreHit(hit.href, "", book.authorRe, book.titleRes, book.prefer);
      if (hrefScore >= 40) candidates.push({ hit, hrefScore });
      else if (book.titleRes.some((re) => re.test(hit.href))) candidates.push({ hit, hrefScore: 20 });
    }
    candidates.sort((a, b) => b.hrefScore - a.hrefScore);
    for (const { hit } of candidates.slice(0, 8)) {
      const meta = await pageMeta(hit.href);
      const sc = scoreHit(hit.href, meta.title, book.authorRe, book.titleRes, book.prefer);
      if (sc < 50) continue;
      const st = await head(dr(hit.id));
      if (st !== 200) continue;
      if (!best || sc > best.score) best = { ...hit, score: sc, title: meta.title };
    }
    if (best && best.score >= 80) break;
  }

  if (best) return { url: dr(best.id), source: "DR", id: best.id, title: best.title, score: best.score };

  if (book.olCover) {
    const url = ol(book.olCover);
    if ((await head(url)) === 200) return { url, source: "OL", id: book.olCover };
  }

  if (book.olTitle) {
    try {
      const j = JSON.parse(
        await get(
          "https://openlibrary.org/search.json?title=" +
            encodeURIComponent(book.olTitle) +
            "&author=" +
            encodeURIComponent(book.olAuthor || "") +
            "&limit=5"
        )
      );
      for (const d of j.docs || []) {
        if (!d.cover_i) continue;
        const url = ol(d.cover_i);
        if ((await head(url)) === 200) return { url, source: "OL", id: d.cover_i };
      }
    } catch (_) {}
  }
  return null;
}

const AUTHORS = [
  {
    name: "Victor Hugo",
    lang: "fra",
    authorRe: /victor\s*hugo|hugo/i,
    books: [
      // existing refresh targets + new
      {
        title: "Sefiller",
        original: "Les Misérables",
        year: 1862,
        pages: 1400,
        genres: "Klasik, Kurgu, Drama",
        existing: true,
        queries: ["Sefiller Victor Hugo İş Bankası", "Sefiller Victor Hugo Hasan Ali Yücel"],
        titleRes: [/sefiller|miserables/i],
        prefer: [/hasan-ali|yucel|modern-klasik/i],
        desc: "Sefiller; adalet, merhamet ve toplumsal adaletsizlik üzerine Victor Hugo'nun başyapıtıdır.",
      },
      {
        title: "Notre-Dame'ın Kamburu",
        original: "Notre-Dame de Paris",
        year: 1831,
        pages: 560,
        genres: "Klasik, Kurgu, Drama",
        existing: true,
        queries: ["Notre-Dame'ın Kamburu Victor Hugo Hasan Ali Yücel"],
        titleRes: [/notre-dame|kambur/i],
        prefer: [/hasan-ali|yucel/i],
        desc: "Notre-Dame'ın Kamburu; Ortaçağ Paris'inde aşk, kader ve gotik atmosfere kurulu bir romandır.",
      },
      {
        title: "Deniz İşçileri",
        original: "Les Travailleurs de la mer",
        year: 1866,
        pages: 480,
        genres: "Klasik, Kurgu, Macera",
        existing: true,
        queries: ["Deniz İşçileri Victor Hugo"],
        titleRes: [/deniz-iscileri|travailleurs/i],
        desc: "Deniz İşçileri; insanın doğaya karşı mücadelesini anlatan destansı bir romandır.",
      },
      {
        title: "Bir İdam Mahkûmunun Son Günü",
        original: "Le Dernier Jour d'un condamné",
        year: 1829,
        pages: 128,
        genres: "Klasik, Kurgu, Drama",
        existing: true,
        queries: ["Bir İdam Mahkûmunun Son Günü Victor Hugo"],
        titleRes: [/idam-mahkumu|dernier-jour|son-gunu/i],
        desc: "Bir İdam Mahkûmunun Son Günü; idam cezasına karşı yazılmış sarsıcı bir anlatıdır.",
      },
      {
        title: "Doksan Üç",
        original: "Quatrevingt-treize",
        year: 1874,
        pages: 480,
        genres: "Klasik, Kurgu, Tarih",
        existing: true,
        queries: ["Doksan Üç Victor Hugo"],
        titleRes: [/doksan-uc|quatrevingt/i],
        desc: "Doksan Üç; Fransız Devrimi'nin en kritik yılında geçen tarihsel bir romandır.",
      },
      {
        title: "Gülen Adam",
        original: "L'Homme qui rit",
        year: 1869,
        pages: 640,
        genres: "Klasik, Kurgu, Drama",
        queries: ["Gülen Adam Victor Hugo", "L'Homme qui rit Victor Hugo Türkçe"],
        titleRes: [/gulen-adam|homme-qui-rit|man-who-laughs/i],
        olTitle: "The Man Who Laughs",
        olAuthor: "Victor Hugo",
        desc: "Gülen Adam; yüzü sakatlanmış Gwynplaine üzerinden aristokrasi, aşk ve adaletsizliği anlatır.",
      },
      {
        title: "Claude Gueux",
        original: "Claude Gueux",
        year: 1834,
        pages: 96,
        genres: "Klasik, Kurgu, Drama",
        queries: ["Claude Gueux Victor Hugo", "Claude Gueux Türkçe"],
        titleRes: [/claude-gueux|claude.gueux/i],
        olTitle: "Claude Gueux",
        olAuthor: "Victor Hugo",
        desc: "Claude Gueux; hapishane, adalet ve toplumsal eşitsizlik üzerine kısa ama güçlü bir anlatıdır.",
      },
      {
        title: "Hernani",
        original: "Hernani",
        year: 1830,
        pages: 192,
        genres: "Klasik, Drama, Romantik",
        queries: ["Hernani Victor Hugo", "Hernani Hugo Türkçe"],
        titleRes: [/hernani/i],
        olTitle: "Hernani",
        olAuthor: "Victor Hugo",
        desc: "Hernani; romantizmin tiyatroda zaferini simgeleyen aşk ve onur oyunudur.",
      },
      {
        title: "Ruy Blas",
        original: "Ruy Blas",
        year: 1838,
        pages: 192,
        genres: "Klasik, Drama, Romantik",
        queries: ["Ruy Blas Victor Hugo", "Ruy Blas Türkçe"],
        titleRes: [/ruy-blas|ruy.blas/i],
        olTitle: "Ruy Blas",
        olAuthor: "Victor Hugo",
        desc: "Ruy Blas; bir uşağın soylu kimliğe bürünmesiyle gelişen entrika ve aşk oyunudur.",
      },
      {
        title: "İzlanda Hanı",
        original: "Han d'Islande",
        year: 1823,
        pages: 400,
        genres: "Klasik, Kurgu, Gerilim",
        queries: ["İzlanda Hanı Victor Hugo", "Han d'Islande Victor Hugo Türkçe"],
        titleRes: [/izlanda-hani|han-d-islande|han.dislande/i],
        olTitle: "Han of Iceland",
        olAuthor: "Victor Hugo",
        desc: "İzlanda Hanı; Hugo'nun erken dönem gotik-romantik romanlarından biridir.",
      },
      {
        title: "Bug-Jargal",
        original: "Bug-Jargal",
        year: 1826,
        pages: 256,
        genres: "Klasik, Kurgu, Tarih",
        queries: ["Bug-Jargal Victor Hugo", "Bug Jargal Victor Hugo"],
        titleRes: [/bug-jargal|bug.jargal/i],
        olTitle: "Bug-Jargal",
        olAuthor: "Victor Hugo",
        desc: "Bug-Jargal; Haiti isyanı döneminde dostluk ve özgürlük temasını işleyen bir romandır.",
      },
      {
        title: "Sefiller'den Seçmeler",
        original: "Les Misérables (selections)",
        year: 1862,
        pages: 320,
        genres: "Klasik, Kurgu, Drama",
        queries: ["Sefiller Seçmeler Victor Hugo", "Sefiller'den Seçmeler"],
        titleRes: [/sefiller.*secme|secmeler.*sefiller/i],
        skipIfHard: true,
        optional: true,
        desc: "Sefiller'den Seçmeler; başyapıttan derlenmiş okuma parçalarıdır.",
      },
      {
        title: "Cromwell",
        original: "Cromwell",
        year: 1827,
        pages: 320,
        genres: "Klasik, Drama, Tarih",
        queries: ["Cromwell Victor Hugo Türkçe", "Cromwell Hugo"],
        titleRes: [/cromwell/i],
        olTitle: "Cromwell",
        olAuthor: "Victor Hugo",
        desc: "Cromwell; Hugo'nun romantizm bildirisi niteliğindeki önsözüyle ünlü tarih oyunudur.",
      },
      {
        title: "Marion de Lorme",
        original: "Marion de Lorme",
        year: 1829,
        pages: 192,
        genres: "Klasik, Drama, Romantik",
        queries: ["Marion de Lorme Victor Hugo", "Marion de Lorme Türkçe"],
        titleRes: [/marion/i],
        olTitle: "Marion de Lorme",
        olAuthor: "Victor Hugo",
        desc: "Marion de Lorme; aşk ve iktidarın çatışmasını anlatan romantik bir oyundur.",
      },
      {
        title: "Şiirler",
        original: "Poésies",
        year: 1856,
        pages: 256,
        genres: "Klasik, Şiir",
        queries: ["Victor Hugo Şiirler", "Victor Hugo Seçme Şiirler", "Les Contemplations Türkçe"],
        titleRes: [/siir|poesie|contemplations|secme-siir/i],
        prefer: [/siir/i],
        olTitle: "Les Contemplations",
        olAuthor: "Victor Hugo",
        desc: "Şiirler; Victor Hugo'nun lirik ve epik şiirlerinden bir derlemedir.",
      },
    ],
  },
  {
    name: "Lev Tolstoy",
    lang: "rus",
    authorRe: /tolstoy|tolstoi|lev\s*nikol/i,
    books: [
      {
        title: "Savaş ve Barış",
        original: "Война и мир",
        year: 1869,
        pages: 1400,
        genres: "Klasik, Kurgu, Tarih",
        existing: true,
        queries: ["Savaş ve Barış Tolstoy İş Bankası", "Savaş ve Barış Tolstoy Hasan Ali"],
        titleRes: [/savas-ve-baris|war-and-peace/i],
        prefer: [/hasan-ali|modern-klasik|is-bank/i],
        desc: "Savaş ve Barış; Napolyon savaşları döneminde Rus aristokrasisinin destansı romanıdır.",
      },
      {
        title: "Anna Karenina",
        original: "Анна Каренина",
        year: 1877,
        pages: 960,
        genres: "Klasik, Kurgu, Romantik",
        existing: true,
        queries: ["Anna Karenina Tolstoy İş Bankası", "Anna Karenina Tolstoy Hasan Ali Yücel"],
        titleRes: [/anna-karenina/i],
        prefer: [/hasan-ali|modern-klasik/i],
        desc: "Anna Karenina; tutkulu bir aşkın toplumsal ahlakla çatışmasını anlatır.",
      },
      {
        title: "Diriliş",
        original: "Воскресение",
        year: 1899,
        pages: 560,
        genres: "Klasik, Kurgu, Drama",
        existing: true,
        queries: ["Diriliş Tolstoy", "Dirilis Tolstoy İş Bankası"],
        titleRes: [/dirilis|voskresenie|resurrection/i],
        desc: "Diriliş; bir soylunun vicdan uyanışını ve adalet arayışını anlatır.",
      },
      {
        title: "İvan İlyiç'in Ölümü",
        original: "Смерть Ивана Ильича",
        year: 1886,
        pages: 128,
        genres: "Klasik, Kurgu, Felsefe",
        existing: true,
        queries: ["İvan İlyiç'in Ölümü Tolstoy"],
        titleRes: [/ivan-ilyic|ivan.ilyich|olumu/i],
        desc: "İvan İlyiç'in Ölümü; sıradan bir memurun ölümle yüzleşmesini anlatır.",
      },
      {
        title: "Kreutzer Sonatı",
        original: "Крейцерова соната",
        year: 1889,
        pages: 144,
        genres: "Klasik, Kurgu, Psikolojik",
        existing: true,
        queries: ["Kreutzer Sonatı Tolstoy"],
        titleRes: [/kreutzer/i],
        desc: "Kreutzer Sonatı; kıskançlık, evlilik ve ahlak üzerine sert bir anlatıdır.",
      },
      {
        title: "Hacı Murat",
        original: "Хаджи-Мурат",
        year: 1912,
        pages: 192,
        genres: "Klasik, Kurgu, Tarih",
        existing: true,
        queries: ["Hacı Murat Tolstoy"],
        titleRes: [/haci-murat|hadji-murat/i],
        desc: "Hacı Murat; Kafkasya savaşlarında geçen bir direniş ve onur hikâyesidir.",
      },
      {
        title: "Kazaklar",
        original: "Казаки",
        year: 1863,
        pages: 224,
        genres: "Klasik, Kurgu, Macera",
        existing: true,
        queries: ["Kazaklar Tolstoy"],
        titleRes: [/kazaklar|cossacks/i],
        desc: "Kazaklar; Kafkasya'da bir subayın Kazak yaşamıyla karşılaşmasını anlatır.",
      },
      {
        title: "Sivastopol",
        original: "Севастопольские рассказы",
        year: 1855,
        pages: 192,
        genres: "Klasik, Kurgu, Tarih",
        existing: true,
        queries: ["Sivastopol Tolstoy", "Sivastopol Öyküleri Tolstoy"],
        titleRes: [/sivastopol|sevastopol/i],
        desc: "Sivastopol; Kırım Savaşı'ndan kesitlerle savaşın gerçek yüzünü anlatır.",
      },
      {
        title: "Efendi ile Uşağı",
        original: "Хозяин и работник",
        year: 1895,
        pages: 112,
        genres: "Klasik, Kurgu, Öykü",
        existing: true,
        queries: ["Efendi ile Uşağı Tolstoy"],
        titleRes: [/efendi-ile-usagi|master-and-man/i],
        desc: "Efendi ile Uşağı; bir kar fırtınasında efendi ile uşağın kader birliğini anlatır.",
      },
      {
        title: "İtiraf",
        original: "Исповедь",
        year: 1882,
        pages: 128,
        genres: "Klasik, Kurgu Dışı, Felsefe",
        existing: true,
        queries: ["İtiraf Tolstoy"],
        titleRes: [/itiraf|ispoved|confession/i],
        desc: "İtiraf; Tolstoy'un inanç ve anlam arayışını anlattığı otobiyografik denemesidir.",
      },
      {
        title: "Çocukluk",
        original: "Детство",
        year: 1852,
        pages: 192,
        genres: "Klasik, Kurgu, Anı",
        queries: ["Çocukluk Tolstoy", "Çocukluk Lev Tolstoy İş Bankası"],
        titleRes: [/cocukluk|detstvo|childhood/i],
        prefer: [/tolstoy/i],
        olTitle: "Childhood",
        olAuthor: "Leo Tolstoy",
        desc: "Çocukluk; Tolstoy'un otobiyografik üçlemesinin ilk kitabıdır.",
      },
      {
        title: "İlk Gençlik",
        original: "Отрочество",
        year: 1854,
        pages: 192,
        genres: "Klasik, Kurgu, Anı",
        queries: ["İlk Gençlik Tolstoy", "Boyhood Tolstoy Türkçe", "Delikanlılık Tolstoy"],
        titleRes: [/ilk-genclik|delikanlilik|otrocestvo|boyhood/i],
        olTitle: "Boyhood",
        olAuthor: "Leo Tolstoy",
        desc: "İlk Gençlik; otobiyografik üçlemenin ikinci kitabıdır.",
      },
      {
        title: "Gençlik",
        original: "Юность",
        year: 1857,
        pages: 224,
        genres: "Klasik, Kurgu, Anı",
        queries: ["Gençlik Tolstoy Lev", "Youth Tolstoy Türkçe"],
        titleRes: [/genclik|yunost|youth/i],
        prefer: [/tolstoy/i],
        olTitle: "Youth",
        olAuthor: "Leo Tolstoy",
        desc: "Gençlik; otobiyografik üçlemenin son kitabıdır.",
      },
      {
        title: "Aile Mutluluğu",
        original: "Семейное счастие",
        year: 1859,
        pages: 160,
        genres: "Klasik, Kurgu, Romantik",
        queries: ["Aile Mutluluğu Tolstoy"],
        titleRes: [/aile-mutlulugu|family-happiness/i],
        olTitle: "Family Happiness",
        olAuthor: "Leo Tolstoy",
        desc: "Aile Mutluluğu; evlilik ideali ile gerçekliğin çatışmasını anlatan bir novelladır.",
      },
      {
        title: "İnsan Neyle Yaşar",
        original: "Чем люди живы",
        year: 1885,
        pages: 96,
        genres: "Klasik, Kurgu, Öykü",
        queries: ["İnsan Neyle Yaşar Tolstoy"],
        titleRes: [/insan-neyle-yasar|what-men-live-by/i],
        olTitle: "What Men Live By",
        olAuthor: "Leo Tolstoy",
        desc: "İnsan Neyle Yaşar; merhamet ve insanlık üzerine alegorik bir öyküdür.",
      },
      {
        title: "Baba Sergiy",
        original: "Отец Сергий",
        year: 1911,
        pages: 128,
        genres: "Klasik, Kurgu, Felsefe",
        queries: ["Baba Sergiy Tolstoy", "Father Sergius Tolstoy Türkçe"],
        titleRes: [/baba-sergiy|father-sergius|otec-serg/i],
        olTitle: "Father Sergius",
        olAuthor: "Leo Tolstoy",
        desc: "Baba Sergiy; gurur, inanç ve çile üzerine geç dönem bir Tolstoy anlatısıdır.",
      },
      {
        title: "Şeytan",
        original: "Дьявол",
        year: 1911,
        pages: 112,
        genres: "Klasik, Kurgu, Psikolojik",
        queries: ["Şeytan Tolstoy", "The Devil Tolstoy Türkçe"],
        titleRes: [/seytan|dyavol|the-devil/i],
        prefer: [/tolstoy/i],
        olTitle: "The Devil",
        olAuthor: "Leo Tolstoy",
        desc: "Şeytan; tutku ve ahlaki çöküşü anlatan yoğun bir novelladır.",
      },
      {
        title: "Kafkas Esiri",
        original: "Кавказский пленник",
        year: 1872,
        pages: 80,
        genres: "Klasik, Kurgu, Macera",
        queries: ["Kafkas Esiri Tolstoy", "Kafkas Tutsağı Tolstoy"],
        titleRes: [/kafkas-esiri|kafkas-tutsagi|prisoner-of-the-caucasus/i],
        olTitle: "Prisoner of the Caucasus",
        olAuthor: "Leo Tolstoy",
        desc: "Kafkas Esiri; esaret ve kaçış üzerine kısa ama güçlü bir öyküdür.",
      },
      {
        title: "Polikuşka",
        original: "Поликушка",
        year: 1863,
        pages: 112,
        genres: "Klasik, Kurgu, Drama",
        queries: ["Polikuşka Tolstoy", "Polikushka Tolstoy"],
        titleRes: [/polikuska|polikushka/i],
        olTitle: "Polikushka",
        olAuthor: "Leo Tolstoy",
        desc: "Polikuşka; bir serfin trajik kaderini anlatan toplumsal bir öyküdür.",
      },
      {
        title: "Sanat Nedir?",
        original: "Что такое искусство?",
        year: 1897,
        pages: 256,
        genres: "Klasik, Kurgu Dışı, Deneme",
        queries: ["Sanat Nedir Tolstoy", "Sanat Nedir? Tolstoy"],
        titleRes: [/sanat-nedir|what-is-art/i],
        olTitle: "What is Art",
        olAuthor: "Leo Tolstoy",
        desc: "Sanat Nedir?; Tolstoy'un sanatın toplumsal ve ahlaki işlevini sorguladığı denemesidir.",
      },
      {
        title: "İki Süvari",
        original: "Два гусара",
        year: 1856,
        pages: 128,
        genres: "Klasik, Kurgu, Drama",
        queries: ["İki Süvari Tolstoy", "Two Hussars Tolstoy Türkçe"],
        titleRes: [/iki-suvari|two-hussars/i],
        olTitle: "Two Hussars",
        olAuthor: "Leo Tolstoy",
        desc: "İki Süvari; iki kuşağın ahlak ve yaşam tarzını karşılaştıran bir öyküdür.",
      },
      {
        title: "Toprak Sahibinin Sabahı",
        original: "Утро помещика",
        year: 1856,
        pages: 96,
        genres: "Klasik, Kurgu, Drama",
        queries: ["Toprak Sahibinin Sabahı Tolstoy"],
        titleRes: [/toprak-sahibinin|morning-of-a-landowner/i],
        olTitle: "A Landowner's Morning",
        olAuthor: "Leo Tolstoy",
        desc: "Toprak Sahibinin Sabahı; köylü reformu hayalleriyle gerçekliğin çatışmasını anlatır.",
      },
    ],
  },
  {
    name: "Franz Kafka",
    lang: "deu",
    authorRe: /franz\s*kafka|kafka/i,
    books: [
      {
        title: "Dönüşüm",
        original: "Die Verwandlung",
        year: 1915,
        pages: 96,
        genres: "Klasik, Kurgu, Fantastik",
        existing: true,
        queries: ["Dönüşüm Kafka İş Bankası", "Dönüşüm Franz Kafka Can"],
        titleRes: [/donusum|verwandlung|metamorphosis/i],
        prefer: [/hasan-ali|modern-klasik|can-/i],
        desc: "Dönüşüm; Gregor Samsa'nın bir sabah böceğe dönüşmesiyle başlayan yabancılaşma öyküsüdür.",
      },
      {
        title: "Dava",
        original: "Der Process",
        year: 1925,
        pages: 288,
        genres: "Klasik, Kurgu, Gerilim",
        existing: true,
        queries: ["Dava Kafka İş Bankası", "Dava Franz Kafka Can Yayınları"],
        titleRes: [/dava|der-process|the-trial/i],
        prefer: [/kafka/i],
        desc: "Dava; Josef K.'nın nedenini bilmediği bir suçlamayla yargılanmasını anlatır.",
      },
      {
        title: "Şato",
        original: "Das Schloss",
        year: 1926,
        pages: 352,
        genres: "Klasik, Kurgu, Fantastik",
        existing: true,
        queries: ["Şato Kafka", "Şato Franz Kafka Can"],
        titleRes: [/sato|schloss|castle/i],
        prefer: [/kafka/i],
        desc: "Şato; K.'nın erişilemeyen bir otoriteye ulaşma çabasını anlatır.",
      },
      {
        title: "Amerika",
        original: "Der Verschollene",
        year: 1927,
        pages: 320,
        genres: "Klasik, Kurgu, Macera",
        existing: true,
        queries: ["Amerika Kafka", "Kayıp Kafka Franz"],
        titleRes: [/amerika|verschollene|missing/i],
        prefer: [/kafka/i],
        desc: "Amerika (Kayıp); genç Karl Rossmann'ın Yeni Dünya'daki sürüklenişini anlatır.",
      },
      {
        title: "Açlık Sanatçısı",
        original: "Ein Hungerkünstler",
        year: 1924,
        pages: 112,
        genres: "Klasik, Kurgu, Öykü",
        existing: true,
        queries: ["Açlık Sanatçısı Kafka"],
        titleRes: [/aclik-sanatcisi|hungerkunstler/i],
        desc: "Açlık Sanatçısı; gösteri, yalnızlık ve anlaşılmamayı anlatan öykülerden oluşur.",
      },
      {
        title: "Ceza Sömürgesi",
        original: "In der Strafkolonie",
        year: 1919,
        pages: 80,
        genres: "Klasik, Kurgu, Gerilim",
        existing: true,
        queries: ["Ceza Sömürgesi Kafka"],
        titleRes: [/ceza-somurgesi|strafkolonie|penal-colony/i],
        desc: "Ceza Sömürgesi; bir işkence makinesi üzerinden adalet ve vahşeti anlatır.",
      },
      {
        title: "Babaya Mektup",
        original: "Brief an den Vater",
        year: 1919,
        pages: 96,
        genres: "Klasik, Kurgu Dışı, Anı",
        existing: true,
        queries: ["Babaya Mektup Kafka"],
        titleRes: [/babaya-mektup|brief-an-den-vater/i],
        desc: "Babaya Mektup; Kafka'nın babasıyla ilişkisini açığa vuran uzun bir itiraftır.",
      },
      {
        title: "Aforizmalar",
        original: "Aphorismen",
        year: 1931,
        pages: 128,
        genres: "Klasik, Felsefe, Deneme",
        existing: true,
        queries: ["Aforizmalar Kafka"],
        titleRes: [/aforizma|aphorism/i],
        prefer: [/kafka/i],
        desc: "Aforizmalar; Kafka'nın kısa, keskin düşünce parçalarını bir araya getirir.",
      },
      {
        title: "Milena'ya Mektuplar",
        original: "Briefe an Milena",
        year: 1952,
        pages: 320,
        genres: "Klasik, Kurgu Dışı, Mektup",
        queries: ["Milena'ya Mektuplar Kafka", "Milena Kafka"],
        titleRes: [/milena/i],
        olTitle: "Letters to Milena",
        olAuthor: "Franz Kafka",
        desc: "Milena'ya Mektuplar; Kafka'nın Milena Jesenská ile yazışmalarını içerir.",
      },
      {
        title: "Günlükler",
        original: "Tagebücher",
        year: 1948,
        pages: 480,
        genres: "Klasik, Kurgu Dışı, Günlük",
        queries: ["Günlükler Kafka", "Kafka Günlükleri"],
        titleRes: [/gunluk|tagebuch|diaries/i],
        prefer: [/kafka/i],
        olTitle: "The Diaries of Franz Kafka",
        olAuthor: "Franz Kafka",
        desc: "Günlükler; Kafka'nın yazma süreci, kaygıları ve gözlemlerini kaydettiği notlardır.",
      },
      {
        title: "Bir Köy Hekimi",
        original: "Ein Landarzt",
        year: 1919,
        pages: 96,
        genres: "Klasik, Kurgu, Öykü",
        queries: ["Bir Köy Hekimi Kafka", "Köy Hekimi Kafka"],
        titleRes: [/koy-hekimi|landarzt|country-doctor/i],
        olTitle: "A Country Doctor",
        olAuthor: "Franz Kafka",
        desc: "Bir Köy Hekimi; rüya mantığıyla örülmüş öykülerden oluşan bir derlemedir.",
      },
      {
        title: "Yargı",
        original: "Das Urteil",
        year: 1913,
        pages: 64,
        genres: "Klasik, Kurgu, Öykü",
        queries: ["Yargı Kafka Franz", "Das Urteil Kafka Türkçe"],
        titleRes: [/yargi|das-urteil|the-judgment/i],
        prefer: [/kafka/i],
        olTitle: "The Judgment",
        olAuthor: "Franz Kafka",
        desc: "Yargı; baba-oğul çatışmasını kısa ve sarsıcı bir öyküde yoğunlaştırır.",
      },
      {
        title: "Çin Seddi'nin İnşası",
        original: "Beim Bau der Chinesischen Mauer",
        year: 1931,
        pages: 128,
        genres: "Klasik, Kurgu, Öykü",
        queries: ["Çin Seddi Kafka", "Çin Seddi'nin İnşası Kafka"],
        titleRes: [/cin-seddi|chinesischen-mauer|great-wall/i],
        olTitle: "The Great Wall of China",
        olAuthor: "Franz Kafka",
        desc: "Çin Seddi'nin İnşası; bürokrasi ve tamamlanamayan büyük işler üzerine alegorik öykülerdir.",
      },
      {
        title: "İn",
        original: "Der Bau",
        year: 1924,
        pages: 80,
        genres: "Klasik, Kurgu, Öykü",
        queries: ["İn Kafka", "Der Bau Kafka Türkçe", "Yuva Kafka Franz"],
        titleRes: [/\/in-|der-bau|the-burrow|yuva-kafka/i],
        olTitle: "The Burrow",
        olAuthor: "Franz Kafka",
        desc: "İn; güvenlik saplantısı içindeki bir yaratığın yeraltı yuvasını anlatır.",
      },
      {
        title: "Kırsalda Düğün Hazırlıkları",
        original: "Hochzeitsvorbereitungen auf dem Lande",
        year: 1953,
        pages: 160,
        genres: "Klasik, Kurgu, Öykü",
        queries: ["Kırsalda Düğün Hazırlıkları Kafka", "Düğün Hazırlıkları Kafka"],
        titleRes: [/dugun-hazirlik|hochzeitsvorbereitungen|wedding-preparations/i],
        olTitle: "Wedding Preparations in the Country",
        olAuthor: "Franz Kafka",
        desc: "Kırsalda Düğün Hazırlıkları; Kafka'nın tamamlanmamış erken dönem metinlerindendir.",
      },
      {
        title: "Şarkıcı Josephine",
        original: "Josefine, die Sängerin",
        year: 1924,
        pages: 64,
        genres: "Klasik, Kurgu, Öykü",
        queries: ["Şarkıcı Josephine Kafka", "Josefine Kafka"],
        titleRes: [/josephine|josefine|sarkici/i],
        olTitle: "Josephine the Singer",
        olAuthor: "Franz Kafka",
        desc: "Şarkıcı Josephine; sanatçı ile toplum ilişkisini fareler halkı üzerinden anlatır.",
      },
      {
        title: "Blümfeld",
        original: "Blumfeld, ein älterer Junggeselle",
        year: 1936,
        pages: 80,
        genres: "Klasik, Kurgu, Öykü",
        queries: ["Blümfeld Kafka", "Blumfeld Kafka"],
        titleRes: [/blumfeld|blumfeld/i],
        olTitle: "Blumfeld",
        olAuthor: "Franz Kafka",
        desc: "Blümfeld; yalnız bir bekârın absürt gündelik hayatını anlatan bir öyküdür.",
      },
      {
        title: "Düşünceler",
        original: "Betrachtung",
        year: 1913,
        pages: 96,
        genres: "Klasik, Kurgu, Öykü",
        queries: ["Düşünceler Kafka", "Betrachtung Kafka Türkçe", "Seyir Kafka"],
        titleRes: [/dusunceler|betrachtung|meditation|seyir/i],
        prefer: [/kafka/i],
        olTitle: "Contemplation",
        olAuthor: "Franz Kafka",
        desc: "Düşünceler (Betrachtung); Kafka'nın ilk basılan kısa düzyazı parçalarıdır.",
      },
    ],
  },
];

(async () => {
  const resolved = [];

  for (const author of AUTHORS) {
    console.log("\n====", author.name);
    for (const book of author.books) {
      if (book.optional && book.skipIfHard) {
        // try once lightly
      }
      const cover = await resolveCover({ ...book, authorRe: author.authorRe });
      if (!cover) {
        if (book.optional) {
          console.log("SKIP optional", book.title);
          continue;
        }
        console.log("MISS", book.title);
        continue;
      }
      console.log(cover.source, book.title, cover.id || "", (cover.title || "").slice(0, 60));
      resolved.push({
        author: author.name,
        lang: author.lang,
        ...book,
        coverUrl: cover.url,
        updateExisting: !!book.existing,
      });
    }
  }

  const lines = [
    "-- Expand Hugo / Tolstoy / Kafka + refresh Turkish covers",
    "-- docker cp oldb-backend/scripts/seed_hugo_tolstoy_kafka_expand.sql my_postgres:/tmp/seed_hugo_tolstoy_kafka_expand.sql",
    "-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_hugo_tolstoy_kafka_expand.sql",
    "",
    "BEGIN;",
    "",
  ];

  for (const b of resolved) {
    if (b.updateExisting) {
      lines.push(
        `-- refresh cover: ${b.author} / ${b.title}`,
        "UPDATE books SET",
        `  cover_url = ${uEscape(b.coverUrl)},`,
        `  original_title = COALESCE(NULLIF(TRIM(original_title), ''), ${uEscape(b.original)}),`,
        `  genres = COALESCE(NULLIF(TRIM(genres), ''), ${uEscape(b.genres)}),`,
        `  language = COALESCE(NULLIF(TRIM(language), ''), '${b.lang}'),`,
        "  updated_at = NOW(),",
        "  updated_by = COALESCE(updated_by, 'seed')",
        "WHERE author_id = (SELECT id FROM authors WHERE lower(trim(name)) = lower(trim(" +
          uEscape(b.author) +
          ")))",
        "  AND lower(trim(title)) = lower(trim(" + uEscape(b.title) + "));",
        ""
      );
    } else {
      lines.push(
        "INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)",
        "SELECT nextval('book_id_seq'),",
        `  ${uEscape(b.title)}, ${uEscape(b.original)}, a.id, ${b.year}, ${b.pages},`,
        `  ${uEscape(b.desc)}, ${uEscape(b.genres)}, '${b.lang}', ${uEscape(b.coverUrl)},`,
        "  false, false, false, false, NOW(), NOW(), 'seed', 'seed'",
        "FROM authors a",
        `WHERE lower(trim(a.name)) = lower(trim(${uEscape(b.author)}))`,
        "  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(" +
          uEscape(b.title) +
          ")));",
        ""
      );
    }
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id",
    "WHERE a.name IN (U&'Victor Hugo', U&'Lev Tolstoy', U&'Franz Kafka')",
    "GROUP BY a.name ORDER BY a.name;"
  );

  const out = path.join(__dirname, "seed_hugo_tolstoy_kafka_expand.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("\nwrote", out, "rows", resolved.length);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
