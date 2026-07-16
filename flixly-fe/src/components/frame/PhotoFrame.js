import React, { useEffect, useState } from "react";
import "./PhotoFrame.css";
import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CoverImage from "../ui/CoverImage";
import SelectedBookDialog from "../common/SelectedBookDialog";
import { createUserActivityFromGhostMenu } from "../../service/APIService";
import COPY from "../../copy";

const formatStarRow = (avg) => {
  const n = Math.max(0, Math.min(5, Number(avg) || 0));
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
};

const formatRatingValue = (avg) => {
  const n = Number(avg);
  if (!n || n <= 0) return null;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

const formatCompactCount = (raw) => {
  const num = Number(raw) || 0;
  if (num <= 0) return null;
  if (num < 1000) return String(num);
  if (num < 10000) {
    const k = num / 1000;
    const text = k.toFixed(1).replace(/\.0$/, "");
    return `${text}k`;
  }
  return `${Math.round(num / 1000)}k`;
};

const formatReaderLabel = (raw) => {
  const compact = formatCompactCount(raw);
  if (!compact) return null;
  return `👁 ${compact} okudu`;
};

const PhotoFrame = ({
  book,
  className,
  showTitle = true,
  showYear = false,
  showMeta = false,
  showAuthor = false,
  justShowCover = false,
  showGhostMenu = true,
}) => {
  const token = sessionStorage.getItem("token");
  const [isLiked, setIsLiked] = useState(!!book?.liked);
  const [isInLibrary, setIsInLibrary] = useState(!!book?.inLibrary);
  const [isRead, setIsRead] = useState(!!book?.read);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    setIsLiked(!!book?.liked);
    setIsInLibrary(!!book?.inLibrary);
    setIsRead(!!book?.read);
  }, [book]);

  const imageClass = className ? className : "cover";

  if (!book) {
    return <div>Kitap verisi yok</div>;
  }

  const requireAuth = () => {
    if (!token) {
      alert("Bu işlem için giriş yapın.");
      return false;
    }
    return true;
  };

  const toggleGhost = (actionType, current, setState) => {
    if (!requireAuth()) return;
    const next = !current;
    createUserActivityFromGhostMenu({
      bookId: book.id,
      authorId: book.authorId,
      actionType,
      action: next ? "ADD" : "REMOVE",
    });
    setState(next);
  };

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDetailLog = (e) => {
    stop(e);
    if (!requireAuth()) return;
    setDetailOpen(true);
  };

  const quickBar = showGhostMenu && (
    <div className="qa-bar">
      <button
        type="button"
        className="qa-btn"
        data-active={isLiked}
        title="Beğen"
        aria-label="Beğen"
        onClick={(e) => {
          stop(e);
          toggleGhost("LIKE", isLiked, setIsLiked);
        }}
      >
        {isLiked ? <FavoriteIcon fontSize="inherit" /> : <FavoriteBorderIcon fontSize="inherit" />}
      </button>

      <button
        type="button"
        className="qa-btn"
        data-active={isInLibrary}
        title="Kütüphaneye ekle"
        aria-label="Kütüphaneye ekle"
        onClick={(e) => {
          stop(e);
          toggleGhost("LIBRARY", isInLibrary, setIsInLibrary);
        }}
      >
        {isInLibrary ? <LibraryBooksIcon fontSize="inherit" /> : <LibraryAddIcon fontSize="inherit" />}
      </button>

      <button
        type="button"
        className="qa-btn"
        data-active={isRead}
        title="Okundu"
        aria-label="Okundu"
        onClick={(e) => {
          stop(e);
          toggleGhost("READ", isRead, setIsRead);
        }}
      >
        {isRead ? <CheckCircleIcon fontSize="inherit" /> : <CheckCircleOutlineIcon fontSize="inherit" />}
      </button>

      <button
        type="button"
        className="qa-btn"
        title={COPY.book.detailSave}
        aria-label={COPY.book.detailSave}
        onClick={handleDetailLog}
      >
        <MoreHorizIcon fontSize="inherit" />
      </button>
    </div>
  );

  const ratingValue = formatRatingValue(book.averageRating);
  const readerLabel = formatReaderLabel(book.readCount ?? book.howManyPplRead ?? 0);
  const isEditorPick = !!(book.isEditorChoice || book.editorChoice);
  const showEditorBadge = showMeta && isEditorPick;

  const metaBlock = showMeta && (ratingValue || readerLabel) && (
    <div className="frame-meta">
      {ratingValue && (
        <div className="frame-rating" aria-label={`${ratingValue} ortalama`}>
          <span className="frame-rating-stars" aria-hidden="true">
            {formatStarRow(book.averageRating)}
          </span>
          <span className="frame-rating-val">{ratingValue}</span>
        </div>
      )}
      {readerLabel && <p className="frame-readers">{readerLabel}</p>}
    </div>
  );

  const yearBlock = showYear && !showMeta && book.publicationYear > 0 && (
    <Link
      to={`/books/year/${book.publicationYear}`}
      className="frame-year-link"
      onClick={(e) => e.stopPropagation()}
    >
      {book.publicationYear}
    </Link>
  );

  const titleBlock = showTitle && (
    <div className="frame-title-wrap">
      <p className="title">{book.title}</p>
      {showAuthor && book.authorName && (
        <p className="frame-author">{book.authorName}</p>
      )}
      {metaBlock}
      {yearBlock}
      {!showMeta && book?.averageRating > 0 && (
        <div className="frame-rating">
          <span className="frame-rating-star">★</span>
          <span className="frame-rating-val">{Number(book.averageRating).toFixed(1)}</span>
          {book.ratingCount > 0 && (
            <span className="frame-rating-count">({book.ratingCount})</span>
          )}
        </div>
      )}
    </div>
  );

  const cover = (
    <CoverImage src={book.coverUrl} alt={book.title} className={imageClass} />
  );

  return (
    <div className={`photo-frame${showMeta ? " photo-frame--rich" : ""}`}>
      <div className="frame-cover-wrap">
        {justShowCover === true ? (
          cover
        ) : (
          <Link to={`/book/${book.id}`} state={{ book }} className="frame-cover-link">
            {cover}
          </Link>
        )}
        {showEditorBadge && (
          <span className="frame-editor-badge" aria-label="Editörün Önerisi">
            ⭐ Editörün Önerisi
          </span>
        )}
        {quickBar}
      </div>
      {titleBlock}

      {detailOpen && (
        <SelectedBookDialog
          open
          selectedBook={book}
          selectedBookHandler={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
};

export default PhotoFrame;
