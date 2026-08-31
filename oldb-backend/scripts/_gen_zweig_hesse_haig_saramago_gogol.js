/**
 * Seed: Stefan Zweig, Hermann Hesse, Matt Haig, José Saramago, Nikolay Gogol
 * D&R kapakları + Türkçe açıklamalar
 *
 * node oldb-backend/scripts/_gen_zweig_hesse_haig_saramago_gogol.js
 * docker cp ... && psql -f ...
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; OLDB/1.0)" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location).then(resolve, reject);
        }
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } }, (res) =>
      resolve(res.statusCode)
    );
    req.on("error", () => resolve(0));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(0);
    });
    req.end();
  });
}

function cover(id) {
  return `https://i.dr.com.tr/cache/600x600-0/originals/${id}-1.jpg`;
}

function uEscape(s) {
  let out = "";
  for (const ch of String(s)) {
    const o = ch.codePointAt(0);
    if (ch === "'") out += "''";
    else if (o < 128) out += ch;
    else out += "\\" + o.toString(16).toUpperCase().padStart(4, "0");
  }
  return `U&'${out}'`;
}

function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c");
}

function slugPred(...needles) {
  const n = needles.map((x) => normalize(x));
  return (href) => {
    const h = normalize(href);
    return n.every((x) => h.includes(x));
  };
}

async function findCover(query, pred, altQueries = []) {
  const queries = [query, ...altQueries];
  for (const q of queries) {
    const body = await get(`https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`);
    const links = [...body.matchAll(/href="(\/kitap\/[^"]+urunno=(\d+))"/gi)].map((m) => ({
      href: m[1].toLowerCase(),
      id: m[2],
    }));
    const unique = [...new Map(links.map((l) => [l.id, l])).values()];
    const ranked = unique.sort((a, b) => {
      const score = (h) =>
        (h.includes("-seti") || h.includes("/seti") || h.includes("takim") || h.includes("toplu-") ? 10 : 0) +
        (h.includes("abonelik") ? 20 : 0);
      return score(a.href) - score(b.href);
    });
    const hit = ranked.find((l) => pred(l.href) && !l.href.includes("abonelik") && !l.href.includes("takim"));
    if (!hit) continue;
    const c = cover(hit.id);
    const status = await head(c);
    if (status !== 200) continue;
    console.log("OK", q, hit.id);
    return hit.id;
  }
  console.warn("MISS", query);
  return null;
}

const AUTHORS = [
  {
    name: "Stefan Zweig",
    country: "Avusturya",
    birth_year: 1881,
    death_year: 1942,
    language: "deu",
    nobel: false,
    portrait: "https://ui-avatars.com/api/?name=Stefan+Zweig&background=1a1a1a&color=d4af37&size=256",
    description:
      "Stefan Zweig (1881–1942), Avusturyalı yazar, biyografi ustası ve novella türünün modern klasiklerinden biridir. " +
      "Viyana'nın kültürel zenginliğinde yetişmiş; psikolojik derinlik, tutku ve Avrupa hümanizmini ince bir üslupla işlemiştir. " +
      "Satranç, Bilinmeyen Bir Kadının Mektubu ve İnsanlığın Yıldızının Parladığı Anlar gibi eserleriyle dünya çapında okunur. " +
      "II. Dünya Savaşı'nın karanlığında sürgünde yaşamış; Avrupa'nın çöküşüne dair melankolik bir tanıklık bırakmıştır.",
    books: [
      {
        title: "Satranç",
        original: "Schachnovelle",
        year: 1942,
        pages: 96,
        genres: "Klasik, Kurgu, Psikolojik",
        q: "stefan zweig satranç",
        pred: slugPred("satranç", "zweig"),
        desc:
          "Satranç; bir yolcu gemisinde geçen, zihin ve iktidar üzerine gerilimli bir novelladır. " +
          "Gestapo hücrelerinde satrançla hayatta kalan Dr. B'nin öyküsü, Zweig'ın sürgün yıllarının en keskin psikolojik anlatılarından biridir. " +
          "Oyunun soğuk mantığı ile insanın kırılganlığı karşı karşıya gelir.",
      },
      {
        title: "Bilinmeyen Bir Kadının Mektubu",
        original: "Brief einer Unbekannten",
        year: 1922,
        pages: 80,
        genres: "Klasik, Kurgu, Romantik",
        q: "stefan zweig bilinmeyen bir kadının mektubu",
        pred: slugPred("bilinmeyen", "zweig"),
        desc:
          "Bilinmeyen Bir Kadının Mektubu; bir yazarın aldığın mektupta, kendini hiç hatırlamadığı bir kadının ömür boyu süren aşkını okur. " +
          "Zweig, tek taraflı tutkuyu ve görünmezliği, kısa ama yıkıcı bir itirafla anlatır.",
      },
      {
        title: "Amok Koşucusu",
        original: "Der Amokläufer",
        year: 1922,
        pages: 96,
        genres: "Klasik, Kurgu, Psikolojik",
        q: "stefan zweig amok",
        pred: slugPred("amok", "zweig"),
        desc:
          "Amok Koşucusu; sömürge Doğu'sunda geçen, tutku ve utancın bir adamı uçuruma sürüklediği yoğun bir novelladır. " +
          "Zweig'ın 'amok' metaforuyla kontrolsüz arzuyu ve ahlaki çöküşü işlediği klasiklerinden biridir.",
      },
      {
        title: "Bir Kadının Yaşamından Yirmi Dört Saat",
        original: "Vierundzwanzig Stunden aus dem Leben einer Frau",
        year: 1927,
        pages: 112,
        genres: "Klasik, Kurgu, Psikolojik",
        q: "stefan zweig bir kadının yaşamından",
        pred: slugPred("kad", "zweig"),
        desc:
          "Bir Kadının Yaşamından Yirmi Dört Saat; bir kumarhanede başlayan rastlantısal karşılaşmanın, bir kadının hayatını nasıl altüst ettiğini anlatır. " +
          "Zweig, kısa bir zaman diliminde tutku, şefkat ve pişmanlığı ustalıkla yoğurur.",
      },
      {
        title: "Korku",
        original: "Angst",
        year: 1920,
        pages: 96,
        genres: "Klasik, Kurgu, Gerilim",
        q: "stefan zweig korku",
        pred: slugPred("korku", "zweig"),
        desc:
          "Korku; evlilik dışı bir ilişkinin ardından gelen şantaj ve panik duygusunu işler. " +
          "Zweig, burjuva ahlakının baskısı altında bir kadının iç dünyasını gerilim romanı temposunda anlatır.",
      },
      {
        title: "Yakıcı Sır",
        original: "Brennendes Geheimnis",
        year: 1911,
        pages: 128,
        genres: "Klasik, Kurgu, Psikolojik",
        q: "stefan zweig yakıcı sır",
        pred: slugPred("yakici", "zweig"),
        desc:
          "Yakıcı Sır; bir tatil beldesinde geçen, ergenlik eşiğindeki bir çocuğun yetişkin dünyasının oyunlarını fark edişini anlatır. " +
          "Masumiyetin kırılışı ve kıskançlık, Zweig'ın erken döneminin en güçlü temalarındandır.",
      },
      {
        title: "İnsanlığın Yıldızının Parladığı Anlar",
        original: "Sternstunden der Menschheit",
        year: 1927,
        pages: 288,
        genres: "Klasik, Tarih, Deneme",
        q: "stefan zweig insanlığın yıldızının",
        pred: slugPred("yildiz", "zweig"),
        desc:
          "İnsanlığın Yıldızının Parladığı Anlar; tarihin akışını değiştiren kritik anları edebi bir dille canlandırır. " +
          "Zweig, biyografi ile dramı birleştirerek Avrupa tarihinin 'yıldız anlarını' okura yaklaştırır.",
      },
      {
        title: "Macellan",
        original: "Magellan. Der Mann und seine Tat",
        year: 1938,
        pages: 320,
        genres: "Klasik, Biyografi, Tarih",
        q: "stefan zweig macellan",
        alt: ["zweig macellan bir insan"],
        pred: slugPred("macellan"),
        desc:
          "Macellan; dünyayı dolaşan kâşifin hırsını, yalnızlığını ve çağının sınırlarını aşma çabasını anlatan bir Zweig biyografisidir. " +
          "Keşif çağının epik gerilimini, insanın iradesiyle birleştirir.",
      },
      {
        title: "Olağanüstü Bir Gece",
        original: "Eine außergewöhnliche Nacht / Phantastische Nacht",
        year: 1922,
        pages: 96,
        genres: "Klasik, Kurgu, Psikolojik",
        urunno: "0001799302001",
        q: "stefan zweig olağanüstü bir gece",
        pred: slugPred("olaganustu", "zweig"),
        desc:
          "Olağanüstü Bir Gece; burjuva bir adamın bir gecede vicdanıyla yüzleşmesini anlatır. " +
          "Zweig'ın kısa ama yoğun ahlaki uyanış novellalarındandır.",
      },
      {
        title: "Dünün Dünyası",
        original: "Die Welt von Gestern",
        year: 1942,
        pages: 480,
        genres: "Klasik, Anı, Tarih",
        urunno: "0001794713001",
        q: "stefan zweig dünün dünyası bir avrupalının",
        pred: (h) => normalize(h).includes("dunun-dunyasi") && normalize(h).includes("avrupali"),
        desc:
          "Dünün Dünyası; Zweig'ın anılarıdır. Kaybolan Avrupa'yı, Viyana'yı, savaşları ve sürgünü birinci ağızdan anlatır. " +
          "Yirminci yüzyılın kültürel yıkımına dair en dokunaklı tanıklıklardan biridir.",
      },
    ],
  },
  {
    name: "Hermann Hesse",
    country: "Almanya",
    birth_year: 1877,
    death_year: 1962,
    language: "deu",
    nobel: true,
    portrait: "https://ui-avatars.com/api/?name=Hermann+Hesse&background=1a1a1a&color=d4af37&size=256",
    description:
      "Hermann Hesse (1877–1962), Alman asıllı İsviçreli yazar ve şairdir. " +
      "Bireyin ruhsal yolculuğunu, Doğu bilgisini ve Batı modernitesinin bunalımını bir arada işlemiştir. " +
      "Siddhartha, Bozkırkurdu ve Boncuk Oyunu başyapıtları arasındadır. " +
      "1946'da Nobel Edebiyat Ödülü'nü almış; 1960'ların karşı kültür hareketinde yeniden keşfedilmiştir.",
    books: [
      {
        title: "Siddhartha",
        original: "Siddhartha",
        year: 1922,
        pages: 160,
        genres: "Klasik, Kurgu, Felsefe",
        q: "hermann hesse siddhartha",
        pred: slugPred("siddhartha", "hesse"),
        desc:
          "Siddhartha; bir Brahman gencinin aydınlanma arayışını nehir, aşk ve dünya deneyimi üzerinden anlatır. " +
          "Hesse'nin Doğu bilgelik gelenekleriyle kurduğu en bilinen ve en sade romanıdır.",
      },
      {
        title: "Bozkırkurdu",
        original: "Der Steppenwolf",
        year: 1927,
        pages: 256,
        genres: "Klasik, Kurgu, Psikolojik",
        q: "hermann hesse bozkırkurdu",
        pred: slugPred("bozkir", "hesse"),
        desc:
          "Bozkırkurdu; Harry Haller'in içindeki 'insan' ile 'kurt' arasındaki bölünmeyi anlatır. " +
          "Modern yalnızlık, sanat ve burjuva düzenine karşı isyan, Hesse'nin en karanlık ve etkili romanlarından biridir.",
      },
      {
        title: "Demian",
        original: "Demian",
        year: 1919,
        pages: 176,
        genres: "Klasik, Kurgu, Felsefe",
        urunno: "0000000138954",
        q: "hermann hesse demian",
        pred: slugPred("demian"),
        desc:
          "Demian; Emil Sinclair'in ergenlikten yetişkinliğe geçişini, iyi ile kötünün ötesinde bir benlik arayışı olarak anlatır. " +
          "Hesse'nin Jung etkisindeki en önemli bildungsromanıdır.",
      },
      {
        title: "Narziss ve Goldmund",
        original: "Narziss und Goldmund",
        year: 1930,
        pages: 320,
        genres: "Klasik, Kurgu, Felsefe",
        q: "hermann hesse narziss",
        pred: slugPred("narziss", "hesse"),
        desc:
          "Narziss ve Goldmund; manastırdaki düşünsel yaşam ile sanatçının duyusal yolculuğunu iki dost üzerinden karşılaştırır. " +
          "Ruh ile beden, düzen ile özgürlük arasındaki gerilim Hesse'nin olgun döneminin özüdür.",
      },
      {
        title: "Boncuk Oyunu",
        original: "Das Glasperlenspiel",
        year: 1943,
        pages: 560,
        genres: "Klasik, Kurgu, Felsefe",
        q: "hermann hesse boncuk oyunu",
        pred: slugPred("boncuk", "hesse"),
        desc:
          "Boncuk Oyunu; gelecekteki bir entelektüel cumhuriyette geçen, bilgi, sanat ve maneviyat üzerine ütopik bir romandır. " +
          "Hesse'nin Nobel'e giden yolundaki başyapıtı kabul edilir.",
      },
      {
        title: "Çarklar Arasında",
        original: "Unterm Rad",
        year: 1906,
        pages: 224,
        genres: "Klasik, Kurgu, Drama",
        q: "hermann hesse çarklar arasında",
        pred: slugPred("carklar", "hesse"),
        desc:
          "Çarklar Arasında; eğitim sisteminin baskısı altında ezilen bir gencin trajedisini anlatır. " +
          "Hesse'nin kendi okul deneyiminden izler taşıyan erken ve sarsıcı bir romandır.",
      },
      {
        title: "Knulp",
        original: "Knulp",
        year: 1915,
        pages: 128,
        genres: "Klasik, Kurgu, Öykü",
        q: "hermann hesse knulp",
        pred: slugPred("knulp", "hesse"),
        desc:
          "Knulp; özgürlüğün peşinde dolaşan bir gezginin üç öyküsüdür. " +
          "Hesse, yerleşik düzene sığmayan bir ruhun hüzünlü şiirini yazar.",
      },
      {
        title: "Doğu Yolculuğu",
        original: "Die Morgenlandfahrt",
        year: 1932,
        pages: 112,
        genres: "Klasik, Kurgu, Felsefe",
        q: "hermann hesse doğu yolculuğu",
        pred: slugPred("dogu", "hesse"),
        desc:
          "Doğu Yolculuğu; gizli bir birliğin manevi yolculuğunu alegorik bir dille anlatır. " +
          "Hesse'nin inanç, sadakat ve hatırlama üzerine kısa ama yoğun eserlerindendir.",
      },
      {
        title: "Rosshalde",
        original: "Roßhalde",
        year: 1914,
        pages: 208,
        genres: "Klasik, Kurgu, Drama",
        urunno: "0000000137393",
        q: "hermann hesse rosshalde",
        pred: (h) => normalize(h).includes("rosshalde") || normalize(h).includes("roshalde"),
        desc:
          "Rosshalde; bir ressamın evlilik krizi ve sanatçı yalnızlığını anlatır. " +
          "Hesse'nin aile ve yaratıcılık üzerine olgun erken dönem romanlarından biridir.",
      },
    ],
  },
  {
    name: "Matt Haig",
    country: "İngiltere",
    birth_year: 1975,
    death_year: null,
    language: "eng",
    nobel: false,
    portrait: "https://ui-avatars.com/api/?name=Matt+Haig&background=1a1a1a&color=d4af37&size=256",
    description:
      "Matt Haig (1975–), İngiliz romancı ve deneme yazarıdır. " +
      "Ruh sağlığı, zaman, yalnızlık ve 'insan olmak' üzerine hem kurmaca hem kurmaca dışı eserler verir. " +
      "Gece Yarısı Kütüphanesi ile dünya çapında çok satanlar arasına girmiş; " +
      "Reasons to Stay Alive ile kendi depresyon deneyimini samimi bir dille paylaşmıştır. " +
      "Üslubu sıcak, erişilebilir ve umut odaklıdır.",
    books: [
      {
        title: "Gece Yarısı Kütüphanesi",
        original: "The Midnight Library",
        year: 2020,
        pages: 304,
        genres: "Kurgu, Fantastik, Çağdaş",
        urunno: "0001922926001",
        q: "matt haig gece yarısı kütüphanesi",
        pred: slugPred("gece-yarisi-kutuphanesi"),
        desc:
          "Gece Yarısı Kütüphanesi; Nora Seed'in yaşam ile ölüm arasında bir kütüphanede, yaşamadığı hayatları denemesini anlatır. " +
          "Pişmanlık, seçimler ve 'ya şöyle olsaydı' sorusu üzerine umut dolu, çağdaş bir romandır.",
      },
      {
        title: "İnsanlar",
        original: "The Humans",
        year: 2013,
        pages: 304,
        genres: "Kurgu, Bilim Kurgu, Mizah",
        q: "matt haig insanlar",
        pred: slugPred("insanlar", "haig"),
        desc:
          "İnsanlar; bir uzaylının Cambridge'li bir matematikçi kılığına girip insanlığı anlamaya çalışmasını anlatır. " +
          "Haig, sevgi, gülme ve sıradanlığın değerini mizahla hatırlatır.",
      },
      {
        title: "Zamanı Durdurmanın Yolları",
        original: "How to Stop Time",
        year: 2017,
        pages: 336,
        genres: "Kurgu, Fantastik, Tarih",
        urunno: "0001782557001",
        q: "matt haig zamanı durdurmanın yolları",
        pred: slugPred("zamani-durdurmanin"),
        desc:
          "Zamanı Durdurmanın Yolları; yüzlerce yıl yaşayan Tom Hazard'ın aşk, kayıp ve tarihle ilişkisini anlatır. " +
          "Zamanın ağırlığı ile anın kıymeti üzerine dokunaklı bir romandır.",
      },
      {
        title: "Yaşama Tutunmak İçin Nedenler",
        original: "Reasons to Stay Alive",
        year: 2015,
        pages: 272,
        genres: "Kurgu Dışı, Anı, Psikoloji",
        urunno: "0002036654001",
        q: "matt haig yaşama tutunmak",
        pred: slugPred("yasama-tutunmak"),
        desc:
          "Yaşama Tutunmak İçin Nedenler; Haig'in kendi depresyon ve kaygı deneyimini anlattığı samimi bir kitaptır. " +
          "Utanç olmadan, okura 'yalnız değilsin' diyen çağdaş bir ruh sağlığı klasiğidir.",
      },
      {
        title: "Nevrotik Bir Gezegenden Notlar",
        original: "Notes on a Nervous Planet",
        year: 2018,
        pages: 288,
        genres: "Kurgu Dışı, Deneme, Psikoloji",
        urunno: "0001852346001",
        q: "matt haig nevrotik bir gezegen",
        pred: slugPred("nevrotik"),
        desc:
          "Nevrotik Bir Gezegenden Notlar; dijital çağın kaygı, hız ve aşırı uyarılma sorununu ele alır. " +
          "Haig, modern hayatın sinir sistemimizi nasıl zorladığını anlaşılır önerilerle anlatır.",
      },
      {
        title: "Rahatlama Kitabı",
        original: "The Comfort Book",
        year: 2021,
        pages: 272,
        genres: "Kurgu Dışı, Deneme, Psikoloji",
        urunno: "0001989342001",
        q: "matt haig rahatlama kitabı",
        pred: slugPred("rahatlama-kitabi"),
        desc:
          "Rahatlama Kitabı; zor günler için kısa notlar, alıntılar ve hatırlatmalardan oluşan bir teselli derlemesidir. " +
          "Haig'in şefkatli sesi, küçük umut parçalarını bir araya getirir.",
      },
      {
        title: "Hayat İmkânsız",
        original: "The Life Impossible",
        year: 2024,
        pages: 336,
        genres: "Kurgu, Fantastik, Çağdaş",
        urunno: "0002133814001",
        q: "matt haig hayat imkânsız",
        pred: slugPred("hayat-imkansiz"),
        desc:
          "Hayat İmkânsız; bir dulun İbiza'da miras kalan bir evle başlayan, sıradanlığı aşan bir yolculuğunu anlatır. " +
          "Haig'in doğa, yas ve yeniden başlama üzerine yeni dönem romanıdır.",
      },
      {
        title: "Radley Ailesi",
        original: "The Radleys",
        year: 2010,
        pages: 352,
        genres: "Kurgu, Fantastik, Gerilim",
        urunno: "0002191598001",
        q: "matt haig radley ailesi",
        pred: slugPred("radley"),
        desc:
          "Radley Ailesi; sıradan görünen bir ailenin karanlık sırrını vampir alegorisiyle anlatır. " +
          "Haig'in erken döneminin eğlenceli ve keskin bir romanıdır.",
      },
    ],
  },
  {
    name: "José Saramago",
    country: "Portekiz",
    birth_year: 1922,
    death_year: 2010,
    language: "por",
    nobel: true,
    portrait: "https://ui-avatars.com/api/?name=Jose+Saramago&background=1a1a1a&color=d4af37&size=256",
    description:
      "José Saramago (1922–2010), Portekizli romancı ve 1998 Nobel Edebiyat Ödülü sahibidir. " +
      "Uzun cümleleri, alegorik kurguları ve keskin toplumsal eleştirisiyle tanınır. " +
      "Körlük, Görmek ve İsa'ya Göre İncil gibi eserlerinde iktidar, ahlak ve insanlık durumunu sorgular. " +
      "Dilindeki müzikalite ve mizah, karanlık temaları bile okunabilir kılar.",
    books: [
      {
        title: "Körlük",
        original: "Ensaio sobre a Cegueira",
        year: 1995,
        pages: 352,
        genres: "Klasik, Kurgu, Distopya",
        q: "saramago körlük",
        pred: slugPred("korluk", "saramago"),
        desc:
          "Körlük; bir kentte salgın gibi yayılan beyaz körlük üzerinden toplumun çöküşünü anlatır. " +
          "Saramago'nun en bilinen romanı; ahlak, iktidar ve dayanışmayı alegorik bir distopyada sınar.",
      },
      {
        title: "Görmek",
        original: "Ensaio sobre a Lucidez",
        year: 2004,
        pages: 320,
        genres: "Klasik, Kurgu, Politik",
        q: "saramago görmek",
        pred: slugPred("gormek", "saramago"),
        desc:
          "Görmek; Körlük'ün devamı niteliğindedir. Boş oy pusulalarıyla başlayan bir siyasi krizi anlatır. " +
          "Demokrasi, manipülasyon ve halk iradesi üzerine keskin bir alegoridir.",
      },
      {
        title: "İsa'ya Göre İncil",
        original: "O Evangelho Segundo Jesus Cristo",
        year: 1991,
        pages: 400,
        genres: "Klasik, Kurgu, Din",
        q: "saramago isa'ya göre",
        pred: (h) => h.includes("saramago") && (h.includes("incil") || h.includes("evangelho") || h.includes("isa")),
        desc:
          "İsa'ya Göre İncil; kutsal anlatıyı insanî, bedensel ve siyasal bir düzlemde yeniden yazar. " +
          "Saramago'nun en tartışmalı ve cesur romanlarından biridir.",
      },
      {
        title: "Baltasar ile Blimunda",
        original: "Memorial do Convento",
        year: 1982,
        pages: 368,
        genres: "Klasik, Kurgu, Tarih",
        q: "saramago baltasar",
        pred: slugPred("baltasar", "saramago"),
        desc:
          "Baltasar ile Blimunda; 18. yüzyıl Portekiz'inde geçen, aşk ile hayal gücünün Engizisyon baskısına karşı direnişini anlatır. " +
          "Saramago'nun uluslararası ününü pekiştiren erken başyapıtlarındandır.",
      },
      {
        title: "Ricardo Reis'in Öldüğü Yıl",
        original: "O Ano da Morte de Ricardo Reis",
        year: 1984,
        pages: 400,
        genres: "Klasik, Kurgu, Tarih",
        urunno: "0001719992002",
        q: "saramago ricardo reis",
        pred: slugPred("ricardo-reisin"),
        desc:
          "Ricardo Reis'in Öldüğü Yıl; Pessoa'nın heteronimlerinden birinin Lizbon'a dönüşünü, Salazar dönemiyle iç içe anlatır. " +
          "Kimlik, ölüm ve siyaset üzerine labirentimsi bir romandır.",
      },
      {
        title: "Filin Yolculuğu",
        original: "A Viagem do Elefante",
        year: 2008,
        pages: 224,
        genres: "Klasik, Kurgu, Tarih",
        q: "saramago filin yolculuğu",
        pred: slugPred("filin", "saramago"),
        desc:
          "Filin Yolculuğu; 16. yüzyılda bir filin Portekiz'den Avusturya'ya gidişini mizah ve şefkatle anlatır. " +
          "Saramago'nun geç döneminin hafif ama zeki bir anlatısıdır.",
      },
      {
        title: "Kabil",
        original: "Caim",
        year: 2009,
        pages: 176,
        genres: "Klasik, Kurgu, Din",
        q: "saramago kabil",
        pred: slugPred("kabil", "saramago"),
        desc:
          "Kabil; Eski Ahit anlatılarını Kabil'in bakışından yeniden okur. " +
          "Saramago'nun Tanrı, adalet ve şiddet üzerine son döneminin kışkırtıcı bir romanıdır.",
      },
      {
        title: "Ölüm Bir Varmış Bir Yokmuş",
        original: "As Intermitências da Morte",
        year: 2005,
        pages: 240,
        genres: "Klasik, Kurgu, Fantastik",
        q: "saramago ölüm bir varmış",
        pred: (h) => h.includes("saramago") && (h.includes("olum") || h.includes("intermit")),
        desc:
          "Ölüm Bir Varmış Bir Yokmuş; bir ülkede ölümün birden durmasıyla başlayan kaos ve aşkı anlatır. " +
          "Saramago, ölümü kişileştirerek bürokrasi ile duygunun çatışmasını işler.",
      },
      {
        title: "Mağara",
        original: "A Caverna",
        year: 2000,
        pages: 320,
        genres: "Klasik, Kurgu, Distopya",
        q: "saramago mağara",
        pred: slugPred("magara", "saramago"),
        desc:
          "Mağara; dev bir alışveriş merkezinin gölgesinde kaybolan zanaatkâr yaşamını anlatır. " +
          "Platon'un mağara alegorisine çağdaş bir göndermeyle tüketim toplumunu eleştirir.",
      },
    ],
  },
  {
    name: "Nikolay Gogol",
    country: "Rusya",
    birth_year: 1809,
    death_year: 1852,
    language: "rus",
    nobel: false,
    portrait: "https://ui-avatars.com/api/?name=Nikolay+Gogol&background=1a1a1a&color=d4af37&size=256",
    description:
      "Nikolay Vasilyeviç Gogol (1809–1852), Rus edebiyatının kurucu ustalarındandır. " +
      "Gerçekçilik ile groteski, mizah ile dehşeti birleştirerek bürokrasi ve taşra yaşamını hicvetmiştir. " +
      "Ölü Canlar, Palto ve Müfettiş gibi eserleri Dostoyevski'den Kafka'ya uzanan bir etki bırakmıştır. " +
      "Ukrayna kökenli oluşu ve Petersburg öyküleri, modern kısa öykünün de öncülerindendir.",
    books: [
      {
        title: "Ölü Canlar",
        original: "Мёртвые души",
        year: 1842,
        pages: 400,
        genres: "Klasik, Kurgu, Hiciv",
        urunno: "0002108167001",
        q: "gogol ölü canlar",
        pred: slugPred("olu-canlar"),
        desc:
          "Ölü Canlar; Çiçikov'un ölü serflerin 'canlarını' satın alma planı üzerinden Rus taşrasını hicveder. " +
          "Gogol'un başyapıtı; açgözlülük, riyakârlık ve toplumsal çürümeyi epik bir yolculukta anlatır.",
      },
      {
        title: "Palto",
        original: "Шинель",
        year: 1842,
        pages: 80,
        genres: "Klasik, Kurgu, Öykü",
        q: "gogol palto",
        pred: slugPred("palto", "gogol"),
        desc:
          "Palto; yoksul bir memurun yeni paltosu uğruna verdiği mücadeleyi ve kaybın ardından gelen trajediyi anlatır. " +
          "'Hepimiz Gogol'un Paltosu'ndan çıktık' sözünün kaynağı olan modern öykü klasiğidir.",
      },
      {
        title: "Müfettiş",
        original: "Ревизор",
        year: 1836,
        pages: 160,
        genres: "Klasik, Drama, Hiciv",
        q: "gogol müfettiş",
        pred: slugPred("mufettis", "gogol"),
        desc:
          "Müfettiş; bir taşra kasabasının sahte bir denetçiyi ağırlamasını anlatan komedi-hicivdir. " +
          "Gogol, rüşvet ve korkuyu sahne üzerinde teşhir eder.",
      },
      {
        title: "Burun",
        original: "Нос",
        year: 1836,
        pages: 64,
        genres: "Klasik, Kurgu, Fantastik",
        q: "gogol burun",
        pred: slugPred("burun", "gogol"),
        desc:
          "Burun; bir sabah burnunu kaybeden bir memurun absürt peşini anlatır. " +
          "Gogol'un Petersburg groteskinin en ünlü örneklerinden biridir.",
      },
      {
        title: "Delinin Hatıra Defteri",
        original: "Записки сумасшедшего",
        year: 1835,
        pages: 80,
        genres: "Klasik, Kurgu, Psikolojik",
        q: "gogol delinin hatıra",
        pred: slugPred("delinin", "gogol"),
        desc:
          "Delinin Hatıra Defteri; bir memurun günce yoluyla giderek deliliğe sürüklenişini anlatır. " +
          "Gogol, bürokratik aşağılanmayı iç monologla birleştirir.",
      },
      {
        title: "Taras Bulba",
        original: "Тарас Бульба",
        year: 1835,
        pages: 192,
        genres: "Klasik, Kurgu, Tarih",
        q: "gogol taras bulba",
        pred: slugPred("taras", "gogol"),
        desc:
          "Taras Bulba; Kazak savaşçılığını, baba-oğul bağını ve tarihî çatışmayı epik bir anlatıyla işler. " +
          "Gogol'un Ukrayna temalı en bilinen uzun öyküsüdür.",
      },
      {
        title: "Petersburg Öyküleri",
        original: "Петербургские повести",
        year: 1842,
        pages: 288,
        genres: "Klasik, Kurgu, Öykü",
        urunno: "0002231871001",
        q: "gogol petersburg öyküleri",
        pred: (h) => normalize(h).includes("petersburg") || normalize(h).includes("peterburg"),
        desc:
          "Petersburg Öyküleri; Palto, Burun ve Nevski Bulvarı gibi metinleri bir araya getirir. " +
          "Gogol'un başkentteki absürt, karanlık ve mizahi dünyasının özüdür.",
      },
      {
        title: "Mirgorod Öyküleri",
        original: "Миргород",
        year: 1835,
        pages: 256,
        genres: "Klasik, Kurgu, Öykü",
        urunno: "0000000576988",
        q: "gogol mirgorod",
        pred: slugPred("mirgorod"),
        desc:
          "Mirgorod Öyküleri; Taras Bulba ve Eski Zaman Toprak Sahipleri gibi metinleri içeren Ukrayna taşrası derlemesidir. " +
          "Gogol'un halk masalı ile hicvi birleştirdiği erken döneminin önemli kitabıdır.",
      },
    ],
  },
];

(async () => {
  for (const author of AUTHORS) {
    for (const book of author.books) {
      if (book.urunno) {
        book.coverUrl = cover(book.urunno);
        console.log("FIXED", author.name, book.title, book.urunno);
        continue;
      }
      const id = await findCover(book.q, book.pred, book.alt || []);
      if (!id) throw new Error("Cover not found: " + author.name + " / " + book.title);
      book.urunno = id;
      book.coverUrl = cover(id);
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  const lines = [
    "-- Batch seed: Zweig, Hesse, Matt Haig, Saramago, Gogol (D&R covers, TR blurbs)",
    "-- docker cp oldb-backend/scripts/seed_zweig_hesse_haig_saramago_gogol.sql my_postgres:/tmp/seed_batch2.sql",
    "-- docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_batch2.sql",
    "",
    "BEGIN;",
    "",
  ];

  for (const author of AUTHORS) {
    const death = author.death_year == null ? "NULL" : String(author.death_year);
    lines.push(
      `-- ${author.name}`,
      "INSERT INTO authors (name, country, birth_year, death_year, portrait, description)",
      "SELECT",
      `  ${uEscape(author.name)}, ${uEscape(author.country)}, ${author.birth_year}, ${death},`,
      `  ${uEscape(author.portrait)}, ${uEscape(author.description)}`,
      `WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim(${uEscape(author.name)})));`,
      "",
      "UPDATE authors SET",
      `  country = ${uEscape(author.country)}, birth_year = ${author.birth_year}, death_year = ${death},`,
      `  portrait = COALESCE(NULLIF(TRIM(portrait), ''), ${uEscape(author.portrait)}),`,
      `  description = ${uEscape(author.description)}`,
      `WHERE lower(trim(name)) = lower(trim(${uEscape(author.name)}));`,
      ""
    );

    for (const book of author.books) {
      const nobel = author.nobel ? "true" : "false";
      lines.push(
        "INSERT INTO books (id, title, original_title, author_id, publication_year, page_count, description, genres, language, cover_url, is_won_nobel_prize, editor_choice, weekly_pick, new_release, created_at, updated_at, created_by, updated_by)",
        "SELECT nextval('book_id_seq'),",
        `  ${uEscape(book.title)}, ${uEscape(book.original)}, a.id, ${book.year}, ${book.pages},`,
        `  ${uEscape(book.desc)}, ${uEscape(book.genres)}, '${author.language}', ${uEscape(book.coverUrl || cover(book.urunno))},`,
        `  ${nobel}, false, false, false, NOW(), NOW(), 'seed', 'seed'`,
        "FROM authors a",
        `WHERE lower(trim(a.name)) = lower(trim(${uEscape(author.name)}))`,
        "  AND NOT EXISTS (SELECT 1 FROM books bx WHERE bx.author_id = a.id AND lower(trim(bx.title)) = lower(trim(" +
          uEscape(book.title) +
          ")));",
        ""
      );
    }
  }

  lines.push(
    "COMMIT;",
    "",
    "SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id = a.id",
    "WHERE a.name IN (" + AUTHORS.map((a) => uEscape(a.name)).join(", ") + ")",
    "GROUP BY a.id, a.name ORDER BY a.id;"
  );

  const out = path.join(__dirname, "seed_zweig_hesse_haig_saramago_gogol.sql");
  fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log("wrote", out);
  AUTHORS.forEach((a) => console.log(a.name, a.books.length, "nobel=", a.nobel));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
