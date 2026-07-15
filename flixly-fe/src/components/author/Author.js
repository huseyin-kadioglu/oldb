import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CoverImage from "../ui/CoverImage";
import ExpandableText from "../ui/ExpandableText";
import PhotoFrame from "../frame/PhotoFrame";
import CommentSection from "../common/CommentSection";
import { getAuthorById, rateAuthor } from "../../service/APIService";
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
  const isLoggedIn = !!sessionStorage.getItem("token");

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
  const completionPct = totalBooks > 0 ? Math.round((readCount / totalBooks) * 100) : 0;
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
              <div className="author-progress-top">
                <p className="author-progress-text">
                  {isLoggedIn
                    ? `${totalBooks} kitaptan ${readCount} tanesini okudunuz`
                    : `${totalBooks} eser`}
                </p>
                {isLoggedIn && (
                  <span className="author-progress-pct">{completionPct}%</span>
                )}
              </div>
              {isLoggedIn && (
                <div className="author-progress-bar">
                  <div
                    className="author-progress-fill"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
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
