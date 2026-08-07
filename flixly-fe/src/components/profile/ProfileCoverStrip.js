import { Link } from "react-router-dom";
import CoverImage from "../ui/CoverImage";
import "./ProfileCoverStrip.css";

const ProfileCoverStrip = ({
  books = [],
  limit = 10,
  loading = false,
  skeletonCount = 6,
  showHoverMeta = true,
  singleRow = false,
}) => {
  if (loading) {
    return (
      <div className={`pcs-strip${singleRow ? " pcs-strip--row" : ""}`} aria-hidden="true">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div className="pcs-item pcs-skeleton" key={i} />
        ))}
      </div>
    );
  }

  const items = (books || []).filter((b) => b && (b.id || b.bookId)).slice(0, limit);
  if (!items.length) return null;

  return (
    <div className={`pcs-strip${singleRow ? " pcs-strip--row" : ""}`}>
      {items.map((book) => {
        const id = book.id || book.bookId;
        const title = book.title || book.bookTitle || "";
        const author = book.authorName || "";
        return (
          <Link
            key={id}
            to={`/book/${id}`}
            state={{ book }}
            className="pcs-item"
            title={title}
          >
            <CoverImage
              src={book.coverUrl}
              alt={title}
              className="pcs-img"
            />
            {showHoverMeta && (
              <div className="pcs-hover">
                <span className="pcs-hover-title">{title || "Kitap"}</span>
                {author && <span className="pcs-hover-author">{author}</span>}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default ProfileCoverStrip;
