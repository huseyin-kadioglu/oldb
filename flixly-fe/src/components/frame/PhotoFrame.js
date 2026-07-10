import React, { useEffect, useState } from "react";
import "./PhotoFrame.css";
import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CoverImage from "../ui/CoverImage";
import { createUserActivityFromGhostMenu } from "../../service/APIService";

const PhotoFrame = ({
  book,
  className,
  showTitle = true,
  showYear = false,
  justShowCover = false,
  showGhostMenu = true,
}) => {
  const [isLiked, setIsLiked] = useState(!!book?.liked);
  const [isInShopping, setIsInShopping] = useState(!!book?.inShopping);
  const [isInLibrary, setIsInLibrary] = useState(!!book?.inLibrary);
  const [isRead, setIsRead] = useState(!!book?.read);

  useEffect(() => {
    setIsLiked(!!book?.liked);
    setIsInShopping(!!book?.inShopping);
    setIsInLibrary(!!book?.inLibrary);
    setIsRead(!!book?.read);
  }, [book]);

  const imageClass = className ? className : "cover";

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
      <button
        onClick={(e) => { e.preventDefault(); handleAction("LIBRARY", isInLibrary, setIsInLibrary); }}
        data-active={isInLibrary}
        aria-label={isInLibrary ? "Kütüphanemde" : "Kütüphaneme ekle"}
        title={isInLibrary ? "Kütüphanemde (sahibim)" : "Kütüphaneme ekle — sahip olduğum kitap"}
      >
        {isInLibrary
          ? <LibraryBooksIcon style={{ fontSize: 16 }} />
          : <LibraryAddIcon style={{ fontSize: 16 }} />}
      </button>

      <button
        onClick={(e) => { e.preventDefault(); handleAction("READ", isRead, setIsRead); }}
        data-active={isRead}
        aria-label="Okudum"
        title="Okudum"
      >
        {isRead
          ? <MenuBookIcon style={{ fontSize: 16 }} />
          : <MenuBookOutlinedIcon style={{ fontSize: 16 }} />}
      </button>

      <button
        onClick={(e) => { e.preventDefault(); handleAction("SHOPPING", isInShopping, setIsInShopping); }}
        data-active={isInShopping}
        aria-label={isInShopping ? "Alınacaklarda" : "Alışveriş listesine ekle"}
        title={isInShopping ? "Alınacaklarda" : "Alışveriş listesine ekle — alınacak kitap"}
      >
        {isInShopping
          ? <ShoppingCartIcon style={{ fontSize: 16 }} />
          : <ShoppingCartOutlinedIcon style={{ fontSize: 16 }} />}
      </button>

      <button
        onClick={(e) => { e.preventDefault(); handleAction("LIKE", isLiked, setIsLiked); }}
        data-active={isLiked}
        aria-label="Beğen"
        title="Beğen"
      >
        {isLiked
          ? <FavoriteIcon style={{ fontSize: 16 }} />
          : <FavoriteBorderIcon style={{ fontSize: 16 }} />}
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
    </div>
  );

  const cover = (
    <CoverImage src={book.coverUrl} alt={book.title} className={imageClass} />
  );

  return justShowCover === true ? (
    <div className="photo-frame">
      {cover}
      {titleBlock}
      {ghostButtons}
    </div>
  ) : (
    <div className="photo-frame">
      <Link to={`/book/${book.id}`} state={{ book }}>
        {cover}
      </Link>
      {titleBlock}
      {ghostButtons}
    </div>
  );
};

export default PhotoFrame;
