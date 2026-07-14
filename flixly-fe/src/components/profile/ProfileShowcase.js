import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CoverImage from "../ui/CoverImage";
import BookFilter from "../common/BookFilter";
import SectionHeader from "../ui/SectionHeader";
import {
  createShowcase,
  updateShowcase,
  deleteShowcase,
  isProPlanRole,
} from "../../service/APIService";
import "./ProfileShowcase.css";

const QUOTE_MAX = 500;

const ProfileShowcase = ({
  showcases = [],
  showcaseLimit = 1,
  role,
  isOwnProfile,
  books = [],
  onChanged,
}) => {
  const limit = showcaseLimit || (isProPlanRole(role) ? 3 : 1);
  const items = Array.isArray(showcases) ? showcases : [];
  const canAdd = isOwnProfile && items.length < limit;

  const [composerOpen, setComposerOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [quote, setQuote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!composerOpen) {
      setSelectedBook(null);
      setQuote("");
      setEditingId(null);
    }
  }, [composerOpen]);

  const openAdd = () => {
    setEditingId(null);
    setSelectedBook(null);
    setQuote("");
    setComposerOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setSelectedBook(
      item.bookId
        ? {
            id: item.bookId,
            title: item.bookTitle,
            coverUrl: item.coverUrl,
            authorName: item.authorName,
          }
        : null
    );
    setQuote(item.quote || "");
    setComposerOpen(true);
  };

  const handleBookPicked = (book) => {
    if (!book) return;
    setSelectedBook(book);
    setPickerOpen(false);
  };

  const handleSave = async () => {
    if (!quote.trim()) return;
    setBusy(true);
    try {
      const payload = {
        bookId: selectedBook?.id ?? null,
        quote: quote.trim(),
      };
      if (editingId) {
        await updateShowcase(editingId, payload);
      } else {
        await createShowcase(payload);
      }
      setComposerOpen(false);
      onChanged?.();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Showcase kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu showcase silinsin mi?")) return;
    setBusy(true);
    try {
      await deleteShowcase(id);
      onChanged?.();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  if (!isOwnProfile && items.length === 0) {
    return null;
  }

  return (
    <section className="profile-section profile-showcase">
      <SectionHeader
        title="Showcase"
        linkLabel={canAdd ? "Showcase ekle" : undefined}
        onLinkClick={canAdd ? openAdd : undefined}
      />

      {items.length === 0 && isOwnProfile && !composerOpen && (
        <div className="ps-empty">
          <p>Bir söz paylaş veya bir kitapla anını ekle.</p>
          <button type="button" className="profile-btn profile-btn--subtle" onClick={openAdd}>
            + Showcase ekle
          </button>
          <p className="ps-limit-hint">
            {isProPlanRole(role)
              ? "PRO: 3 showcase hakkın var."
              : "1 showcase hakkın var · PRO ile 3’e çıkar."}
          </p>
        </div>
      )}

      <div className="ps-list">
        {items.map((item) => {
          const hasBook = !!item.bookId;
          return (
            <article
              className={`ps-card ${hasBook ? "" : "ps-card--quote-only"}`}
              key={item.id}
            >
              {hasBook ? (
                <>
                  <Link to={`/book/${item.bookId}`} className="ps-cover-link" title={item.bookTitle}>
                    <CoverImage src={item.coverUrl} alt={item.bookTitle || ""} className="ps-cover" />
                  </Link>
                  <div className="ps-body">
                    <Link to={`/book/${item.bookId}`} className="ps-title">
                      {item.bookTitle}
                    </Link>
                    {item.authorName && <p className="ps-author">{item.authorName}</p>}
                    <blockquote className="ps-quote">“{item.quote}”</blockquote>
                    {isOwnProfile && (
                      <div className="ps-actions">
                        <button type="button" className="ps-action" onClick={() => openEdit(item)} disabled={busy}>
                          Düzenle
                        </button>
                        <button
                          type="button"
                          className="ps-action ps-action--danger"
                          onClick={() => handleDelete(item.id)}
                          disabled={busy}
                        >
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="ps-quote-only">
                  <blockquote className="ps-handwriting">“{item.quote}”</blockquote>
                  {isOwnProfile && (
                    <div className="ps-actions ps-actions--center">
                      <button type="button" className="ps-action" onClick={() => openEdit(item)} disabled={busy}>
                        Düzenle
                      </button>
                      <button
                        type="button"
                        className="ps-action ps-action--danger"
                        onClick={() => handleDelete(item.id)}
                        disabled={busy}
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {isOwnProfile && items.length > 0 && (
        <p className="ps-limit-hint">
          {items.length}/{limit} showcase
          {!isProPlanRole(role) && limit === 1 ? " · PRO ile 3 slot" : ""}
        </p>
      )}

      {composerOpen && (
        <div className="ps-composer">
          <h4 className="ps-composer-title">{editingId ? "Showcase düzenle" : "Showcase ekle"}</h4>
          <div className="ps-composer-row">
            <div className="ps-pick-col">
              <button
                type="button"
                className="ps-pick-book"
                onClick={() => setPickerOpen(true)}
              >
                {selectedBook ? (
                  <>
                    <CoverImage
                      src={selectedBook.coverUrl}
                      alt={selectedBook.title || ""}
                      className="ps-pick-cover"
                    />
                    <span className="ps-pick-meta">
                      <strong>{selectedBook.title}</strong>
                      <span>{selectedBook.authorName || "Kitap seçildi"}</span>
                    </span>
                  </>
                ) : (
                  <span className="ps-pick-placeholder">Kitap seç (opsiyonel)</span>
                )}
              </button>
              {selectedBook && (
                <button
                  type="button"
                  className="ps-action ps-clear-book"
                  onClick={() => setSelectedBook(null)}
                >
                  Kitabı kaldır
                </button>
              )}
            </div>
            <textarea
              className={`ps-quote-input ${selectedBook ? "" : "ps-quote-input--hand"}`}
              value={quote}
              onChange={(e) => setQuote(e.target.value.slice(0, QUOTE_MAX))}
              placeholder={
                selectedBook
                  ? "Bu kitapla ilgili fikrin, alıntın veya anın…"
                  : "Paylaşmak istediğin sözü yaz…"
              }
              rows={4}
              maxLength={QUOTE_MAX}
            />
          </div>
          <div className="ps-composer-actions">
            <span className="ps-char-count">
              {quote.length}/{QUOTE_MAX}
            </span>
            <button type="button" className="ps-action" onClick={() => setComposerOpen(false)} disabled={busy}>
              Vazgeç
            </button>
            <button
              type="button"
              className="profile-btn profile-btn--subtle"
              onClick={handleSave}
              disabled={busy || quote.trim().length < 2}
            >
              {busy ? "Kaydediliyor…" : editingId ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </div>
      )}

      {pickerOpen && (
        <BookFilter
          open={pickerOpen}
          handleDialog={setPickerOpen}
          selectedBookHandler={handleBookPicked}
          data={books}
        />
      )}
    </section>
  );
};

export default ProfileShowcase;
