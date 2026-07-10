import { Link } from "react-router-dom";
import CoverImage from "./CoverImage";
import "../ui/folios-ui.css";
import "./ContinueReadingCard.css";

const ContinueReadingCard = ({ book }) => {
  const current = book.currentPage;
  const total = book.pageCount;
  const pct =
    book.progressPercent ??
    (current != null && total > 0 ? Math.min(100, Math.round((100 * current) / total)) : null);
  const hasProgress = current != null && current > 0;

  return (
    <Link
      to={`/book/${book.id}`}
      state={{ book }}
      className="continue-card"
    >
      <CoverImage
        src={book.coverUrl}
        alt={book.title}
        className="continue-card-cover"
      />
      <div className="continue-card-body">
        <h3 className="continue-card-title">{book.title}</h3>
        <p className="continue-card-author">{book.authorName}</p>
        {hasProgress ? (
          <>
            <div className="continue-card-progress-meta">
              <span>
                s. {current}
                {total ? ` / ${total}` : ""}
              </span>
              {pct != null && <span>{pct}%</span>}
            </div>
            {pct != null && (
              <div className="continue-card-bar">
                <div className="continue-card-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            )}
          </>
        ) : (
          <p className="continue-card-author">Okumaya devam et</p>
        )}
      </div>
    </Link>
  );
};

export default ContinueReadingCard;
