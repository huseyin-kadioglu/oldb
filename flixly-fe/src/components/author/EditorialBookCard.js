import { Link } from "react-router-dom";
import CoverImage from "../ui/CoverImage";
import "./EditorialBookCard.css";

/**
 * Kompakt editoryal keşif kartı — kapak + başlık + kısa açıklama.
 */
const EditorialBookCard = ({
  title,
  subtitle,
  book,
  blurb,
  eyebrow,
  badge,
}) => {
  if (!book?.id) return null;

  return (
    <article className={`editorial-book-card${badge ? " has-badge" : ""}`}>
      {badge && <span className="editorial-book-card__badge">{badge}</span>}
      {eyebrow && <p className="editorial-book-card__eyebrow">{eyebrow}</p>}
      <h3 className="editorial-book-card__title">{title}</h3>
      {subtitle && <p className="editorial-book-card__subtitle">{subtitle}</p>}
      <Link
        to={`/book/${book.id}`}
        state={{ book }}
        className="editorial-book-card__body"
      >
        <CoverImage
          src={book.coverUrl}
          alt={book.title}
          className="editorial-book-card__cover"
        />
        <div className="editorial-book-card__meta">
          <p className="editorial-book-card__book-title">{book.title}</p>
          {blurb && <p className="editorial-book-card__blurb">{blurb}</p>}
          {(book.averageRating > 0 || book.publicationYear > 0) && (
            <p className="editorial-book-card__facts">
              {book.averageRating > 0 && (
                <span>
                  ★{" "}
                  {Number.isInteger(book.averageRating)
                    ? book.averageRating
                    : Number(book.averageRating).toFixed(1).replace(".", ",")}
                </span>
              )}
              {book.averageRating > 0 && book.publicationYear > 0 && (
                <span aria-hidden="true"> · </span>
              )}
              {book.publicationYear > 0 && <span>{book.publicationYear}</span>}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
};

export default EditorialBookCard;
