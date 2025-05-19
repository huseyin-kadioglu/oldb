import { useEffect, useState } from "react";
import "./BookSummaryView.css";
import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import { createUserActivityFromGhostMenu } from "../../service/APIService";

const BookSummaryTitleDescAndLog = ({ book, author }) => {
  const [isFavorited, setIsFavorited] = useState(book?.favourite);
  const [isLiked, setIsLiked] = useState(book?.like);
  const [isInReadlist, setIsInReadlist] = useState(book?.readList);

  useEffect(() => {
    setIsFavorited(book?.favourite);
    setIsLiked(book?.like);
    setIsInReadlist(book?.readList);
  }, [book?.favourite, book?.like, book?.readList]);

  const handleFavorite = () => {
    const newState = !isFavorited;
    setIsFavorited(newState);

    const result = {
      bookId: book?.id,
      authorId: book?.authorId,
      actionType: "FAVOURITE",
      action: newState ? "ADD" : "REMOVE",
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
      action: newState ? "ADD" : "REMOVE",
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
      action: newState ? "ADD" : "REMOVE",
    };

    createUserActivityFromGhostMenu(result);
  };

  return (
    <div className="container">
      <div className="title">
        <span className="book-title">{book.title}</span>
        <span className="book-year">
          <Link
            className="book-author"
            to={`/books/year/${book.publicationYear}`}
          >
            {book.publicationYear}
          </Link>
        </span>
        <span className="book-written-by"> Written by </span>
        <span className="author">
          <Link
            className="book-author"
            to={`/author/${book.authorId}`}
            state={{ author }}
          >
            {author.name}
          </Link>
        </span>
      </div>
      <div className="details-and-actions">
        <div className="desc-and-detail-card">
          <span className="desc">
            <p>{book.description}</p>
          </span>
          <div className="detail-card">
            <ul>
              <li>
                <span>Publisher</span>
                <p>İş Bankası Kültür Yayınları</p>
              </li>
              <li>
                <span>Publication Year</span>
                <p>2014</p>
              </li>
              <li>
                <span>Çevirmen</span>
                <p>Levent Cinemre</p>
              </li>
              <li>
                <span>Sayfa Sayısı</span>
                <p>524</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="action-menu">
          <aside>
            <ul>
              <li onClick={handleLike}>
                {book?.liked || isLiked ? (
                  <FavoriteIcon style={{ fontSize: 25 }} />
                ) : (
                  <FavoriteBorderIcon style={{ fontSize: 25 }} />
                )}
                <span>Read</span>
              </li>
              <li onClick={handleFavorite}>
                {book?.favourite || isFavorited ? (
                  <StarIcon style={{ fontSize: 25 }} />
                ) : (
                  <StarBorderIcon style={{ fontSize: 25 }} />
                )}
                <span>Favourite</span>
              </li>
              <li onClick={handleReadlist}>
                {book?.readlist || isInReadlist ? (
                  <PlaylistAddCheckIcon style={{ fontSize: 25 }} />
                ) : (
                  <PlaylistAddIcon style={{ fontSize: 25 }} />
                )}
                <span>Readlist</span>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
};
export default BookSummaryTitleDescAndLog;
