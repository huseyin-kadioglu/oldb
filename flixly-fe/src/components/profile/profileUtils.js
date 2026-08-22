/** Profil yardımcıları — aktivite gruplama, göreli zaman, okuma kimliği */

export const PROFILE_TABS = [
  { id: "overview", label: "Genel Bakış" },
  { id: "books", label: "Kitaplar" },
  { id: "reviews", label: "İncelemeler" },
  { id: "lists", label: "Listeler" },
  { id: "activity", label: "Aktiviteler" },
  { id: "badges", label: "Rozetler" },
];

export const isValidProfileTab = (tab) => PROFILE_TABS.some((t) => t.id === tab);

export const relativeTime = (raw) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "şimdi";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 gün önce";
  if (days < 30) return `${days} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

export const formatStars = (rating) => {
  const n = Number(rating) || 0;
  if (n <= 0) return "";
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
};

/** Aktivite türü etiketi / sınıfı */
export const resolveActivityKind = (item) => {
  if (item?.comment) return "review";
  if (item?.rating > 0 && (item.status === "READ" || item.status === "COMPLETED")) return "rated";
  switch (item?.status) {
    case "READ":
    case "COMPLETED":
      return "read";
    case "LIKE":
      return "liked";
    case "FAVOURITE":
      return "favourite";
    case "READLIST":
      return item?.currentPage > 0 ? "progress" : "started";
    case "LIBRARY":
      return "library";
    case "SHOPPING":
      return "shopping";
    case "DROPPED":
      return "dropped";
    default:
      return "other";
  }
};

export const activityKindLabel = (kind) => {
  switch (kind) {
    case "read":
      return "Okudu";
    case "liked":
      return "Beğendi";
    case "favourite":
      return "Favoriye ekledi";
    case "rated":
      return "Puan verdi";
    case "review":
      return "İnceleme yazdı";
    case "started":
      return "Okuyacaklarına ekledi";
    case "progress":
      return "Okuyor";
    case "library":
      return "Kütüphaneye ekledi";
    case "shopping":
      return "Alınacaklara ekledi";
    case "dropped":
      return "Bıraktı";
    default:
      return "Aktivite";
  }
};

const activityTime = (a) => {
  const raw = a?.updateDate || a?.readDate;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
};

/**
 * Aynı kitap için kısa süre içindeki ilişkili aktiviteleri tek karta gruplar.
 */
export const groupProfileActivities = (items, windowMs = 36 * 3600 * 1000) => {
  const list = Array.isArray(items) ? [...items] : [];
  list.sort((a, b) => activityTime(b) - activityTime(a));

  const groups = [];
  for (const item of list) {
    const bookId = item.bookId;
    const t = activityTime(item);
    const last = groups[groups.length - 1];
    if (
      last &&
      last.bookId === bookId &&
      Math.abs(last.latestTime - t) <= windowMs
    ) {
      last.items.push(item);
      last.latestTime = Math.max(last.latestTime, t);
      if (activityTime(item) >= activityTime(last.primary)) {
        last.primary = item;
      }
    } else {
      groups.push({
        key: `${bookId}-${t}-${groups.length}`,
        bookId,
        items: [item],
        primary: item,
        latestTime: t,
      });
    }
  }
  return groups;
};

/** Okuma kimliği — yeterli veri yoksa ready:false */
export const buildReadingIdentity = (profile) => {
  if (!profile) return { ready: false };

  const genres = profile.genrePreferences || [];
  const topGenre = genres[0]?.genre || null;
  const secondGenre = genres[1]?.genre || null;
  const yearBooks = profile.bookReadThisYear ?? 0;
  const avg = profile.averageRating;
  const mostFreq = profile.mostFrequentRating;

  const authorCounts = {};
  (profile.recentActivity || []).forEach((a) => {
    if (!a.authorName) return;
    if (!["READ", "COMPLETED", "LIKE", "FAVOURITE"].includes(a.status) && !(a.rating > 0)) {
      return;
    }
    authorCounts[a.authorName] = (authorCounts[a.authorName] || 0) + 1;
  });
  const topAuthorEntry = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0];
  const topAuthor = topAuthorEntry?.[0] || null;

  const signals = [
    topGenre,
    topAuthor,
    avg != null && avg > 0,
    yearBooks >= 1,
    mostFreq != null && mostFreq > 0,
  ].filter(Boolean).length;

  if (signals < 2 && yearBooks < 3 && (profile.bookRead ?? 0) < 3) {
    return { ready: false };
  }

  return {
    ready: true,
    topGenre,
    secondGenre,
    topAuthor,
    averageRating: avg != null && avg > 0 ? avg : null,
    bookReadThisYear: yearBooks,
    mostFrequentRating: mostFreq != null && mostFreq > 0 ? mostFreq : null,
  };
};
