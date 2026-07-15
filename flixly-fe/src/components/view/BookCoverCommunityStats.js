import { useEffect, useState } from "react";

/**
 * Kapak altı sosyal kanıt — dikey satırlar.
 * İkon + sayı beyaz/vurgulu, açıklama gri.
 */

const formatFull = (n) => Number(n).toLocaleString("tr-TR");

const formatCount = (n, compact) => {
  const num = Number(n) || 0;
  if (!compact || num < 1000) return formatFull(num);
  const thousands = num / 1000;
  const rounded =
    thousands >= 10
      ? Math.round(thousands).toLocaleString("tr-TR")
      : thousands.toLocaleString("tr-TR", {
          maximumFractionDigits: 1,
          minimumFractionDigits: thousands % 1 === 0 ? 0 : 1,
        });
  return `${rounded} B`;
};

const BookCoverCommunityStats = ({ book }) => {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(max-width: 720px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  if (!book) return null;

  const favorite =
    Number(book.favoriteCount ?? book.howManyPplFavourited ?? 0) || 0;
  const library =
    Number(book.libraryCount ?? book.howManyPplInLibrary ?? 0) || 0;
  const read = Number(book.readCount ?? book.howManyPplRead ?? 0) || 0;
  const liked = Number(book.howManyPplLiked ?? book.likeCount ?? 0) || 0;

  const metrics = [
    read > 0 && {
      key: "read",
      icon: "✓",
      tone: "neutral",
      count: read,
      rest: "kişi okudu",
      tip: `${formatFull(read)} kişi okudu`,
    },
    favorite > 0 && {
      key: "favorite",
      icon: "★",
      tone: "star",
      count: favorite,
      rest: "kişi favorilerine ekledi",
      tip: `${formatFull(favorite)} kişi favorilerine ekledi`,
    },
    library > 0 && {
      key: "library",
      icon: "📚",
      tone: "neutral",
      count: library,
      rest: "kişinin kütüphanesinde",
      tip: `${formatFull(library)} kişinin kütüphanesinde`,
    },
    liked > 0 && {
      key: "liked",
      icon: "♥",
      tone: "heart",
      count: liked,
      rest: "kişi beğendi",
      tip: `${formatFull(liked)} kişi beğendi`,
    },
  ].filter(Boolean);

  if (metrics.length === 0) return null;

  return (
    <ul className="book-cover-stats" aria-label="Topluluk sayıları">
      {metrics.map((m) => (
        <li key={m.key} className="book-cover-stats__item">
          <span
            className={`book-cover-stats__chip book-cover-stats__chip--${m.tone}`}
            tabIndex={0}
            role="img"
            aria-label={m.tip}
            title={m.tip}
          >
            <span className="book-cover-stats__icon" aria-hidden="true">
              {m.icon}
            </span>
            <span className="book-cover-stats__count">
              {formatCount(m.count, compact)}
            </span>
            <span className="book-cover-stats__rest">{m.rest}</span>
          </span>
        </li>
      ))}
    </ul>
  );
};

export default BookCoverCommunityStats;
