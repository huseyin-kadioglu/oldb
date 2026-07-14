import { useState } from "react";
import { Link } from "react-router-dom";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import CoverImage from "../ui/CoverImage";
import { UserDisplayName } from "../common/ProVerifiedBadge";

const stars = (rating) => {
  const n = Number(rating) || 0;
  if (n <= 0) return null;
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
};

const formatReviewDate = (raw) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
};

const ReviewText = ({ text, spoiler }) => {
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const full = (text || "").trim();
  // Rough gate so short blurbs do not show a useless "continue" control.
  const canExpand = full.length > 140;

  if (spoiler && !revealed) {
    return (
      <div className="lb-review-spoiler-wrap">
        <button
          type="button"
          className="lb-review-spoiler-curtain"
          onClick={() => setRevealed(true)}
          aria-expanded="false"
        >
          <span className="lb-review-spoiler-badge">Spoiler içerir</span>
          <span className="lb-review-spoiler-hint">Görmek için tıkla</span>
        </button>
      </div>
    );
  }

  return (
    <div className="lb-review-text-block">
      {spoiler && (
        <div className="lb-review-spoiler-meta">
          <span className="lb-review-spoiler-badge">Spoiler</span>
          <button
            type="button"
            className="lb-review-spoiler-toggle"
            onClick={() => setRevealed(false)}
          >
            Gizle
          </button>
        </div>
      )}
      <p className={`lb-review-text${expanded ? " is-expanded" : ""}`}>{full}</p>
      {canExpand && (
        <button
          type="button"
          className="lb-review-more"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Daha az göster" : "Devamını oku"}
        </button>
      )}
    </div>
  );
};

const PopularReviewCard = ({ review }) => {
  const starLabel = stars(review.rating);
  const dateLabel = formatReviewDate(review.readDate);

  return (
    <article className="lb-review-card">
      <Link to={`/book/${review.bookId}`} className="lb-review-cover-link">
        <CoverImage src={review.coverUrl} alt={review.title} className="lb-review-cover" />
      </Link>
      <div className="lb-review-body">
        <div className="lb-review-head">
          <CoverImage
            src={review.avatarUrl}
            alt={review.username}
            className="lb-review-avatar"
            variant="avatar"
          />
          {review.username ? (
            <Link to={`/profile/${review.username}`} className="lb-review-user">
              <UserDisplayName
                name={review.profileName || review.username}
                role={review.role}
                badgeSize="xs"
              />
            </Link>
          ) : (
            <span className="lb-review-user">okur</span>
          )}
          {dateLabel && <time className="lb-review-date">{dateLabel}</time>}
        </div>

        <h3 className="lb-review-title">
          <Link to={`/book/${review.bookId}`}>{review.title}</Link>
        </h3>

        <div className="lb-review-meta">
          {starLabel && (
            <span className="lb-review-stars" title={`Puan: ${review.rating}`}>
              {starLabel}
            </span>
          )}
          <span className="lb-review-likes" title="Beğeni">
            <ThumbUpAltOutlinedIcon sx={{ fontSize: 14 }} />
            {review.likeCount ?? 0}
          </span>
        </div>

        {review.comment && (
          <ReviewText text={review.comment} spoiler={!!review.spoiler} />
        )}
      </div>
    </article>
  );
};

export default PopularReviewCard;
