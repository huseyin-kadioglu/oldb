import React, { useState } from "react";
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
  
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInReadlist, setIsInReadlist] = useState(false);

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
    setIsFavorited(newState);

    const result = {
      bookId: book?.id,
      authorId: book?.authorId,
      actionType: "FAVOURITE",
      action: newState ? "ADD" : "DELETE",
    };

    createUserActivityFromGhostMenu(result);
  };

  const handleLike = () => {
    const newState = !isLiked;
    setIsLiked(newState);

    const result = {
      bookId: book?.id,
      authorId: book?.authorId,
      actionType: "LIKE",
      action: newState ? "ADD" : "DELETE",
    };

    createUserActivityFromGhostMenu(result);
  };

  const handleReadlist = () => {
    const newState = !isInReadlist;
    setIsInReadlist(newState);

    const result = {
      bookId: book?.id,
      authorId: book?.authorId,
      actionType: "READLIST",
      action: newState ? "ADD" : "DELETE",
    };

    createUserActivityFromGhostMenu(result);
  };

  return justShowCover == true ? (
    <div className="photo-frame">
      <img src={coverUrl} alt={book.title} className={imageClass} />
      {showTitle && <p className="title">{book.title}</p>}
      <div className="ghost-menu">
        <button onClick={handleLike}>
          {book?.liked || isLiked ? (
            <FavoriteIcon style={{ fontSize: 14 }} />
          ) : (
            <FavoriteBorderIcon style={{ fontSize: 14 }} />
          )}
        </button>

        <button onClick={handleFavorite}>
          {book.favourite || isFavorited ? (
            <StarIcon style={{ fontSize: 14 }} />
          ) : (
            <StarBorderIcon style={{ fontSize: 14 }} />
          )}
        </button>
        <button onClick={handleReadlist}>
          {book?.readlist || isInReadlist ? (
            <PlaylistAddCheckIcon style={{ fontSize: 14 }} />
          ) : (
            <PlaylistAddIcon style={{ fontSize: 14 }} />
          )}
        </button>
      </div>
    </div>
  ) : (
    <div className="photo-frame">
      <Link to={`/book/${book.id}`} state={{ book }}>
        <img src={coverUrl} alt={book.title} className={imageClass} />
      </Link>
      {showTitle && <p className="title">{book.title}</p>}
      <div className="ghost-menu">
        <button onClick={handleLike}>
          {book.liked || isLiked ? (
            <FavoriteIcon style={{ fontSize: 14 }} />
          ) : (
            <FavoriteBorderIcon style={{ fontSize: 14 }} />
          )}
        </button>
        <button onClick={handleFavorite}>
          {book.favourite || isFavorited ? (
            <StarIcon style={{ fontSize: 14 }} />
          ) : (
            <StarBorderIcon style={{ fontSize: 14 }} />
          )}
        </button>
        <button onClick={handleReadlist}>
          {book.inReadList || isInReadlist ? (
            <PlaylistAddCheckIcon style={{ fontSize: 14 }} />
          ) : (
            <PlaylistAddIcon style={{ fontSize: 14 }} />
          )}
        </button>
      </div>
    </div>
  );
};

export default PhotoFrame;
