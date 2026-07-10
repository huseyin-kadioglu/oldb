import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CoverImage from "../ui/CoverImage";
import { formatActivitySentence } from "../../utils/activityCopy";
import { getActivityFeed } from "../../service/APIService";
import "./Activities.css";

const TABS = [
  { id: "friends", label: "Takip" },
  { id: "you", label: "Sen" },
  { id: "incoming", label: "Gelen" },
];

const relativeTime = (item) => {
  const raw = item.createdAt || item.updateDate || item.readDate;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}sa`;
  const days = Math.floor(hours / 24);
  if (days < 60) return `${days}g`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

const stars = (rating) => {
  const n = Number(rating) || 0;
  if (n <= 0) return null;
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
};

const actionLabel = (item, isYou) => {
  if (item.incomingType === "FOLLOW") {
    return (
      <>
        <Link to={`/profile/${item.username}`}>{item.profileName || item.username}</Link>
        {" seni takip etmeye başladı"}
      </>
    );
  }
  if (item.incomingType === "COMMENT_LIKE") {
    return (
      <>
        <Link to={`/profile/${item.username}`}>{item.profileName || item.username}</Link>
        {" yorumunu beğendi"}
      </>
    );
  }
  const who = isYou ? "Sen" : item.profileName || item.username || "Bir okur";
  return formatActivitySentence(item.status, item.bookTitle, isYou ? null : who);
};

const Activities = () => {
  const token = sessionStorage.getItem("token");
  const myUsername = sessionStorage.getItem("username");
  const [tab, setTab] = useState(token ? "friends" : "friends");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scope = !token ? "community" : tab;
    setLoading(true);
    getActivityFeed(scope, 50)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError("Aktivite yüklenemedi."))
      .finally(() => setLoading(false));
  }, [tab, token]);

  if (!token) {
    return (
      <div className="act-page">
        <p className="act-login-hint">
          Aktivite akışını görmek için <Link to="/">giriş yap</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="act-page">
      <header className="act-header">
        <h1>Aktivite</h1>
        <nav className="act-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {loading && <p className="act-meta">Yükleniyor…</p>}
      {error && <p className="act-error">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="act-meta">
          {tab === "friends"
            ? "Takip ettiğin kişilerin aktivitesi yok. Profil sayfalarından takip etmeye başla."
            : "Henüz aktivite yok."}
        </p>
      )}

      <div className="act-feed">
        {items.map((item, idx) => {
          const isYou = item.username && item.username === myUsername;
          const isDetailed =
            item.hasReview ||
            (item.rating > 0 && item.bookId && item.incomingType == null);
          const key = item.activityId || `${item.incomingType}-${item.userId}-${idx}`;

          if (!isDetailed || item.incomingType) {
            return (
              <div className="act-row" key={key}>
                <CoverImage
                  src={item.avatarUrl}
                  alt={item.username}
                  className="act-avatar"
                  variant="avatar"
                />
                <p className="act-row-text">{actionLabel(item, isYou)}</p>
                <span className="act-time">{relativeTime(item)}</span>
              </div>
            );
          }

          return (
            <div className="act-detail" key={key}>
              <CoverImage
                src={item.avatarUrl}
                alt={item.username}
                className="act-avatar"
                variant="avatar"
              />
              <div className="act-detail-main">
                <div className="act-detail-grid">
                  {item.bookId && (
                    <Link to={`/book/${item.bookId}`}>
                      <CoverImage
                        src={item.coverUrl}
                        alt={item.bookTitle}
                        className="act-cover"
                      />
                    </Link>
                  )}
                  <div className="act-detail-body">
                    <p className="act-action-label">
                      {isYou ? (
                        <>Sen {item.status === "LIKE" ? "beğendin" : item.hasReview ? "inceleme yazdın" : "okudun"}</>
                      ) : (
                        <>
                          <Link to={`/profile/${item.username}`}>{item.profileName || item.username}</Link>
                          {item.status === "LIKE" ? " beğendi" : item.hasReview ? " inceleme yazdı" : " okudu"}
                        </>
                      )}
                    </p>
                    <h2 className="act-book-title">
                      <Link to={`/book/${item.bookId}`}>
                        {item.bookTitle}
                        {item.publicationYear ? (
                          <span className="act-year"> {item.publicationYear}</span>
                        ) : null}
                      </Link>
                    </h2>
                    {item.rating > 0 && (
                      <p className="act-stars">{stars(item.rating)}</p>
                    )}
                    {item.comment && <p className="act-comment">{item.comment}</p>}
                    <p className="act-like-hint">
                      <FavoriteBorderIcon sx={{ fontSize: 14 }} /> Beğeni yok
                    </p>
                  </div>
                </div>
              </div>
              <span className="act-time">{relativeTime(item)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Activities;
