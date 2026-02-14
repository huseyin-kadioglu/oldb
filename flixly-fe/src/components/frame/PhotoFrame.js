import React, { useEffect, useState } from "react";
import "./PhotoFrame.css";
import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import { createUserActivityFromGhostMenu } from "../../service/APIService";

const PhotoFrame = ({
  book,
  className,
  showTitle = true,
  justShowCover = false,
  showGhostMenu = true,
}) => {
  const [isFavorited, setIsFavorited] = useState(book?.favourite);
  const [isLiked, setIsLiked] = useState(book?.like);
  const [isInReadlist, setIsInReadlist] = useState(book?.readList);

  useEffect(() => {
    setIsFavorited(book?.favourite);
    setIsLiked(book?.like);
    setIsInReadlist(book?.readList);
  }, [book]);

  const imageClass = className ? className : "cover";

  const coverUrl =
    book?.coverUrl === undefined || book?.coverUrl === null
      ? "https://www.ledr.com/colours/white.jpg"
      : book.coverUrl;

  if (!book) {
    return <div>Kitap verisi yok</div>;
  }

  const handleFavorite = () => {
    const newState = !isFavorited;

    const result = {
      bookId: book?.id,
      authorId: book?.authorId,
      actionType: "FAVOURITE",
      action: newState ? "ADD" : "REMOVE",
    };

    console.log("result", result);
    createUserActivityFromGhostMenu(result);
    setIsFavorited(newState);
  };

  const handleLike = () => {
    const newState = !isLiked;

    const result = {
      bookId: book?.id,
      authorId: book?.authorId,
      actionType: "LIKE",
      action: newState ? "ADD" : "REMOVE",
    };
    console.log("result", result);

    createUserActivityFromGhostMenu(result);
    setIsLiked(newState);
  };

  const handleReadlist = () => {
    const newState = !isInReadlist;
    console.log("newState", newState);

    const result = {
      bookId: book?.id,
      authorId: book?.authorId,
      actionType: "READLIST",
      action: newState ? "ADD" : "REMOVE",
    };
    console.log("result", result);

    createUserActivityFromGhostMenu(result);
    setIsInReadlist(newState);
  };

  const ghostButtons = showGhostMenu && (
    <div className="ghost-menu">
      <button onClick={(e) => { e.preventDefault(); handleLike(); }} data-active={book?.liked || isLiked} aria-label="Beğen">
        {book?.liked || isLiked ? <FavoriteIcon style={{ fontSize: 16 }} /> : <FavoriteBorderIcon style={{ fontSize: 16 }} />}
      </button>
      <button onClick={(e) => { e.preventDefault(); handleFavorite(); }} data-active={book?.favourite || isFavorited} aria-label="Favori">
        {book?.favourite || isFavorited ? <StarIcon style={{ fontSize: 16 }} /> : <StarBorderIcon style={{ fontSize: 16 }} />}
      </button>
      <button onClick={(e) => { e.preventDefault(); handleReadlist(); }} data-active={book?.readList || isInReadlist} aria-label="Okuma listesi">
        {book?.readList || isInReadlist ? <PlaylistAddCheckIcon style={{ fontSize: 16 }} /> : <PlaylistAddIcon style={{ fontSize: 16 }} />}
      </button>
    </div>
  );

  const titleBlock = showTitle && (
    <div className="frame-title-wrap">
      <p className="title">{book.title}</p>
    </div>
  );

  return justShowCover == true ? (
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
