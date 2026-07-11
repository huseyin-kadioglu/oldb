import { Link } from "react-router-dom";
import CoverImage from "./CoverImage";
import "../ui/folios-ui.css";
import "./ContinueReadingCard.css";

const formatLastUpdated = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "bugün";
  if (days === 1) return "1 gün önce";
  if (days < 30) return `${days} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

/** Profil üstündeki büyük “Şu anda okuyorum” kartı */
export const CurrentlyReadingCard = ({ book }) => {
  if (!book) return null;

  const current = book.currentPage;
  const total = book.pageCount;
  const pct =
    book.progressPercent ??
    (current != null && total > 0 ? Math.min(100, Math.round((100 * current) / total)) : null);
  const hasProgress = current != null && current > 0;
  const last = formatLastUpdated(book.lastUpdated);

  return (
    <Link to={`/book/${book.id}`} state={{ book }} className="currently-reading-card">
      <CoverImage src={book.coverUrl} alt={book.title} className="currently-reading-cover" />
      <div className="currently-reading-body">
        <p className="currently-reading-eyebrow">Şu anda okuyorum</p>
        <h3 className="currently-reading-title">{book.title}</h3>
        {book.authorName && <p className="currently-reading-author">{book.authorName}</p>}

        {hasProgress ? (
          <>
            <div className="currently-reading-progress-row">
              {pct != null && <span className="currently-reading-pct">%{pct}</span>}
              <span className="currently-reading-pages">
                {current}
                {total ? ` / ${total}` : ""}
              </span>
            </div>
            {pct != null && (
              <div className="currently-reading-bar">
                <div className="currently-reading-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            )}
          </>
        ) : (
          <p className="currently-reading-hint">İlerleme henüz kaydedilmedi</p>
        )}

        {last && (
          <p className="currently-reading-updated">
            Son güncelleme <strong>{last}</strong>
          </p>
        )}
      </div>
    </Link>
  );
};

const ContinueReadingCard = ({ book }) => {
  const current = book.currentPage;
  const total = book.pageCount;
  const pct =
    book.progressPercent ??
    (current != null && total > 0 ? Math.min(100, Math.round((100 * current) / total)) : null);
  const hasProgress = current != null && current > 0;

  return (
    <Link to={`/book/${book.id}`} state={{ book }} className="continue-card">
      <CoverImage src={book.coverUrl} alt={book.title} className="continue-card-cover" />
      <div className="continue-card-body">
        <h3 className="continue-card-title">{book.title}</h3>
        <p className="continue-card-author">{book.authorName}</p>
        {hasProgress ? (
          <>
            <div className="continue-card-progress-meta">
              <span>
                s. {current}
                {total ? ` / ${total}` : ""}
              </span>
              {pct != null && <span>{pct}%</span>}
            </div>
            {pct != null && (
              <div className="continue-card-bar">
                <div className="continue-card-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            )}
          </>
        ) : (
          <p className="continue-card-author">Okumaya devam et</p>
        )}
      </div>
    </Link>
  );
};

export default ContinueReadingCard;
