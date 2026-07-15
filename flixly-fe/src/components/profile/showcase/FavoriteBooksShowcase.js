import { Link } from "react-router-dom";
import CoverImage from "../../ui/CoverImage";
import VitrineShell from "./VitrineShell";
import { SHOWCASE_TYPE, VITRINE_COPY } from "./showcaseConstants";

const FavoriteBooksShowcase = ({
  item,
  isOwnProfile,
  showActions,
  busy,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const books = Array.isArray(item.books) ? item.books : [];
  const title = item.title || VITRINE_COPY.defaultFavoriteTitle;

  if (books.length === 0) {
    if (!isOwnProfile) return null;
    return (
      <VitrineShell
        type={SHOWCASE_TYPE.FAVORITE_BOOKS}
        title={title}
        description={item.description}
        showActions={showActions}
        busy={busy}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onEdit={onEdit}
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        className="ps-vitrine-card--favorites"
        motion="lift"
      >
        <p className="ps-fav-empty-msg">{VITRINE_COPY.favEmptyOwn}</p>
        <button type="button" className="profile-btn profile-btn--subtle" onClick={onEdit} disabled={busy}>
          {VITRINE_COPY.favEditCta}
        </button>
      </VitrineShell>
    );
  }

  return (
    <VitrineShell
      type={SHOWCASE_TYPE.FAVORITE_BOOKS}
      title={title}
      description={item.description}
      showActions={showActions}
      busy={busy}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      onEdit={onEdit}
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      className="ps-vitrine-card--favorites"
      motion="lift"
    >
      <div className="ps-fav-rail">
        {books.map((book) => (
          <Link
            key={book.bookId}
            to={`/book/${book.bookId}`}
            className="ps-fav-item"
            title={`${book.title || ""}${book.authorName ? ` — ${book.authorName}` : ""}`}
          >
            <CoverImage
              src={book.coverUrl}
              alt={book.title || ""}
              className="ps-fav-cover folios-interactive-cover"
            />
            <span className="ps-fav-hover">
              <span className="ps-fav-book-title">{book.title}</span>
              {book.authorName && <span className="ps-fav-book-author">{book.authorName}</span>}
            </span>
          </Link>
        ))}
      </div>
    </VitrineShell>
  );
};

export default FavoriteBooksShowcase;
