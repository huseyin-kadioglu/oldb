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

const PhotoFrame = ({
  book,
  className,
  showTitle = true,
  showYear = false,
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
        title="Detaylı log"
        aria-label="Detaylı log"
        onClick={handleDetailLog}
      >
        <MoreHorizIcon fontSize="inherit" />
      </button>
    </div>
  );

  const ratingBlock = book?.averageRating > 0 && (
    <div className="frame-rating">
      <span className="frame-rating-star">★</span>
      <span className="frame-rating-val">{Number(book.averageRating).toFixed(1)}</span>
      {book.ratingCount > 0 && (
        <span className="frame-rating-count">({book.ratingCount})</span>
      )}
    </div>
  );

  const titleBlock = showTitle && (
    <div className="frame-title-wrap">
      <p className="title">{book.title}</p>
      {showYear && book.publicationYear > 0 && (
        <Link
          to={`/books/year/${book.publicationYear}`}
          className="frame-year-link"
          onClick={(e) => e.stopPropagation()}
        >
          {book.publicationYear}
        </Link>
      )}
      {ratingBlock}
      {isRead && <span className="frame-logged-chip">Logged</span>}
    </div>
  );

  const cover = (
    <CoverImage src={book.coverUrl} alt={book.title} className={imageClass} />
  );

  return (
    <div className="photo-frame">
      <div className="frame-cover-wrap">
        {justShowCover === true ? (
          cover
        ) : (
          <Link to={`/book/${book.id}`} state={{ book }} className="frame-cover-link">
            {cover}
          </Link>
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
