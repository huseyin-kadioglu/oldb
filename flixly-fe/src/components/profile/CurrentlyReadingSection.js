import { useState } from "react";
import { Link } from "react-router-dom";
import CoverImage from "../ui/CoverImage";
import { createUserActivity } from "../../service/APIService";
import { relativeTime } from "./profileUtils";
import "./CurrentlyReadingSection.css";

const ProgressForm = ({ book, onDone, onCancel }) => {
  const [page, setPage] = useState(book.currentPage || "");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const next = Number(page);
    if (!Number.isFinite(next) || next < 0) {
      alert("Geçerli bir sayfa girin.");
      return;
    }
    setSaving(true);
    try {
      await createUserActivity({
        bookId: book.id,
        authorId: book.authorId,
        status: "READLIST",
        currentPage: Math.floor(next),
      });
      onDone?.();
    } catch {
      alert("İlerleme kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="cr-progress-form" onSubmit={save}>
      <label className="cr-progress-label">
        Sayfa
        <input
          type="number"
          min={0}
          max={book.pageCount || undefined}
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="cr-progress-input"
        />
        {book.pageCount ? <span className="cr-progress-max">/ {book.pageCount}</span> : null}
      </label>
      <div className="cr-progress-actions">
        <button type="submit" className="profile-btn profile-btn--primary" disabled={saving}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button type="button" className="profile-btn profile-btn--ghost" onClick={onCancel}>
          İptal
        </button>
      </div>
    </form>
  );
};

const ReadingCard = ({ book, isOwnProfile, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const current = book.currentPage;
  const total = book.pageCount;
  const pct =
    book.progressPercent ??
    (current != null && total > 0 ? Math.min(100, Math.round((100 * current) / total)) : null);
  const hasProgress = current != null && current > 0;
  const last = relativeTime(book.lastUpdated);

  return (
    <article className="cr-card">
      <Link to={`/book/${book.id}`} state={{ book }} className="cr-cover-link">
        <CoverImage src={book.coverUrl} alt={book.title || ""} className="cr-cover" />
      </Link>
      <div className="cr-body">
        <p className="cr-eyebrow">Şu anda okuyorum</p>
        <h3 className="cr-title">
          <Link to={`/book/${book.id}`} state={{ book }}>
            {book.title || "İsimsiz kitap"}
          </Link>
        </h3>
        {book.authorName && <p className="cr-author">{book.authorName}</p>}

        {editing && isOwnProfile ? (
          <ProgressForm
            book={book}
            onCancel={() => setEditing(false)}
            onDone={() => {
              setEditing(false);
              onUpdated?.();
            }}
          />
        ) : (
          <>
            {hasProgress ? (
              <>
                <div className="cr-progress-row">
                  {pct != null && <span className="cr-pct">%{pct}</span>}
                  <span className="cr-pages">
                    {current}
                    {total ? ` / ${total}` : ""}
                  </span>
                </div>
                {pct != null && (
                  <div className="cr-bar" aria-hidden="true">
                    <div className="cr-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </>
            ) : (
              <p className="cr-hint">İlerleme henüz kaydedilmedi</p>
            )}
            {last && (
              <p className="cr-updated">
                Son güncelleme <strong>{last}</strong>
              </p>
            )}
            {isOwnProfile && (
              <button
                type="button"
                className="profile-btn profile-btn--subtle cr-update-btn"
                onClick={() => setEditing(true)}
              >
                İlerlemeyi güncelle
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
};

const CurrentlyReadingSection = ({ books, isOwnProfile, onUpdated }) => {
  const list = Array.isArray(books) ? books.filter(Boolean) : [];

  if (!list.length) {
    return (
      <div className="profile-empty profile-empty--compact">
        <p>
          {isOwnProfile
            ? "Şu an aktif bir okuman yok. Bir kitabı okuma listene ekleyerek buraya taşı."
            : "Şu an aktif bir okuma yok."}
        </p>
      </div>
    );
  }

  if (list.length === 1) {
    return (
      <CurrentlyReadingSectionSingle
        book={list[0]}
        isOwnProfile={isOwnProfile}
        onUpdated={onUpdated}
      />
    );
  }

  return (
    <div className="cr-scroller" role="list">
      {list.map((book) => (
        <div className="cr-scroller-item" key={book.id} role="listitem">
          <ReadingCard book={book} isOwnProfile={isOwnProfile} onUpdated={onUpdated} />
        </div>
      ))}
    </div>
  );
};

const CurrentlyReadingSectionSingle = ({ book, isOwnProfile, onUpdated }) => (
  <ReadingCard book={book} isOwnProfile={isOwnProfile} onUpdated={onUpdated} />
);

export default CurrentlyReadingSection;
