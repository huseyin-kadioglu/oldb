import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CoverImage from "../ui/CoverImage";
import BookFilter from "../common/BookFilter";
import {
  createQuote,
  updateQuote,
  deleteQuote,
  getUserQuotes,
} from "../../service/APIService";
import "./ProfileQuotes.css";
import "./ProfilePage.css";

const BODY_MAX = 800;

const QuotesPage = ({ books = [] }) => {
  const { username } = useParams();
  const isOwnProfile = sessionStorage.getItem("username") === username;
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [body, setBody] = useState("");
  const [pageNote, setPageNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getUserQuotes(username)
      .then((data) => {
        setQuotes(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(() => setError("Alıntılar yüklenemedi."))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditingId(null);
    setSelectedBook(null);
    setBody("");
    setPageNote("");
    setComposerOpen(true);
  };

  const openEdit = (q) => {
    setEditingId(q.id);
    setSelectedBook(
      q.bookId
        ? {
            id: q.bookId,
            title: q.bookTitle,
            coverUrl: q.coverUrl,
            authorName: q.authorName,
          }
        : null
    );
    setBody(q.body || "");
    setPageNote(q.pageNote || "");
    setComposerOpen(true);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      const payload = {
        bookId: selectedBook?.id ?? null,
        body: body.trim(),
        pageNote: pageNote.trim() || null,
      };
      if (editingId) {
        await updateQuote(editingId, payload);
      } else {
        await createQuote(payload);
      }
      closeComposer();
      load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu alıntı silinsin mi?")) return;
    try {
      await deleteQuote(id);
      load();
    } catch {
      alert("Silinemedi.");
    }
  };

  return (
    <div className="quotes-page">
      <header className="quotes-page-header">
        <div>
          <p className="quotes-page-kicker">
            <Link to={`/profile/${username}`} style={{ color: "inherit", textDecoration: "none" }}>
              ← {username}
            </Link>
          </p>
          <h1 className="quotes-page-title">Alıntı defteri</h1>
        </div>
        {isOwnProfile && (
          <button type="button" className="profile-btn profile-btn--subtle" onClick={openAdd}>
            + Alıntı ekle
          </button>
        )}
      </header>

      {composerOpen && isOwnProfile && (
        <div className="quotes-composer">
          <label>
            Alıntı
            <textarea
              value={body}
              maxLength={BODY_MAX}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Kitaptan bir satır…"
            />
          </label>
          <p className="quotes-hint">
            {body.length}/{BODY_MAX}
          </p>
          <label>
            Sayfa / not (isteğe bağlı)
            <input
              value={pageNote}
              maxLength={64}
              onChange={(e) => setPageNote(e.target.value)}
              placeholder="örn. s. 142"
            />
          </label>
          <div className="quotes-composer-row">
            {selectedBook ? (
              <span className="quotes-book-chip">
                <CoverImage src={selectedBook.coverUrl} alt="" />
                <span>{selectedBook.title}</span>
                <button
                  type="button"
                  className="profile-btn profile-btn--subtle"
                  onClick={() => setSelectedBook(null)}
                >
                  Kaldır
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="profile-btn profile-btn--subtle"
                onClick={() => setPickerOpen(true)}
              >
                Kitap bağla (isteğe bağlı)
              </button>
            )}
            <button
              type="button"
              className="profile-btn profile-btn--subtle"
              disabled={busy || body.trim().length < 2}
              onClick={handleSave}
            >
              {busy ? "Kaydediliyor…" : editingId ? "Güncelle" : "Kaydet"}
            </button>
            <button type="button" className="profile-btn profile-btn--subtle" onClick={closeComposer}>
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {loading && <p className="profile-empty">Yükleniyor…</p>}
      {error && <p className="profile-empty">{error}</p>}

      {!loading && !error && quotes.length === 0 && (
        <div className="pq-empty">
          <p>
            {isOwnProfile
              ? "Defterin boş. İlk alıntını ekle."
              : "Bu okurun henüz alıntısı yok."}
          </p>
        </div>
      )}

      <div className="quotes-list">
        {quotes.map((q, i) => (
          <article
            key={q.id}
            className="quotes-entry"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <p className="pq-handwriting">“{q.body}”</p>
            <div className="pq-preview-meta">
              {q.coverUrl && q.bookId && (
                <Link to={`/book/${q.bookId}`}>
                  <CoverImage src={q.coverUrl} alt={q.bookTitle || ""} className="pq-mini-cover" />
                </Link>
              )}
              <div>
                {q.bookTitle && (
                  <Link to={q.bookId ? `/book/${q.bookId}` : "#"} className="pq-book-link">
                    {q.bookTitle}
                    {q.authorName ? ` · ${q.authorName}` : ""}
                  </Link>
                )}
                {q.pageNote && <span className="pq-page-note">{q.pageNote}</span>}
              </div>
            </div>
            {isOwnProfile && (
              <div className="quotes-entry-actions">
                <button
                  type="button"
                  className="profile-btn profile-btn--subtle"
                  onClick={() => openEdit(q)}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="profile-btn profile-btn--subtle"
                  onClick={() => handleDelete(q.id)}
                >
                  Sil
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {pickerOpen && (
        <BookFilter
          open={pickerOpen}
          handleDialog={setPickerOpen}
          selectedBookHandler={(book) => {
            if (!book) return;
            setSelectedBook(book);
            setPickerOpen(false);
          }}
          data={books}
        />
      )}
    </div>
  );
};

export default QuotesPage;
