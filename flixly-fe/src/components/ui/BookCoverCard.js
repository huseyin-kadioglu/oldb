import PhotoFrame from "../frame/PhotoFrame";
import "./folios-ui.css";

const BookCoverCard = ({ book, showAuthor = true }) => {
  if (!book) return null;

  return (
    <div className="folios-book-card">
      <PhotoFrame book={book} showTitle={false} showGhostMenu />
      <p className="folios-book-card-title">{book.title}</p>
      {showAuthor && (
        <p className="folios-book-card-author">{book.authorName || "—"}</p>
      )}
    </div>
  );
};

export default BookCoverCard;
