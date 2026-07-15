import { useEffect, useState, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Rating } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CoverImage from "../ui/CoverImage";
import SectionHeader from "../ui/SectionHeader";
import BookCoverCard from "../ui/BookCoverCard";
import BookCoverCommunityStats from "./BookCoverCommunityStats";
import SelectedBookDialog from "../common/SelectedBookDialog";
import CommentSection from "../common/CommentSection";
import InitialAvatar from "../common/InitialAvatar";
import { UserDisplayName } from "../common/ProVerifiedBadge";
import {
  createUserActivity,
  createUserActivityFromGhostMenu,
  getAuthorById,
  getBookById,
  getBookSocial,
} from "../../service/APIService";
import COPY from "../../copy";
import {
  buildFallbackSynopsis,
  pickBookTags,
  splitSynopsisLead,
} from "./bookGenreLabels";
import "../ui/folios-ui.css";
import "./BookSummaryView.css";

const STATUS_LABELS = {
  READ: "Okudu",
  COMPLETED: "Okudu",
  READLIST: "Okuma listesinde",
  LIBRARY: "Kütüphanede",
  LIKE: "Beğendi",
  SHOPPING: "Alınacaklarda",
  DROPPED: "Bıraktı",
};

const communityStars = (avg) => {
  const n = Math.max(0, Math.min(5, Number(avg) || 0));
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
};

const reviewStars = (rating) => {
  const n = Number(rating) || 0;
  if (n <= 0) return null;
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
};

const formatReviewDate = (raw) => {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("tr-TR");
  } catch {
    return "";
  }
};

const BookSummaryView = ({ books = [] }) => {
  const [author, setAuthor] = useState({});
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logOpen, setLogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [synopsisOpen, setSynopsisOpen] = useState(false);
  const [synopsisHeights, setSynopsisHeights] = useState({ full: 0, collapsed: 0 });
  const synopsisInnerRef = useRef(null);
  const [social, setSocial] = useState({
    friendsReading: [],
    topReviews: [],
    authorOtherBooks: [],
  });
  const [friendsOpen, setFriendsOpen] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isInReadlist, setIsInReadlist] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isInShopping, setIsInShopping] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const navigate = useNavigate();
  const params = useParams();
  const isLoggedIn = !!sessionStorage.getItem("token");

  const syncBookFlags = useCallback((b) => {
    if (!b) return;
    const flag = (...keys) => keys.some((k) => !!b[k]);
    setIsLiked(flag("liked", "isLiked"));
    setIsFavourite(flag("favourite", "favorite", "isFavourite"));
    setIsRead(flag("read", "isRead"));
    setIsInReadlist(flag("inReadList", "isInReadList"));
    setIsInLibrary(flag("inLibrary", "isInLibrary"));
    setIsInShopping(flag("inShopping", "isInShopping"));
    setIsDropped(flag("dropped", "isDropped"));
    setCurrentPage(Number(b.currentPage) || 0);
    if (b.rating != null) setUserRating(Number(b.rating) || 0);
  }, []);

  const applyLocalFlag = (actionType, next) => {
    switch (actionType) {
      case "LIKE":
        setIsLiked(next);
        break;
      case "FAVOURITE":
        setIsFavourite(next);
        break;
      case "READ":
        setIsRead(next);
        if (next) {
          setIsInReadlist(false);
          setIsDropped(false);
          setCurrentPage(0);
        }
        break;
      case "READLIST":
        setIsInReadlist(next);
        if (next) {
          setIsRead(false);
          setIsDropped(false);
        }
        if (!next) setCurrentPage(0);
        break;
      case "LIBRARY":
        setIsInLibrary(next);
        if (next) setIsDropped(false);
        break;
      case "SHOPPING":
        setIsInShopping(next);
        break;
      case "DROPPED":
        setIsDropped(next);
        if (next) {
          setIsRead(false);
          setIsInReadlist(false);
          setIsInLibrary(false);
          setCurrentPage(0);
        }
        break;
      default:
        break;
    }
  };

  const refreshBook = useCallback(
    async (bookId) => {
      try {
        const data = await getBookById(bookId);
        const found = data?.book || data;
        if (found) {
          setBook(found);
          syncBookFlags(found);
        }
      } catch {
        /* keep current */
      }
    },
    [syncBookFlags]
  );

  useEffect(() => {
    fetchBook();
  }, [params.bookId]);

  useEffect(() => {
    if (!params.bookId) return;
    getBookSocial(params.bookId)
      .then((data) =>
        setSocial({
          friendsReading: data?.friendsReading || [],
          topReviews: data?.topReviews || [],
          authorOtherBooks: data?.authorOtherBooks || [],
        })
      )
      .catch(() =>
        setSocial({ friendsReading: [], topReviews: [], authorOtherBooks: [] })
      );
  }, [params.bookId, isLoggedIn]);

  useEffect(() => {
    if (book?.authorId) fetchAuthor();
    else if (book) setLoading(false);
  }, [book?.authorId, book]);

  const fetchAuthor = async () => {
    try {
      const data = await getAuthorById(book.authorId);
      setAuthor(data?.author || data);
    } catch {
      setError("Yazar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBook = async () => {
    try {
      const data = await getBookById(params.bookId);
      const b = data?.book || data;
      setBook(b);
      syncBookFlags(b);
    } catch {
      setError("Kitap yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const requireLogin = () => {
    if (!isLoggedIn) {
      alert("Bu işlem için giriş yapmalısınız.");
      return false;
    }
    return true;
  };

  const handleGhostAction = async (actionType, current) => {
    if (!requireLogin()) return;
    const next = !current;
    applyLocalFlag(actionType, next);
    setActionLoading(true);
    try {
      await createUserActivityFromGhostMenu({
        bookId: book.id,
        authorId: book.authorId,
        actionType,
        action: current ? "REMOVE" : "ADD",
      });
      await refreshBook(book.id);
    } catch {
      applyLocalFlag(actionType, current);
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  /** Exclusive reading position — uses existing READ / READLIST (+ currentPage) enums. */
  const primaryKey = useMemo(() => {
    if (isRead) return "read";
    if (isInReadlist && currentPage > 0) return "reading";
    if (isInReadlist) return "want";
    return null;
  }, [isRead, isInReadlist, currentPage]);

  const handlePrimary = async (key) => {
    if (!requireLogin()) return;
    setActionLoading(true);
    try {
      if (key === primaryKey) {
        if (isRead) {
          await createUserActivityFromGhostMenu({
            bookId: book.id,
            authorId: book.authorId,
            actionType: "READ",
            action: "REMOVE",
          });
        } else if (isInReadlist) {
          await createUserActivityFromGhostMenu({
            bookId: book.id,
            authorId: book.authorId,
            actionType: "READLIST",
            action: "REMOVE",
          });
        }
      } else if (key === "read") {
        await createUserActivity({
          bookId: book.id,
          authorId: book.authorId,
          status: "READ",
          actionType: "READ",
        });
      } else if (key === "want") {
        await createUserActivity({
          bookId: book.id,
          authorId: book.authorId,
          status: "READLIST",
          actionType: "READLIST",
          currentPage: 0,
        });
      } else if (key === "reading") {
        await createUserActivity({
          bookId: book.id,
          authorId: book.authorId,
          status: "READLIST",
          actionType: "READLIST",
          currentPage: currentPage > 0 ? currentPage : 1,
        });
      }
      await refreshBook(book.id);
    } catch {
      alert("Durum güncellenemedi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRate = async (_event, value) => {
    if (!requireLogin()) return;
    const next = value ?? 0;
    const prev = userRating;
    setUserRating(next);
    if (next === 0) return;
    try {
      await createUserActivity({
        bookId: book.id,
        authorId: book.authorId,
        status: "READ",
        rating: next,
        actionType: "READ",
      });
      setIsRead(true);
      await refreshBook(book.id);
    } catch {
      setUserRating(prev);
      alert("Puan kaydedilemedi.");
    }
  };

  const handleLogSubmit = async (payload) => {
    await createUserActivity(payload);
    if (payload.rating) setUserRating(payload.rating);
    setLogOpen(false);
    await refreshBook(book.id);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const synopsisAuthorName = author?.name || book?.authorName;
  const description = useMemo(() => {
    if (!book) return "";
    const raw = (book.description || book.bookSummary || book.summary || "").trim();
    return (raw || buildFallbackSynopsis(book, synopsisAuthorName)).trim();
  }, [book, synopsisAuthorName]);

  const { lead: synopsisLead, rest: synopsisRest } = useMemo(
    () => splitSynopsisLead(description),
    [description]
  );
  const synopsisNeedsClamp = description.length > 180;

  useLayoutEffect(() => {
    setSynopsisOpen(false);
  }, [book?.id]);

  useLayoutEffect(() => {
    if (!description || !synopsisInnerRef.current) {
      setSynopsisHeights({ full: 0, collapsed: 0 });
      return;
    }
    const el = synopsisInnerRef.current;
    const full = el.scrollHeight;
    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 28;
    const collapsed = Math.round(lineHeight * 4);
    setSynopsisHeights({ full, collapsed });
  }, [description, book?.id]);

  const synopsisMaxHeight = !synopsisNeedsClamp
    ? "none"
    : synopsisOpen
      ? `${Math.max(synopsisHeights.full, synopsisHeights.collapsed) + 8}px`
      : `${synopsisHeights.collapsed || 112}px`;

  if (loading) return <div className="page-loading">Yükleniyor…</div>;
  if (!book) return <div className="page-error">Kitap bulunamadı.</div>;
  if (error) return <div className="page-error">{error}</div>;

  const friendsReading = social.friendsReading || [];
  const topReviews = (social.topReviews || []).slice(0, 3);
  const authorOtherBooks =
    social.authorOtherBooks?.length > 0
      ? social.authorOtherBooks
      : books
          .filter((b) => b.id !== book?.id && b.authorId === book?.authorId)
          .slice(0, 12);

  const authorOtherIds = new Set(authorOtherBooks.map((b) => b.id));
  const similarBooks = (() => {
    if (!book || !Array.isArray(books) || books.length === 0) return [];
    const rawTokens = String(book.genres || "")
      .split(",")
      .map((g) => g.trim().toLowerCase())
      .filter((g) => g.length > 2);
    if (rawTokens.length === 0) return [];
    return books
      .filter((b) => b.id !== book.id && !authorOtherIds.has(b.id))
      .map((b) => {
        const hay = String(b.genres || "").toLowerCase();
        const score = rawTokens.reduce((acc, t) => (hay.includes(t) ? acc + 1 : acc), 0);
        return { book: b, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || (b.book.averageRating || 0) - (a.book.averageRating || 0))
      .slice(0, 12)
      .map((x) => x.book);
  })();

  const tags = pickBookTags(book.genres || book.bookSummaryTags, 5);
  const authorData = author?.name ? author : { name: book.authorName };
  const likedCount = book.howManyPplLiked ?? 0;
  const readlistCount = book.howManyPplAddedToReadList ?? 0;
  const droppedCount = book.howManyPplDropped ?? 0;
  const communityRows = [
    likedCount > 0 && { label: "Beğeni", value: likedCount },
    readlistCount > 0 && { label: "Okuma listesi", value: readlistCount },
    droppedCount > 0 && { label: "Bırakan", value: droppedCount },
  ].filter(Boolean);
  const hasCommunityStats = communityRows.length > 0;

  const primaryStatusLabel =
    primaryKey === "read"
      ? "✓ Okudun"
      : primaryKey === "reading"
        ? "📖 Şu an okuyorsun"
        : primaryKey === "want"
          ? "○ Okuyacaksın"
          : "Henüz seçilmedi";

  const metaBits = [
    book.pageCount > 0 ? `${book.pageCount} sayfa` : null,
    book.publicationYear > 0 ? String(book.publicationYear) : null,
  ].filter(Boolean);

  return (
    <div className="book-page">
      <button type="button" className="folios-back-link" onClick={() => navigate(-1)}>
        <ArrowBackIcon fontSize="small" /> Geri
      </button>

      <div className="book-page-hero-shell">
        {book.coverUrl && (
          <div
            className="book-page-hero-backdrop"
            style={{ backgroundImage: `url(${book.coverUrl})` }}
            aria-hidden="true"
          />
        )}
        <div className="book-page-hero-scrim" aria-hidden="true" />

        <header className="book-page-hero">
          <div className="book-page-cover-wrap">
            <CoverImage src={book.coverUrl} alt={book.title} className="book-page-cover-img" />
            <BookCoverCommunityStats book={book} />
          </div>

          <div className="book-page-hero-body">
            <div className="book-page-identity">
              {(book.wonNobelPrize ||
                book.isEditorChoice ||
                book.isWeeklyPick ||
                book.isNewRelease) && (
                <div className="book-award-row">
                  {book.wonNobelPrize && <span className="book-award-badge">Nobel Ödüllü</span>}
                  {book.isEditorChoice && (
                    <span className="book-award-badge">Editörün Seçimi</span>
                  )}
                  {book.isWeeklyPick && (
                    <span className="book-award-badge weekly">Haftanın Kitabı</span>
                  )}
                  {book.isNewRelease && <span className="book-award-badge new">Yeni Çıkan</span>}
                </div>
              )}

              <h1 className="book-page-title">{book.title}</h1>

              <p className="book-page-byline">
                <Link
                  to={`/author/${book.authorId}`}
                  state={{ author: authorData }}
                  className="book-page-author"
                >
                  {authorData.name || "Yazar"}
                </Link>
                {authorData.country && (
                  <span className="book-page-author-country"> · {authorData.country}</span>
                )}
              </p>

              {book.averageRating > 0 && (
                <div className="book-page-community-rating" aria-label="Topluluk puanı">
                  <span className="book-page-stars">{communityStars(book.averageRating)}</span>
                  <div className="book-page-rating-meta">
                    <span className="book-page-rating-val">
                      {Number(book.averageRating).toFixed(1)}
                    </span>
                    {book.ratingCount > 0 && (
                      <span className="book-page-rating-count">
                        ({book.ratingCount} değerlendirme)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {metaBits.length > 0 && (
                <p className="book-page-meta-line">
                  {metaBits.map((bit, i) => (
                    <span key={bit}>
                      {i > 0 && <span className="book-page-meta-dot"> · </span>}
                      {book.publicationYear > 0 && bit === String(book.publicationYear) ? (
                        <Link
                          to={`/books/year/${book.publicationYear}`}
                          className="book-page-year-link"
                        >
                          {bit}
                        </Link>
                      ) : (
                        bit
                      )}
                    </span>
                  ))}
                </p>
              )}

              {tags.length > 0 && (
                <div className="book-page-tags">
                  {tags.map((g) => (
                    <span key={g}>{g}</span>
                  ))}
                </div>
              )}
            </div>

            {description ? (
              <section className="book-about book-hero-block" aria-label="Kitap Hakkında">
                <h2 className="book-about-heading">Kitap Hakkında</h2>
                <div
                  className={`book-about-collapse ${synopsisOpen || !synopsisNeedsClamp ? "is-open" : ""}`}
                  style={{ maxHeight: synopsisMaxHeight }}
                >
                  <div ref={synopsisInnerRef} className="book-about-inner">
                    <p className="book-about-text">
                      <span className="book-about-lead">{synopsisLead}</span>
                      {synopsisRest ? (
                        <span className="book-about-rest"> {synopsisRest}</span>
                      ) : null}
                    </p>
                  </div>
                </div>
                {synopsisNeedsClamp && (
                  <button
                    type="button"
                    className="book-about-more"
                    aria-expanded={synopsisOpen}
                    onClick={() => setSynopsisOpen((v) => !v)}
                  >
                    {synopsisOpen ? "Daha az göster" : "Devamını oku →"}
                  </button>
                )}
              </section>
            ) : null}

            <div className="book-page-primary book-hero-block" role="group" aria-label="Okuma durumu">
              <p className="book-hero-block-label">Okuma durumu</p>
              <div className="book-page-primary-row">
                <button
                  type="button"
                  className={`book-primary-btn ${primaryKey === "want" ? "is-active" : ""}`}
                  disabled={actionLoading}
                  onClick={() => handlePrimary("want")}
                >
                  <span className="book-primary-mark" aria-hidden="true">
                    {primaryKey === "want" ? "●" : "○"}
                  </span>
                  {COPY.status.want}
                </button>
                <button
                  type="button"
                  className={`book-primary-btn ${primaryKey === "reading" ? "is-active" : ""}`}
                  disabled={actionLoading}
                  onClick={() => handlePrimary("reading")}
                >
                  <span className="book-primary-mark" aria-hidden="true">
                    📖
                  </span>
                  {COPY.status.reading}
                </button>
                <button
                  type="button"
                  className={`book-primary-btn ${primaryKey === "read" ? "is-active" : ""}`}
                  disabled={actionLoading}
                  onClick={() => handlePrimary("read")}
                >
                  <span className="book-primary-mark" aria-hidden="true">
                    {primaryKey === "read" ? "✓" : "○"}
                  </span>
                  {COPY.status.read}
                </button>
              </div>
            </div>

            <div className="book-page-secondary book-hero-block" role="group" aria-label="Diğer">
              <p className="book-hero-block-label">Diğer</p>
              <div className="book-page-secondary-row">
                <button
                  type="button"
                  className={`book-secondary-btn ${isLiked ? "is-active liked" : ""}`}
                  disabled={actionLoading}
                  onClick={() => handleGhostAction("LIKE", isLiked)}
                >
                  {isLiked ? <FavoriteIcon fontSize="inherit" /> : <FavoriteBorderIcon fontSize="inherit" />}
                  {COPY.other.like}
                </button>
                <button
                  type="button"
                  className={`book-secondary-btn ${isFavourite ? "is-active" : ""}`}
                  disabled={actionLoading}
                  onClick={() => handleGhostAction("FAVOURITE", isFavourite)}
                >
                  {isFavourite ? <StarIcon fontSize="inherit" /> : <StarBorderIcon fontSize="inherit" />}
                  {COPY.other.favourite}
                </button>
                <button
                  type="button"
                  className={`book-secondary-btn ${isInLibrary ? "is-active" : ""}`}
                  disabled={actionLoading}
                  onClick={() => handleGhostAction("LIBRARY", isInLibrary)}
                >
                  {isInLibrary ? (
                    <LibraryBooksIcon fontSize="inherit" />
                  ) : (
                    <LibraryAddIcon fontSize="inherit" />
                  )}
                  {COPY.other.library}
                </button>
                <button
                  type="button"
                  className={`book-secondary-btn ${isInShopping ? "is-active" : ""}`}
                  disabled={actionLoading}
                  onClick={() => handleGhostAction("SHOPPING", isInShopping)}
                >
                  {isInShopping ? (
                    <ShoppingCartIcon fontSize="inherit" />
                  ) : (
                    <ShoppingCartOutlinedIcon fontSize="inherit" />
                  )}
                  {COPY.other.shopping}
                </button>
                <button
                  type="button"
                  className={`book-secondary-btn ${isDropped ? "is-active dropped" : ""}`}
                  disabled={actionLoading}
                  onClick={() => handleGhostAction("DROPPED", isDropped)}
                >
                  <DoNotDisturbAltIcon fontSize="inherit" />
                  {COPY.status.dropped}
                </button>
              </div>
            </div>

            <div className="book-page-your-rating book-hero-block">
              <p className="book-hero-block-label">Senin puanın</p>
              <Rating
                name="book-user-rating"
                value={userRating}
                precision={0.5}
                size="large"
                onChange={handleRate}
                disabled={!isLoggedIn || actionLoading}
                sx={{
                  "& .MuiRating-iconFilled": { color: "var(--color-primary-button, #d4af37)" },
                  "& .MuiRating-iconHover": {
                    color: "var(--color-primary-button-hover, #e8c547)",
                  },
                  "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.18)" },
                }}
              />
              <p className="book-page-your-rating-caption">
                {userRating > 0
                  ? `Bu kitaba ${Number(userRating) % 1 === 0 ? Number(userRating) : Number(userRating).toFixed(1)} yıldız verdin.`
                  : isLoggedIn
                    ? "Bu kitaba kaç yıldız verirsin?"
                    : "Puanlamak için giriş yap."}
              </p>
            </div>

          <div className="book-page-tools">
            {isLoggedIn && (
              <button
                type="button"
                className="book-tool-link"
                disabled={actionLoading}
                onClick={() => setLogOpen(true)}
              >
                <EditNoteIcon fontSize="small" />
                {COPY.book.saveReview}
              </button>
            )}
            <button type="button" className="book-tool-link" onClick={handleShare}>
              <ShareOutlinedIcon fontSize="small" />
              {shareCopied ? "Kopyalandı" : "Paylaş"}
            </button>
            {!isLoggedIn && (
              <span className="book-page-login-hint">İşlemler için giriş yapın.</span>
            )}
          </div>
          </div>
        </header>
      </div>

      {friendsReading.length > 0 && (
        <section className="book-page-friends">
          <div className="book-page-friends-head">
            <h2 className="book-page-friends-title">Arkadaşlarından okuyanlar</h2>
            <button
              type="button"
              className="folios-see-all"
              onClick={() => setFriendsOpen(true)}
            >
              {friendsReading.length} arkadaş →
            </button>
          </div>
          <button
            type="button"
            className="book-friends-strip"
            onClick={() => setFriendsOpen(true)}
            aria-label="Arkadaş listesini aç"
          >
            {friendsReading.slice(0, 10).map((f) => (
              <span
                key={f.userId}
                className="book-friends-avatar"
                title={f.profileName || f.username}
              >
                <InitialAvatar name={f.profileName || f.username} src={f.avatarUrl} />
              </span>
            ))}
            {friendsReading.length > 10 && (
              <span className="book-friends-more">+{friendsReading.length - 10}</span>
            )}
          </button>
          <p className="book-friends-caption">
            {friendsReading.length} arkadaş okudu veya listesine ekledi
          </p>
        </section>
      )}

      <div className="page-layout book-page-layout">
        <main className="page-main">
          {book.adminNotes && (
            <section className="book-page-section">
              <div className="book-admin-notes folios-card">{book.adminNotes}</div>
            </section>
          )}

          {topReviews.length > 0 && (
            <section className="book-page-section">
              <SectionHeader title="Top incelemeler" />
              <div className="book-hub-reviews">
                {topReviews.map((r) => (
                  <article className="book-hub-review" key={r.activityId}>
                    <div className="book-hub-review-head">
                      {r.username ? (
                        <Link to={`/profile/${r.username}`} className="book-hub-review-user">
                          <InitialAvatar
                            name={r.profileName || r.username}
                            src={r.avatarUrl}
                          />
                          <UserDisplayName
                            name={r.profileName || r.username}
                            role={r.role}
                            badgeSize="xs"
                          />
                        </Link>
                      ) : (
                        <span className="book-hub-review-user">
                          <InitialAvatar name="okur" />
                          <span>okur</span>
                        </span>
                      )}
                      <div className="book-hub-review-meta">
                        {r.rating > 0 && (
                          <span className="book-hub-review-stars">{reviewStars(r.rating)}</span>
                        )}
                        {Number(r.likeCount) > 0 && (
                          <span className="book-hub-review-likes">♥ {r.likeCount}</span>
                        )}
                        {formatReviewDate(r.readDate) && (
                          <span className="book-hub-review-date">
                            {formatReviewDate(r.readDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    {r.comment && <p className="book-hub-review-text">{r.comment}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="book-page-section">
            <CommentSection
              targetType="BOOK"
              targetId={book.id}
              title="Okur yorumları"
              placeholder="Bu kitap hakkında ne düşünüyorsun?"
            />
          </section>

          {authorOtherBooks.length > 0 && (
            <section className="book-page-section">
              <SectionHeader
                title={
                  authorData.name
                    ? `${authorData.name}'ın diğer kitapları`
                    : "Yazarın diğer kitapları"
                }
                to={book.authorId ? `/author/${book.authorId}` : undefined}
                linkLabel={book.authorId ? "Tüm kitapları" : undefined}
              />
              <div className="book-author-shelf">
                {authorOtherBooks.map((b) => (
                  <BookCoverCard key={b.id} book={b} showAuthor={false} />
                ))}
              </div>
            </section>
          )}

          {similarBooks.length > 0 && (
            <section className="book-page-section">
              <SectionHeader title="Benzer kitaplar" />
              <div className="book-author-shelf">
                {similarBooks.map((b) => (
                  <BookCoverCard key={b.id} book={b} showAuthor />
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="page-sidebar book-page-sidebar">
          <div className="sidebar-block book-side-card">
            <h3 className="sidebar-title">Senin kaydın</h3>
            <div className="book-side-stack">
              <div className="book-side-fact">
                <span className="book-side-label">Durum</span>
                <strong className="book-side-value">{primaryStatusLabel}</strong>
              </div>
              <div className="book-side-fact">
                <span className="book-side-label">Puan</span>
                <strong className="book-side-value">
                  {userRating > 0 ? `${userRating} ★` : "—"}
                </strong>
              </div>
              <div className="book-side-fact">
                <span className="book-side-label">Favori</span>
                <strong className="book-side-value">
                  {isFavourite ? "★ Favorilerinde" : "Değil"}
                </strong>
              </div>
              <div className="book-side-fact">
                <span className="book-side-label">Kütüphane</span>
                <strong className="book-side-value">
                  {isInLibrary ? "Kütüphanende" : "Değil"}
                </strong>
              </div>
            </div>
          </div>

          <div className="sidebar-block book-side-card">
            <h3 className="sidebar-title">Kitap bilgileri</h3>
            <div className="book-side-stack">
              {book.publicationYear > 0 && (
                <div className="book-side-fact">
                  <span className="book-side-label">Yıl</span>
                  <strong className="book-side-value">
                    <Link to={`/books/year/${book.publicationYear}`}>
                      {book.publicationYear}
                    </Link>
                  </strong>
                </div>
              )}
              {book.pageCount > 0 && (
                <div className="book-side-fact">
                  <span className="book-side-label">Sayfa</span>
                  <strong className="book-side-value">{book.pageCount}</strong>
                </div>
              )}
              {book.originalTitle && (
                <div className="book-side-fact">
                  <span className="book-side-label">Orijinal ad</span>
                  <strong className="book-side-value">{book.originalTitle}</strong>
                </div>
              )}
              {book.isbn && (
                <div className="book-side-fact">
                  <span className="book-side-label">ISBN</span>
                  <strong className="book-side-value book-side-value--mono">{book.isbn}</strong>
                </div>
              )}
              {hasCommunityStats ? (
                communityRows.map((row) => (
                  <div className="book-side-fact" key={row.label}>
                    <span className="book-side-label">{row.label}</span>
                    <strong className="book-side-value">{row.value}</strong>
                  </div>
                ))
              ) : (
                <p className="book-side-empty">Henüz yeterli veri oluşmadı</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {logOpen && (
        <SelectedBookDialog
          open
          selectedBook={book}
          selectedBookHandler={() => setLogOpen(false)}
          onSubmitCallback={handleLogSubmit}
        />
      )}

      {friendsOpen && (
        <div
          className="book-friends-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Arkadaşlarından okuyanlar"
          onClick={() => setFriendsOpen(false)}
        >
          <div className="book-friends-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="book-friends-sheet-head">
              <h2>Arkadaşlarından okuyanlar</h2>
              <button type="button" onClick={() => setFriendsOpen(false)} aria-label="Kapat">
                ×
              </button>
            </div>
            <ul className="book-friends-list">
              {friendsReading.map((f) => (
                <li key={f.userId}>
                  <Link
                    to={`/profile/${f.username}`}
                    className="book-friends-row"
                    onClick={() => setFriendsOpen(false)}
                  >
                    <InitialAvatar name={f.profileName || f.username} src={f.avatarUrl} />
                    <span className="book-friends-row-meta">
                      <UserDisplayName
                        name={f.profileName || f.username}
                        role={f.role}
                        badgeSize="xs"
                      />
                      <span className="book-friends-status">
                        {STATUS_LABELS[f.status] || f.status}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSummaryView;
