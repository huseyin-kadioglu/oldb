import { useState } from "react";
import { Link } from "react-router-dom";
import CoverImage from "../../ui/CoverImage";
import VitrineShell from "./VitrineShell";
import { SHOWCASE_TYPE, VITRINE_COPY } from "./showcaseConstants";

const QuoteShowcase = ({
  item,
  showActions,
  busy,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const [expanded, setExpanded] = useState(false);
  const quote = (item.quote || "").trim();
  const long = quote.length > 160;
  const hasBook = !!item.bookId;

  return (
    <VitrineShell
      type={SHOWCASE_TYPE.QUOTE}
      title={item.title || VITRINE_COPY.defaultQuoteTitle}
      description={item.description}
      showActions={showActions}
      busy={busy}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      onEdit={onEdit}
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      className="ps-vitrine-card--quote"
    >
      <div className={`ps-quote-layout ${hasBook ? "" : "is-solo"}`}>
        {hasBook && (
          <Link to={`/book/${item.bookId}`} className="ps-quote-cover-link" title={item.bookTitle}>
            <CoverImage src={item.coverUrl} alt={item.bookTitle || ""} className="ps-quote-cover" />
          </Link>
        )}
        <div className="ps-quote-main">
          <blockquote className={`ps-quote-text ${expanded ? "is-expanded" : ""}`}>
            “{quote}”
          </blockquote>
          {long && (
            <button
              type="button"
              className="ps-quote-more"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? VITRINE_COPY.readLess : VITRINE_COPY.readMore}
            </button>
          )}
          {hasBook && (
            <p className="ps-quote-attribution">
              —{" "}
              <Link to={`/book/${item.bookId}`}>{item.bookTitle}</Link>
              {item.authorName ? <span> · {item.authorName}</span> : null}
            </p>
          )}
        </div>
      </div>
    </VitrineShell>
  );
};

export default QuoteShowcase;
