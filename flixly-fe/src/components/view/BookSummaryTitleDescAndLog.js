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
    <div className="book-detail-content">
      <h1 className="book-detail-title">{book.title}</h1>
      <div className="book-detail-byline">
        <div className="book-byline-row">
          <Link to={`/books/year/${book.publicationYear}`} className="book-byline-link">
            {book.publicationYear}
          </Link>
        </div>
        <div className="book-byline-row book-byline-written">Yazan</div>
        <div className="book-byline-row">
          <Link to={`/author/${book.authorId}`} state={{ author }} className="book-byline-link">
            {author?.name}
          </Link>
        </div>
      </div>

      {/* Editorial flags */}
      <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
        {book.isEditorChoice && (
          <span style={{
            fontSize: "0.85rem",
            padding: "4px 8px",
            background: "rgba(245, 197, 24, 0.2)",
            color: "var(--color-primary-button)",
            borderRadius: "4px",
            fontWeight: "600"
          }}>
            ★ Editörün Seçimi
          </span>
        )}
        {book.isWeeklyPick && (
          <span style={{
            fontSize: "0.85rem",
            padding: "4px 8px",
            background: "rgba(0, 224, 84, 0.2)",
            color: "var(--color-accent)",
            borderRadius: "4px",
            fontWeight: "600"
          }}>
            ★ Haftanın Kitabı
          </span>
        )}
        {book.isNewRelease && (
          <span style={{
            fontSize: "0.85rem",
            padding: "4px 8px",
            background: "rgba(100, 200, 255, 0.2)",
            color: "#64c8ff",
            borderRadius: "4px",
            fontWeight: "600"
          }}>
            ✦ Yeni Çıkan
          </span>
        )}
      </div>

      {book.adminNotes && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          background: "rgba(255,255,255,0.05)",
          borderLeft: "3px solid var(--color-primary-button)",
          borderRadius: "4px"
        }}>
          <p style={{ margin: "0", fontSize: "0.95rem", color: "var(--color-text-secondary)" }}>
            {book.adminNotes}
          </p>
        </div>
      )}

      {book.description && (
        <div className="book-detail-description">
          <p>{book.description}</p>
        </div>
      )}
    </div>
  );
};
export default BookSummaryTitleDescAndLog;
