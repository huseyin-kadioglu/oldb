import PhotoFrame from "../frame/PhotoFrame";
import "./folios-ui.css";

const formatCardRating = (avg) => {
  const n = Number(avg);
  if (!n || n <= 0) return null;
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
};

const BookCoverCard = ({ book, showAuthor = true, showRating = false }) => {
  if (!book) return null;
  const ratingLabel = showRating ? formatCardRating(book.averageRating) : null;

  return (
    <div className="folios-book-card">
      <PhotoFrame book={book} showTitle={false} showGhostMenu />
      <p className="folios-book-card-title">{book.title}</p>
      {showAuthor && (
        <p className="folios-book-card-author">{book.authorName || "—"}</p>
      )}
      {ratingLabel && (
        <p className="folios-book-card-rating" aria-label={`Topluluk puanı ${ratingLabel}`}>
          ★ {ratingLabel}
        </p>
      )}
    </div>
  );
};

export default BookCoverCard;
