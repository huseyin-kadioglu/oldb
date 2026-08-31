import { useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import CoverImage from "../ui/CoverImage";
import MinimalDatePicker from "../common/MinimalDatePicker";
import { createUserActivity } from "../../service/APIService";
import { relativeTime } from "./profileUtils";
import COPY from "../../copy";
import { showToast, toastProfileAction } from "../../utils/uiEvents";
import "./CurrentlyReadingSection.css";

const todayIso = () => dayjs().format("YYYY-MM-DD");

const FinishDialog = ({ book, onConfirm, onCancel, saving }) => {
  const defaultStart =
    book.readingStartedAt || book.reading_started_at || todayIso();
  const [startDate, setStartDate] = useState(() => dayjs(defaultStart));

  const confirm = () => {
    const start = startDate ? startDate.format("YYYY-MM-DD") : todayIso();
    const end = todayIso();
    if (dayjs(end).isBefore(dayjs(start), "day")) {
      showToast(COPY.save.dateOrder);
      return;
    }
    onConfirm({ startDate: start, readDate: end });
  };

  return (
    <div className="cr-finish" role="dialog" aria-labelledby="cr-finish-title">
      <h4 id="cr-finish-title" className="cr-finish-title">
        Bu kitabı bugün bitirdin mi?
      </h4>
      <p className="cr-finish-copy">
        Onaylarsan okundu olarak işaretlenir; başlangıç ve bugünkü bitiş tarihi tempo
        hesabına girer.
      </p>
      <MinimalDatePicker
        label="Okumaya başlangıç"
        value={startDate}
        onChange={setStartDate}
        maxDate={dayjs()}
      />
      <div className="cr-progress-actions">
        <button
          type="button"
          className="profile-btn profile-btn--primary"
          disabled={saving}
          onClick={confirm}
        >
          {saving ? "Kaydediliyor…" : "Evet, bitirdim"}
        </button>
        <button type="button" className="profile-btn profile-btn--ghost" onClick={onCancel} disabled={saving}>
          İptal
        </button>
      </div>
    </div>
  );
};

const ProgressForm = ({ book, onDone, onCancel, onOfferFinish }) => {
  const [page, setPage] = useState(book.currentPage || "");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    const next = Number(page);
    if (!Number.isFinite(next) || next < 0) {
      showToast(COPY.fields.pageInvalid);
      return;
    }
    const pageCount = book.pageCount;
    const finished =
      pageCount != null && pageCount > 0 && Math.floor(next) >= pageCount;

    if (finished) {
      onOfferFinish?.(Math.floor(next));
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
      showToast(COPY.toast.progress);
      onDone?.();
    } catch {
      showToast(COPY.toast.statusError);
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
  const [finishing, setFinishing] = useState(false);
  const [savingFinish, setSavingFinish] = useState(false);
  const current = book.currentPage;
  const total = book.pageCount;
  const pct =
    book.progressPercent ??
    (current != null && total > 0 ? Math.min(100, Math.round((100 * current) / total)) : null);
  const hasProgress = current != null && current > 0;
  const last = relativeTime(book.lastUpdated);

  const completeRead = async ({ startDate, readDate }) => {
    setSavingFinish(true);
    try {
      await createUserActivity({
        bookId: book.id,
        authorId: book.authorId,
        status: "READ",
        startDate,
        readDate,
        currentPage: total || book.currentPage,
      });
      setFinishing(false);
      setEditing(false);
      showToast(COPY.toast.finished, toastProfileAction());
      onUpdated?.();
    } catch {
      showToast(COPY.toast.statusError);
    } finally {
      setSavingFinish(false);
    }
  };

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

        {finishing && isOwnProfile ? (
          <FinishDialog
            book={book}
            saving={savingFinish}
            onCancel={() => setFinishing(false)}
            onConfirm={completeRead}
          />
        ) : editing && isOwnProfile ? (
          <ProgressForm
            book={book}
            onCancel={() => setEditing(false)}
            onOfferFinish={() => setFinishing(true)}
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
              <div className="cr-card-actions">
                <button
                  type="button"
                  className="profile-btn profile-btn--subtle cr-update-btn"
                  onClick={() => setEditing(true)}
                >
                  İlerlemeyi güncelle
                </button>
                {pct != null && pct >= 100 && (
                  <button
                    type="button"
                    className="profile-btn profile-btn--primary cr-update-btn"
                    onClick={() => setFinishing(true)}
                  >
                    Bitirdim
                  </button>
                )}
              </div>
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
