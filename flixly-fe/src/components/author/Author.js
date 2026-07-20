import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CoverImage from "../ui/CoverImage";
import ExpandableText from "../ui/ExpandableText";
import PhotoFrame from "../frame/PhotoFrame";
import CommentSection from "../common/CommentSection";
import { getAuthorById, rateAuthor, updateCatalogAuthor, isStaffRole } from "../../service/APIService";
import { showToast } from "../../utils/uiEvents";
import "../ui/folios-ui.css";
import "./Author.css";

const SORT_OPTIONS = [
  { id: "title-asc", label: "Kitap adı (A→Z)" },
  { id: "title-desc", label: "Kitap adı (Z→A)" },
  { id: "year-desc", label: "Yayın tarihi (yeni → eski)" },
  { id: "year-asc", label: "Yayın tarihi (eski → yeni)" },
  { id: "rating-desc", label: "Ortalama puan (yüksek → düşük)" },
  { id: "rating-asc", label: "Ortalama puan (düşük → yüksek)" },
  { id: "pages-asc", label: "Sayfa (kısa → uzun)" },
  { id: "pages-desc", label: "Sayfa (uzun → kısa)" },
];

const sortBooks = (list, sortId) => {
  const books = [...list];
  switch (sortId) {
    case "title-desc":
      return books.sort((a, b) => (b.title || "").localeCompare(a.title || "", "tr"));
    case "year-desc":
      return books.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0));
    case "year-asc":
      return books.sort((a, b) => (a.publicationYear || 0) - (b.publicationYear || 0));
    case "rating-desc":
      return books.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    case "rating-asc":
      return books.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
    case "pages-asc":
      return books.sort((a, b) => (a.pageCount || 0) - (b.pageCount || 0));
    case "pages-desc":
      return books.sort((a, b) => (b.pageCount || 0) - (a.pageCount || 0));
    case "title-asc":
    default:
      return books.sort((a, b) => (a.title || "").localeCompare(b.title || "", "tr"));
  }
};

const Author = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [author, setAuthor] = useState(location.state?.author || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sortId, setSortId] = useState("year-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [portraitEditing, setPortraitEditing] = useState(false);
  const [portraitDraft, setPortraitDraft] = useState("");
  const [portraitSaving, setPortraitSaving] = useState(false);
  const isLoggedIn = !!sessionStorage.getItem("token");
  const isStaff = isStaffRole(sessionStorage.getItem("userRole"));

  const fetchAuthor = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAuthorById(params.authorId);
      const authorData = data?.author || data;
      setAuthor(authorData);
      if (authorData?.userRating) setUserRating(authorData.userRating);
      else setUserRating(0);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Yazar yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [params.authorId]);

  useEffect(() => {
    fetchAuthor();
  }, [fetchAuthor]);

  useEffect(() => {
    if (!sortOpen) return undefined;
    const close = () => setSortOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [sortOpen]);

  const handleRate = async (rating) => {
    if (!isLoggedIn) return;
    const previous = userRating;
    const newRating = userRating === rating ? 0 : rating;
    setUserRating(newRating);
    try {
      await rateAuthor(author.id, newRating);
    } catch (err) {
      console.error("Rating gönderilemedi:", err);
      setUserRating(previous);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const openPortraitEdit = () => {
    setPortraitDraft(author?.portrait || "");
    setPortraitEditing(true);
  };

  const handlePortraitSave = async () => {
    if (!author?.id) return;
    setPortraitSaving(true);
    try {
      const saved = await updateCatalogAuthor(author.id, {
        portrait: portraitDraft.trim(),
      });
      setAuthor((prev) => ({ ...prev, portrait: saved?.portrait ?? portraitDraft.trim() }));
      setPortraitEditing(false);
      showToast("Profil resmi güncellendi.");
    } catch (err) {
      showToast(err.message || "Profil resmi güncellenemedi.");
    } finally {
      setPortraitSaving(false);
    }
  };

  const books = useMemo(() => {
    const list = author?.books?.length
      ? author.books
      : (author?.bookWrittenBy || []).map((b) => ({ ...b, authorName: author?.name }));
    return sortBooks(list, sortId);
  }, [author, sortId]);

  if (loading) return <div className="page-loading">Yükleniyor…</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!author) return <div className="page-error">Yazar bulunamadı.</div>;

  const totalBooks = author.totalBookCount ?? books.length;
  const readCount = author.userReadCount ?? books.filter((b) => b.read).length;
  const libraryCount =
    author.userLibraryCount ?? books.filter((b) => b.inLibrary).length;
  const readPct = totalBooks > 0 ? Math.round((readCount / totalBooks) * 100) : 0;
  const libraryPct = totalBooks > 0 ? Math.round((libraryCount / totalBooks) * 100) : 0;
  const activeSort = SORT_OPTIONS.find((o) => o.id === sortId) || SORT_OPTIONS[0];

  return (
    <div className="author-page">
      <button type="button" className="folios-back-link" onClick={() => navigate(-1)}>
        <ArrowBackIcon fontSize="small" /> Geri
      </button>

      <div className="author-layout">
        <main className="author-main">
          <header className="author-main-header">
            <p className="author-main-label">Yazarın kitapları</p>
            <h1 className="author-main-name">{author.name}</h1>
            {author.country && (
              <p className="author-main-meta">{author.country}</p>
            )}
          </header>

          {books.length > 0 && (
            <div className="author-toolbar">
              <span className="author-toolbar-count">{books.length} kitap</span>
              <div className="author-sort" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="author-sort-trigger"
                  onClick={() => setSortOpen((v) => !v)}
                  aria-expanded={sortOpen}
                >
                  Sırala: <strong>{activeSort.label}</strong>
                  <KeyboardArrowDownIcon fontSize="small" />
                </button>
                {sortOpen && (
                  <ul className="author-sort-menu" role="listbox">
                    {SORT_OPTIONS.map((opt) => (
                      <li key={opt.id}>
                        <button
                          type="button"
                          className={opt.id === sortId ? "active" : ""}
                          onClick={() => {
                            setSortId(opt.id);
                            setSortOpen(false);
                          }}
                        >
                          {opt.id === sortId && <span className="author-sort-check">✓</span>}
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {books.length > 0 ? (
            <div className="author-book-grid">
              {books.map((book) => (
                <PhotoFrame
                  key={book.id}
                  book={{ ...book, authorName: author.name }}
                  showTitle
                  showMeta
                  showGhostMenu
                  className="author-grid-cover"
                />
              ))}
            </div>
          ) : (
            <p className="author-empty">Bu yazara ait kitap bulunamadı.</p>
          )}
        </main>

        <aside className="author-sidebar">
          <CoverImage
            src={author.portrait}
            alt={author.name}
            className="author-sidebar-portrait"
            variant="avatar"
          />

          {isStaff && (
            <div className="author-portrait-admin">
              {!portraitEditing ? (
                <button
                  type="button"
                  className="author-portrait-edit-btn"
                  onClick={openPortraitEdit}
                >
                  Fotoğrafı düzenle
                </button>
              ) : (
                <div className="author-portrait-edit-form">
                  <label className="author-portrait-edit-label" htmlFor="author-portrait-url">
                    Profil resmi URL
                  </label>
                  <input
                    id="author-portrait-url"
                    type="url"
                    className="author-portrait-edit-input"
                    value={portraitDraft}
                    onChange={(e) => setPortraitDraft(e.target.value)}
                    placeholder="https://…"
                    disabled={portraitSaving}
                  />
                  {portraitDraft.trim() && (
                    <img
                      src={portraitDraft.trim()}
                      alt="Önizleme"
                      className="author-portrait-edit-preview"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="author-portrait-edit-actions">
                    <button
                      type="button"
                      className="author-portrait-save-btn"
                      onClick={handlePortraitSave}
                      disabled={portraitSaving}
                    >
                      {portraitSaving ? "Kaydediliyor…" : "Kaydet"}
                    </button>
                    <button
                      type="button"
                      className="author-portrait-cancel-btn"
                      onClick={() => setPortraitEditing(false)}
                      disabled={portraitSaving}
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {author.description && (
            <ExpandableText
              text={author.description}
              lineCount={6}
              className="author-sidebar-bio"
            />
          )}

          <div className="author-sidebar-rating">
            <span className="author-sidebar-rating-label">Puanla</span>
            <div className="author-rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`author-star-btn ${(hoverRating || userRating) >= star ? "active" : ""}`}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={!isLoggedIn}
                  aria-label={`${star} yıldız`}
                >
                  ★
                </button>
              ))}
            </div>
            {author.averageRating > 0 && (
              <p className="author-sidebar-avg">
                Ort. {Number(author.averageRating).toFixed(1)}
                {author.ratingCount > 0 ? ` · ${author.ratingCount} değerlendirme` : ""}
              </p>
            )}
          </div>

          <button type="button" className="author-share-btn" onClick={handleShare}>
            <ShareOutlinedIcon fontSize="small" />
            {copied ? "Kopyalandı" : "Paylaş"}
          </button>

          {totalBooks > 0 && (
            <div className="author-progress-box">
              {isLoggedIn ? (
                <div className="author-progress-stack">
                  <div className="author-progress-row">
                    <div className="author-progress-meta">
                      <span className="author-progress-label">Okunan</span>
                      <span className="author-progress-pct">{readPct}%</span>
                    </div>
                    <div className="author-progress-bar" aria-hidden="true">
                      <div
                        className="author-progress-fill author-progress-fill--read"
                        style={{ width: `${readPct}%` }}
                      />
                    </div>
                    <p className="author-progress-hint">
                      {readCount}/{totalBooks} kitap
                    </p>
                  </div>
                  <div className="author-progress-row">
                    <div className="author-progress-meta">
                      <span className="author-progress-label">Kütüphane</span>
                      <span className="author-progress-pct">{libraryPct}%</span>
                    </div>
                    <div className="author-progress-bar" aria-hidden="true">
                      <div
                        className="author-progress-fill author-progress-fill--library"
                        style={{ width: `${libraryPct}%` }}
                      />
                    </div>
                    <p className="author-progress-hint">
                      {libraryCount}/{totalBooks} kitap
                    </p>
                  </div>
                </div>
              ) : (
                <p className="author-progress-text">{totalBooks} eser</p>
              )}
            </div>
          )}
        </aside>
      </div>

      <div className="author-comments-wrap">
        <CommentSection
          targetType="AUTHOR"
          targetId={author.id || params.authorId}
          title="Yazar yorumları"
        />
      </div>
    </div>
  );
};

export default Author;
