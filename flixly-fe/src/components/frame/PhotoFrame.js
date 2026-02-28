import React, { useEffect, useState } from "react";
import "./PhotoFrame.css";
import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { createUserActivityFromGhostMenu } from "../../service/APIService";

const PhotoFrame = ({
  book,
  className,
  showTitle = true,
  justShowCover = false,
  showGhostMenu = true,
}) => {
  // BookDto JSON field names: isLiked→liked | isInReadList→inReadList | isInLibrary→inLibrary
  const [isLiked, setIsLiked] = useState(!!book?.liked);
  const [isInReadlist, setIsInReadlist] = useState(!!book?.inReadList);
  const [isInLibrary, setIsInLibrary] = useState(!!book?.inLibrary);

  useEffect(() => {
    setIsLiked(!!book?.liked);
    setIsInReadlist(!!book?.inReadList);
    setIsInLibrary(!!book?.inLibrary);
  }, [book]);

  const imageClass = className ? className : "cover";

  const coverUrl =
    book?.coverUrl === undefined || book?.coverUrl === null
      ? "https://www.ledr.com/colours/white.jpg"
      : book.coverUrl;

  if (!book) {
    return <div>Kitap verisi yok</div>;
  }

  const handleAction = (actionType, currentState, setState) => {
    const newState = !currentState;
    createUserActivityFromGhostMenu({
      bookId: book?.id,
      authorId: book?.authorId,
      actionType,
      action: newState ? "ADD" : "REMOVE",
    });
    setState(newState);
  };

  const ghostButtons = showGhostMenu && (
    <div className="ghost-menu">
      {/* Beğen */}
      <button
        onClick={(e) => { e.preventDefault(); handleAction("LIKE", isLiked, setIsLiked); }}
        data-active={isLiked}
        aria-label="Beğen"
      >
        {isLiked
          ? <FavoriteIcon style={{ fontSize: 16 }} />
          : <FavoriteBorderIcon style={{ fontSize: 16 }} />}
      </button>

      {/* Kütüphaneye ekle */}
      <button
        onClick={(e) => { e.preventDefault(); handleAction("LIBRARY", isInLibrary, setIsInLibrary); }}
        data-active={isInLibrary}
        aria-label="Kütüphaneye ekle"
      >
        {isInLibrary
          ? <LibraryBooksIcon style={{ fontSize: 16 }} />
          : <LibraryAddIcon style={{ fontSize: 16 }} />}
      </button>

      {/* Okuma listesine ekle */}
      <button
        onClick={(e) => { e.preventDefault(); handleAction("READLIST", isInReadlist, setIsInReadlist); }}
        data-active={isInReadlist}
        aria-label="Okuma listesine ekle"
      >
        {isInReadlist
          ? <BookmarkIcon style={{ fontSize: 16 }} />
          : <BookmarkBorderIcon style={{ fontSize: 16 }} />}
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
      {ratingBlock}
    </div>
  );

  return justShowCover === true ? (
    <div className="photo-frame">
      <img src={coverUrl} alt={book.title} className={imageClass} />
      {titleBlock}
      {ghostButtons}
    </div>
  ) : (
    <div className="photo-frame">
      <Link to={`/book/${book.id}`} state={{ book }}>
        <img src={coverUrl} alt={book.title} className={imageClass} />
      </Link>
      {titleBlock}
      {ghostButtons}
    </div>
  );
};

export default PhotoFrame;
