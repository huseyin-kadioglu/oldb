import { Link } from "react-router-dom";
import CoverImage from "../ui/CoverImage";
import {
  activityKindLabel,
  formatStars,
  groupProfileActivities,
  relativeTime,
  resolveActivityKind,
} from "./profileUtils";
import "./ProfileActivityFeed.css";

const ProfileActivityFeed = ({
  activities = [],
  actorName,
  limit = 8,
  empty,
}) => {
  const groups = groupProfileActivities(activities).slice(0, limit);

  if (!groups.length) {
    return empty || null;
  }

  return (
    <div className="paf-list">
      {groups.map((group) => {
        const item = group.primary;
        const kinds = [...new Set(group.items.map(resolveActivityKind))];
        const kind = resolveActivityKind(item);
        const label =
          kinds.length > 1
            ? kinds.map(activityKindLabel).slice(0, 3).join(" · ")
            : activityKindLabel(kind);
        const title = item.bookTitle || item.title || "Kitap";
        const time = relativeTime(item.updateDate || item.readDate);
        const stars = formatStars(item.rating);
        const quote = item.comment ? String(item.comment).trim() : "";

        return (
          <Link
            key={group.key}
            to={`/book/${item.bookId}`}
            className={`paf-card kind-${kind}`}
          >
            <CoverImage
              src={item.coverUrl}
              alt=""
              className="paf-cover"
            />
            <div className="paf-body">
              <div className="paf-top">
                <span className={`paf-kind kind-${kind}`}>{label}</span>
                {time && <time className="paf-time">{time}</time>}
              </div>
              <p className="paf-line">
                {actorName && <span className="paf-actor">{actorName}</span>}
                <span className="paf-book">{title}</span>
              </p>
              {stars && <p className="paf-stars">{stars}</p>}
              {quote && (
                <p className="paf-quote">
                  “{quote.length > 110 ? `${quote.slice(0, 110)}…` : quote}”
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProfileActivityFeed;
