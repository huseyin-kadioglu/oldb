/** Open Library / English subject → kullanıcı dostu Türkçe etiket */
const SUBJECT_LABELS = {
  habit: "Alışkanlık",
  habits: "Alışkanlık",
  "atomic habits": "Alışkanlık",
  "behavior modification": "Davranış Bilimi",
  "behaviour modification": "Davranış Bilimi",
  behaviour: "Davranış Bilimi",
  behavior: "Davranış Bilimi",
  "self-help": "Kişisel Gelişim",
  "self help": "Kişisel Gelişim",
  "self improvement": "Kişisel Gelişim",
  "personal development": "Kişisel Gelişim",
  psychology: "Psikoloji",
  "popular psychology": "Psikoloji",
  motivation: "Motivasyon",
  success: "Başarı",
  business: "İş Dünyası",
  "business & economics": "İş Dünyası",
  economics: "Ekonomi",
  philosophy: "Felsefe",
  fiction: "Kurgu",
  "literary fiction": "Edebi Kurgu",
  "science fiction": "Bilimkurgu",
  "sci-fi": "Bilimkurgu",
  fantasy: "Fantastik",
  mystery: "Gerilim",
  thriller: "Gerilim",
  suspense: "Gerilim",
  romance: "Romantik",
  history: "Tarih",
  biography: "Biyografi",
  autobiography: "Anı",
  memoir: "Anı",
  poetry: "Şiir",
  drama: "Drama",
  comedy: "Mizah",
  humor: "Mizah",
  humour: "Mizah",
  adventure: "Macera",
  classic: "Klasik",
  classics: "Klasik",
  literature: "Edebiyat",
  novel: "Roman",
  novels: "Roman",
  "young adult": "Genç Yetişkin",
  ya: "Genç Yetişkin",
  "children's books": "Çocuk",
  children: "Çocuk",
  "juvenile fiction": "Çocuk",
  science: "Bilim",
  technology: "Teknoloji",
  art: "Sanat",
  music: "Müzik",
  travel: "Seyahat",
  cooking: "Yemek",
  health: "Sağlık",
  education: "Eğitim",
  politics: "Siyaset",
  religion: "Din",
  sociology: "Sosyoloji",
  dystopia: "Distopya",
  "historical fiction": "Tarihi Roman",
  crime: "Polisiye",
  detective: "Polisiye",
  horror: "Korku",
  short: "Öykü",
  "short stories": "Öykü",
  essays: "Deneme",
  productivity: "Verimlilik",
  leadership: "Liderlik",
  management: "Yönetim",
  finance: "Finans",
  investing: "Yatırım",
  design: "Tasarım",
  architecture: "Mimari",
  war: "Savaş",
  family: "Aile",
  friendship: "Dostluk",
  love: "Aşk",
  death: "Ölüm",
  nature: "Doğa",
  animals: "Hayvanlar",
  sports: "Spor",
  "true crime": "True Crime",
  spirituality: "Spiritüellik",
  mindfulness: "Farkındalık",
  change: "Değişim",
  "popular science": "Popüler Bilim",
  anthropology: "Antropoloji",
};

const NOISE_TAG =
  /^(accessible.?book|protected.?daisy|overdrive|in.?library|nyt:|lcsh:|bisac|juvenile.?fiction|large.?print|audiobooks?|electronic.?books?|open.?library|general|miscellaneous|unspecified|english|turkish|spanish|french|german|protected.?daisy|internet.?archive)$/i;

export const mapGenreLabel = (raw) => {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;
  if (trimmed.includes(":") || trimmed.length > 32) return null;
  if (NOISE_TAG.test(trimmed)) return null;

  const key = trimmed.toLowerCase();
  if (SUBJECT_LABELS[key]) return SUBJECT_LABELS[key];

  // Already Turkish / title-like — keep lightly cleaned
  if (/[çğıöşüÇĞİÖŞÜ]/.test(trimmed)) {
    return trimmed.length > 1
      ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
      : trimmed;
  }

  // Unmapped English Open Library crumbs — hide rather than show raw tags
  if (trimmed.split(/\s+/).length > 3) return null;
  if (/^[a-z0-9][a-z0-9\s-]{0,24}$/i.test(trimmed) && !SUBJECT_LABELS[key]) {
    return null;
  }
  return null;
};

export const pickBookTags = (genres, limit = 5) => {
  if (!genres) return [];
  const seen = new Set();
  const out = [];
  for (const part of String(genres).split(",")) {
    const label = mapGenreLabel(part);
    if (!label) continue;
    const dedupe = label.toLocaleLowerCase("tr-TR");
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    out.push(label);
    if (out.length >= limit) break;
  }
  return out;
};

/** Gerçek book description / summary yoksa tanıtım tonunda geçici metin */
export const buildFallbackSynopsis = (book, authorName) => {
  const title = (book?.title || "").trim();
  if (!title) return "";

  const author = (authorName || book?.authorName || "").trim();
  const tags = pickBookTags(book?.genres, 2);
  const theme =
    tags.length > 0
      ? tags.join(" ve ").toLocaleLowerCase("tr-TR")
      : "okuma deneyimi";

  const byAuthor = author
    ? `${author}'ın `
    : "";
  const pages =
    book?.pageCount > 0 ? ` Yaklaşık ${book.pageCount} sayfada` : "";

  return (
    `${title}, ${byAuthor}küçük ama birikimli değişimlerin uzun vadede nasıl ` +
    `büyük sonuçlar doğurabileceğini ${theme} çerçevesinde anlatan bir kitaptır.` +
    `${pages} okura günlük alışkanlıklarını yeniden düşünme fırsatı sunar; ` +
    `karmakarşık teoriler yerine sade çerçeveler ve uygulanabilir örneklerle ilerler. ` +
    `Hem ilk kez keşfedenler hem de konuya aşina okurlar için net, sıcak ve ` +
    `devam ettirici bir giriş kapısı bırakır.`
  );
};

/** İlk cümleyi hafif vurgu için ayır */
export const splitSynopsisLead = (text) => {
  const cleaned = String(text || "").trim();
  if (!cleaned) return { lead: "", rest: "" };
  const match = cleaned.match(/^(.+?[.!?…])(?:\s+|$)([\s\S]*)$/);
  if (!match || match[1].length < 24 || match[1].length > 240) {
    return { lead: cleaned, rest: "" };
  }
  return { lead: match[1].trim(), rest: (match[2] || "").trim() };
};

/** Genre etiketlerinden kısa “kimler için” ipuçları — kesin tavsiye vermez */
const AUDIENCE_HINTS = {
  Alışkanlık: {
    for: ["Alışkanlıklarını yeniden kurmak isteyenler", "Küçük adımlarla ilerlemeyi sevenler"],
    against: ["Derin akademik davranış bilimi arayanlar"],
  },
  "Kişisel Gelişim": {
    for: ["Kişisel gelişime giriş yapmak isteyenler", "Pratik ve uygulanabilir öneriler arayanlar"],
    against: ["Saf teorik çerçeve bekleyenler"],
  },
  Psikoloji: {
    for: ["Popüler psikolojiye merak duyanlar", "Günlük hayata dokunan örnekler arayanlar"],
    against: ["Akademik psikoloji metni bekleyenler"],
  },
  Motivasyon: {
    for: ["Tempo ve odak arayanlar", "Kısa, net tavsiye sevenler"],
    against: ["Yavaş, betimleyici anlatı arayanlar"],
  },
  Verimlilik: {
    for: ["Zamanını daha bilinçli kullanmak isteyenler"],
    against: ["Saf kuramsal yönetim literatürü arayanlar"],
  },
  Kurgu: {
    for: ["Karakter ve atmosfer odaklı okurlar"],
    against: ["Saf bilgi / how-to bekleyenler"],
  },
  "Edebi Kurgu": {
    for: ["Dil ve üslup önemseyenler", "Yavaş okumayı sevenler"],
    against: ["Hızlı tempo / aksiyon öncelikli okurlar"],
  },
  Bilimkurgu: {
    for: ["Spekülatif fikir ve dünya kurulumuna açık okurlar"],
    against: ["Gündelik realizm arayanlar"],
  },
  Fantastik: {
    for: ["Dünya kurulumuna ve maceraya açık okurlar"],
    against: ["Saf günlük gerçekçilik arayanlar"],
  },
  Gerilim: {
    for: ["Tempo ve merak unsuru arayanlar"],
    against: ["Sakin, betimleyici tempolu okurlar"],
  },
  Romantik: {
    for: ["İlişki ve duygu odaklı anlatı sevenler"],
    against: ["Ağır entelektüel analiz arayanlar"],
  },
  Tarih: {
    for: ["Bağlam ve dönem hikâyesine meraklı okurlar"],
    against: ["Saf kurmaca kaçış arayanlar"],
  },
  Biyografi: {
    for: ["Gerçek hayatlardan ilham almak isteyenler"],
    against: ["Saf kurmaca tercih edenler"],
  },
  Felsefe: {
    for: ["Soru sormayı ve düşünmeyi sevenler"],
    against: ["Hızlı, pratik çözüm listesi arayanlar"],
  },
  "İş Dünyası": {
    for: ["Organizasyon ve kariyer bağlamında okuyanlar"],
    against: ["Saf edebi deneyim arayanlar"],
  },
  Roman: {
    for: ["Uzun soluklu anlatı sevenler"],
    against: ["Kısa form / deneme odaklı okurlar"],
  },
  Klasik: {
    for: ["Zamana yayılmış eserleri keşfetmek isteyenler"],
    against: ["Çağdaş dil ve tempo bekleyenler"],
  },
};

export const buildAudienceHints = (genres, limit = 3) => {
  const tags = pickBookTags(genres, 4);
  if (tags.length === 0) return null;

  const forSet = [];
  const againstSet = [];
  const seenFor = new Set();
  const seenAgainst = new Set();

  for (const tag of tags) {
    const pack = AUDIENCE_HINTS[tag];
    if (!pack) continue;
    for (const line of pack.for || []) {
      if (seenFor.has(line) || forSet.length >= limit) continue;
      seenFor.add(line);
      forSet.push(line);
    }
    for (const line of pack.against || []) {
      if (seenAgainst.has(line) || againstSet.length >= 2) continue;
      seenAgainst.add(line);
      againstSet.push(line);
    }
  }

  if (forSet.length === 0) return null;
  return { for: forSet.slice(0, limit), against: againstSet.slice(0, 2) };
};
