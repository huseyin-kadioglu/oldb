import { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Rating } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CoverImage from "../ui/CoverImage";
import SectionHeader from "../ui/SectionHeader";
import BookCoverCard from "../ui/BookCoverCard";
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
import "../ui/folios-ui.css";
import "./BookSummaryView.css";

const STATUS_LABELS = {
  READ: "Okundu",
  COMPLETED: "Okundu",
  READLIST: "Okuma listesinde",
  LIBRARY: "Kütüphanemde",
  LIKE: "Beğendi",
  SHOPPING: "Alınacaklarda",
  DROPPED: "Bırakıldı",
};

const reviewStars = (rating) => {
  const n = Number(rating) || 0;
  if (n <= 0) return null;
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
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
  const [social, setSocial] = useState({
    friendsReading: [],
    topReviews: [],
    authorOtherBooks: [],
  });
  const [friendsOpen, setFriendsOpen] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isInReadlist, setIsInReadlist] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isInShopping, setIsInShopping] = useState(false);
  const [isDropped, setIsDropped] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isLoggedIn = !!sessionStorage.getItem("token");

  const syncBookFlags = useCallback((b) => {
    if (!b) return;
    const flag = (...keys) => keys.some((k) => !!b[k]);
    setIsLiked(flag("liked", "isLiked"));
    setIsRead(flag("read", "isRead"));
    setIsInReadlist(flag("inReadList", "isInReadList"));
    setIsInLibrary(flag("inLibrary", "isInLibrary"));
    setIsInShopping(flag("inShopping", "isInShopping"));
    setIsDropped(flag("dropped", "isDropped"));
  }, []);

  const applyLocalFlag = (actionType, next) => {
    switch (actionType) {
      case "LIKE":
        setIsLiked(next);
        break;
      case "READ":
        setIsRead(next);
        if (next) {
          setIsInReadlist(false);
          setIsDropped(false);
        }
        break;
      case "READLIST":
        setIsInReadlist(next);
        if (next) {
          setIsRead(false);
          setIsDropped(false);
        }
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
          if (found.rating != null) setUserRating(found.rating);
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

  if (loading) return <div className="page-loading">Yükleniyor…</div>;
  if (!book) return <div className="page-error">Kitap bulunamadı.</div>;
  if (error) return <div className="page-error">{error}</div>;

  const friendsReading = social.friendsReading || [];
  const topReviews = social.topReviews || [];
  const authorOtherBooks =
    social.authorOtherBooks?.length > 0
      ? social.authorOtherBooks
      : books
          .filter((b) => b.id !== book?.id && b.authorId === book?.authorId)
          .slice(0, 12);
  const hasSocialSignal = friendsReading.length > 0 || topReviews.length > 0;

  const ratingDistribution = Array.isArray(book?.ratingDistribution) && book.ratingDistribution.length === 5
    ? book.ratingDistribution
    : [0, 0, 0, 0, 0];
  const hasRatingBars = ratingDistribution.some((v) => v > 0);
  const authorData = author?.name ? author : { name: book.authorName };
  const activeStatuses = [
    isRead && "READ",
    isInReadlist && "READLIST",
    isInLibrary && "LIBRARY",
    isInShopping && "SHOPPING",
    isDropped && "DROPPED",
  ].filter(Boolean);

  return (
    <div className="book-page">
      <button type="button" className="folios-back-link" onClick={() => navigate(-1)}>
        <ArrowBackIcon fontSize="small" /> Geri
      </button>

      <header className="book-page-header">
        <div className="book-page-cover-wrap">
          <CoverImage src={book.coverUrl} alt={book.title} className="book-page-cover-img" />
          <div className="book-page-cover-stats">
            <span>
              <FavoriteIcon fontSize="inherit" /> {book.howManyPplLiked ?? 0}
            </span>
            <span>
              <BookmarkAddedIcon fontSize="inherit" /> {book.howManyPplAddedToReadList ?? 0}
            </span>
            {(book.howManyPplDropped ?? 0) > 0 && (
              <span>
                <DoNotDisturbAltIcon fontSize="inherit" /> {book.howManyPplDropped}
              </span>
            )}
          </div>
        </div>

        <div className="book-page-info">
          {book.wonNobelPrize && <span className="book-award-badge">Nobel Ödüllü</span>}
          {book.isEditorChoice && <span className="book-award-badge">Editörün Seçimi</span>}
          {book.isWeeklyPick && <span className="book-award-badge weekly">Haftanın Kitabı</span>}
          {book.isNewRelease && <span className="book-award-badge new">Yeni Çıkan</span>}

          <div className="book-page-title-row">
            <h1 className="book-page-title">{book.title}</h1>
            {book.publicationYear > 0 && (
              <Link
                to={`/books/year/${book.publicationYear}`}
                className="book-page-year"
                title={`${book.publicationYear} yılında çıkan kitaplar`}
              >
                {book.publicationYear}
              </Link>
            )}
          </div>

          {book.originalTitle && (
            <p className="book-page-original-title">{book.originalTitle}</p>
          )}

          <p className="book-page-byline">
            <span className="book-page-byline-label">Yazan</span>{" "}
            <Link
              to={`/author/${book.authorId}`}
              state={{ author: authorData }}
              className="book-page-author"
            >
              {authorData.name}
            </Link>
            {authorData.country && (
              <span className="book-page-author-country"> · {authorData.country}</span>
            )}
          </p>

          {book.averageRating > 0 && (
            <div className="book-page-rating-row">
              <span className="book-page-stars">
                {"★".repeat(Math.round(book.averageRating || 0))}
                {"☆".repeat(5 - Math.round(book.averageRating || 0))}
              </span>
              <span className="book-page-rating-val">{Number(book.averageRating).toFixed(1)}</span>
              {book.ratingCount > 0 && (
                <span className="book-page-rating-count">{book.ratingCount} puan</span>
              )}
            </div>
          )}

          {book.pageCount > 0 && (
            <div className="book-page-meta-tags">
              <span>{book.pageCount} sayfa</span>
            </div>
          )}

          {book.genres && (
            <div className="book-page-meta-tags">
              {String(book.genres)
                .split(",")
                .map((g) => g.trim())
                .filter(Boolean)
                .slice(0, 6)
                .map((g) => (
                  <span key={g}>{g}</span>
                ))}
            </div>
          )}

          {book.description && (
            <p className="book-page-synopsis">{book.description}</p>
          )}

          {activeStatuses.length > 0 && (
            <div className="book-status-badges">
              {activeStatuses.map((s) => (
                <span key={s} className={`book-status-badge status-${s.toLowerCase()}`}>
                  {STATUS_LABELS[s]}
                </span>
              ))}
            </div>
          )}
        </div>

        <aside className="book-action-panel">
          <div className="book-action-icons">
            <button
              type="button"
              className={`book-panel-icon ${isRead ? "active" : ""}`}
              disabled={actionLoading}
              onClick={() => handleGhostAction("READ", isRead)}
              title={isRead ? "Okundu" : "Okundu işaretle"}
            >
              {isRead ? <MenuBookIcon /> : <MenuBookOutlinedIcon />}
              <span>{isRead ? "Okundu" : "Okunmadı"}</span>
            </button>
            <button
              type="button"
              className={`book-panel-icon ${isLiked ? "active liked" : ""}`}
              disabled={actionLoading}
              onClick={() => handleGhostAction("LIKE", isLiked)}
              title="Beğen"
            >
              {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              <span>Beğen</span>
            </button>
            <button
              type="button"
              className={`book-panel-icon ${isInShopping ? "active" : ""}`}
              disabled={actionLoading}
              onClick={() => handleGhostAction("SHOPPING", isInShopping)}
              title={isInShopping ? "Alınacaklarda" : "Alışveriş listesine ekle"}
            >
              {isInShopping ? <ShoppingCartIcon /> : <ShoppingCartOutlinedIcon />}
              <span>{isInShopping ? "Alınacak" : "Alınacaklar"}</span>
            </button>
          </div>

          <div className="book-panel-rating">
            <span className="book-panel-rating-label">
              {userRating > 0 ? `Puanın · ${userRating}` : "Puanla"}
            </span>
            <div className="book-panel-stars">
              <Rating
                name="book-half-rating"
                value={userRating}
                precision={0.5}
                size="large"
                onChange={handleRate}
                disabled={!isLoggedIn || actionLoading}
                sx={{
                  "& .MuiRating-iconFilled": { color: "var(--color-accent, #d4af37)" },
                  "& .MuiRating-iconHover": { color: "#e8c547" },
                  "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.18)" },
                }}
              />
            </div>
          </div>

          <div className="book-panel-links">
            <button
              type="button"
              className={`book-panel-link ${isInLibrary ? "active" : ""}`}
              disabled={actionLoading}
              onClick={() => handleGhostAction("LIBRARY", isInLibrary)}
            >
              {isInLibrary ? <LibraryBooksIcon fontSize="small" /> : <LibraryAddIcon fontSize="small" />}
              {isInLibrary ? "Kütüphanemde" : "Kütüphaneme ekle"}
            </button>
            <button
              type="button"
              className={`book-panel-link ${isDropped ? "dropped" : ""}`}
              disabled={actionLoading}
              onClick={() => handleGhostAction("DROPPED", isDropped)}
            >
              <DoNotDisturbAltIcon fontSize="small" />
              {isDropped ? "Bırakıldı" : "Bıraktım"}
            </button>
            {isLoggedIn && (
              <button
                type="button"
                className="book-panel-link"
                disabled={actionLoading}
                onClick={() => setLogOpen(true)}
              >
                <EditNoteIcon fontSize="small" />
                {COPY.book.saveReview}
              </button>
            )}
            <button type="button" className="book-panel-link" onClick={handleShare}>
              <ShareOutlinedIcon fontSize="small" />
              {shareCopied ? "Kopyalandı" : "Paylaş"}
            </button>
          </div>

          {!isLoggedIn && (
            <p className="book-page-login-hint">İşlemler için giriş yapın.</p>
          )}

          <div className="book-panel-ratings">
            <div className="book-panel-ratings-head">
              <span>PUANLAR</span>
              {book.averageRating > 0 && (
                <strong>{Number(book.averageRating).toFixed(1)}</strong>
              )}
            </div>
            {hasRatingBars ? (
              <div className="book-panel-bars">
                {[5, 4, 3, 2, 1].map((stars, i) => (
                  <div className="book-panel-bar-row" key={stars}>
                    <span>{stars}</span>
                    <div className="book-panel-bar">
                      <div style={{ width: `${ratingDistribution[i]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="book-page-login-hint">Henüz puan yok.</p>
            )}
          </div>
        </aside>
      </header>

      <div className="page-layout">
        <main className="page-main">
          {book.adminNotes && (
            <section className="book-page-section">
              <div className="book-admin-notes folios-card">{book.adminNotes}</div>
            </section>
          )}

          {hasSocialSignal ? (
            <>
              {friendsReading.length > 0 && (
                <section className="book-page-section">
                  <SectionHeader
                    title="Arkadaşlarından okuyanlar"
                    linkLabel={`${friendsReading.length} kişi`}
                    onLinkClick={() => setFriendsOpen(true)}
                  />
                  <button
                    type="button"
                    className="book-friends-strip"
                    onClick={() => setFriendsOpen(true)}
                    aria-label="Arkadaş listesini aç"
                  >
                    {friendsReading.slice(0, 10).map((f) => (
                      <span key={f.userId} className="book-friends-avatar" title={f.profileName || f.username}>
                        <InitialAvatar name={f.profileName || f.username} src={f.avatarUrl} />
                      </span>
                    ))}
                    {friendsReading.length > 10 && (
                      <span className="book-friends-more">+{friendsReading.length - 10}</span>
                    )}
                  </button>
                </section>
              )}

              {topReviews.length > 0 && (
                <section className="book-page-section">
                  <SectionHeader title="En iyi incelemeler" />
                  <div className="book-hub-reviews">
                    {topReviews.map((r) => (
                      <article className="book-hub-review" key={r.activityId}>
                        <div className="book-hub-review-head">
                          {r.username ? (
                            <Link to={`/profile/${r.username}`} className="book-hub-review-user">
                              <InitialAvatar name={r.profileName || r.username} src={r.avatarUrl} />
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
                          {r.rating > 0 && (
                            <span className="book-hub-review-stars">{reviewStars(r.rating)}</span>
                          )}
                        </div>
                        {r.comment && <p className="book-hub-review-text">{r.comment}</p>}
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <p className="book-hub-empty-compact">
              Henüz arkadaş aktivitesi veya inceleme yok.
            </p>
          )}

          <section className="book-page-section">
            <CommentSection targetType="BOOK" targetId={book.id} title="Yorumlar" />
          </section>

          <section className="book-page-section">
            <SectionHeader
              title={authorData.name ? `${authorData.name} — diğer kitaplar` : "Yazarın diğer kitapları"}
              to={book.authorId ? `/author/${book.authorId}` : undefined}
              linkLabel={book.authorId ? "Yazar" : undefined}
            />
            {authorOtherBooks.length > 0 ? (
              <div className="lb-poster-row lb-poster-row--large book-author-shelf">
                {authorOtherBooks.map((b) => (
                  <div key={b.id} className="lb-popular-item">
                    <BookCoverCard book={b} showAuthor={false} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="book-page-empty">Katalogda başka kitap yok.</p>
            )}
          </section>
        </main>

        <aside className="page-sidebar">
          <div className="sidebar-block">
            <h3 className="sidebar-title">Kitap Detayları</h3>
            <dl className="book-details-list">
              {book.publicationYear > 0 && (
                <>
                  <dt>Yayın yılı</dt>
                  <dd>
                    <Link to={`/books/year/${book.publicationYear}`}>{book.publicationYear}</Link>
                  </dd>
                </>
              )}
              {book.pageCount > 0 && (
                <>
                  <dt>Sayfa</dt>
                  <dd>{book.pageCount}</dd>
                </>
              )}
              {book.originalTitle && (
                <>
                  <dt>Orijinal ad</dt>
                  <dd>{book.originalTitle}</dd>
                </>
              )}
              {authorData.name && (
                <>
                  <dt>Yazar</dt>
                  <dd>
                    <Link to={`/author/${book.authorId}`}>{authorData.name}</Link>
                  </dd>
                </>
              )}
              {authorData.country && (
                <>
                  <dt>Ülke</dt>
                  <dd>{authorData.country}</dd>
                </>
              )}
            </dl>
          </div>

          <div className="sidebar-block">
            <h3 className="sidebar-title">Topluluk</h3>
            <dl className="book-details-list">
              <dt>Beğeni</dt>
              <dd>{book.howManyPplLiked ?? 0}</dd>
              <dt>Okuma listesi</dt>
              <dd>{book.howManyPplAddedToReadList ?? 0}</dd>
              <dt>Bırakan</dt>
              <dd>{book.howManyPplDropped ?? 0}</dd>
            </dl>
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
