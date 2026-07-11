import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CoverImage from "../ui/CoverImage";
import { UserDisplayName } from "../common/ProVerifiedBadge";
import { formatActivitySentence, formatStatusVerb } from "../../utils/activityCopy";
import {
  formatNotificationText,
  getActivityFeed,
  getNotifications,
  markNotificationRead,
} from "../../service/APIService";
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

const truncateQuote = (text, max = 220) => {
  const t = String(text || "").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
};

const formatLikeCount = (n) => {
  const count = Number(n) || 0;
  if (count <= 0) return null;
  return `${count.toLocaleString("tr-TR")} kişi beğendi`;
};

const Activities = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const myUsername = sessionStorage.getItem("username");
  const [tab, setTab] = useState("friends");
  const [items, setItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    if (tab === "incoming") {
      getNotifications(40)
        .then((data) => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => setError("Bildirimler yüklenemedi."))
        .finally(() => setLoading(false));
      return;
    }

    getActivityFeed(tab, 50)
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

  const handleNotifClick = async (n) => {
    if (!n.read) {
      try {
        await markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
        );
      } catch {
        /* ignore */
      }
    }
    if (n.linkPath) navigate(n.linkPath);
  };

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

      {tab === "incoming" && !loading && notifications.length === 0 && (
        <p className="act-meta">Henüz gelen bildirim yok.</p>
      )}

      {tab !== "incoming" && !loading && items.length === 0 && (
        <p className="act-meta">
          {tab === "friends"
            ? "Takip ettiğin kişilerin aktivitesi yok. Profil sayfalarından takip etmeye başla."
            : "Henüz aktivite yok."}
        </p>
      )}

      {tab === "incoming" ? (
        <div className="act-feed">
          {notifications.map((n) => {
            const text = formatNotificationText(n);
            return (
              <button
                type="button"
                className={`act-row act-row--btn ${n.read ? "" : "unread"}`}
                key={n.id}
                onClick={() => handleNotifClick(n)}
              >
                <CoverImage
                  src={n.actorAvatarUrl}
                  alt={n.actorUsername}
                  className="act-avatar"
                  variant="avatar"
                />
                <p className="act-row-text">
                  {text.emphasis ? <strong>{text.emphasis}</strong> : null}
                  {text.rest}
                </p>
                <span className="act-time">{relativeTime(n)}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="act-feed">
          {items.map((item, idx) => {
            const isYou = item.username && item.username === myUsername;
            const key = item.activityId || `${item.userId}-${idx}`;
            const hasBookCard = !!item.bookId;

            if (!hasBookCard) {
              return (
                <div className="act-row" key={key}>
                  <CoverImage
                    src={item.avatarUrl}
                    alt={item.username}
                    className="act-avatar"
                    variant="avatar"
                  />
                  <p className="act-row-text">
                    {formatActivitySentence(
                      item.status,
                      item.bookTitle,
                      isYou ? null : item.profileName || item.username
                    )}
                  </p>
                  <span className="act-time">{relativeTime(item)}</span>
                </div>
              );
            }

            const who = isYou ? "Sen" : item.profileName || item.username || "Bir okur";
            const verb = formatStatusVerb(item.status, isYou);
            const quote = truncateQuote(item.comment);
            const likes = formatLikeCount(item.likeCount);
            const starLine = stars(item.rating);

            return (
              <article className="act-card" key={key}>
                <header className="act-card-head">
                  <Link to={`/profile/${item.username}`} className="act-card-user">
                    <CoverImage
                      src={item.avatarUrl}
                      alt={item.username}
                      className="act-avatar"
                      variant="avatar"
                    />
                    <div className="act-card-user-meta">
                      <UserDisplayName
                        name={who}
                        role={isYou ? sessionStorage.getItem("userRole") : item.role}
                        badgeSize="xs"
                        className="act-card-name"
                      />
                      <span className="act-card-verb">{verb}</span>
                    </div>
                  </Link>
                  <span className="act-time">{relativeTime(item)}</span>
                </header>

                <div className="act-card-media">
                  <Link to={`/book/${item.bookId}`} className="act-card-poster">
                    <CoverImage
                      src={item.coverUrl}
                      alt={item.bookTitle}
                      className="act-poster-img"
                    />
                  </Link>

                  <div className="act-card-body">
                    {starLine && <p className="act-stars">{starLine}</p>}

                    <h2 className="act-book-title">
                      <Link to={`/book/${item.bookId}`}>
                        {item.bookTitle}
                        {item.publicationYear ? (
                          <span className="act-year"> ({item.publicationYear})</span>
                        ) : null}
                      </Link>
                    </h2>

                    {quote ? (
                      <blockquote className="act-quote">“{quote}”</blockquote>
                    ) : null}

                    {likes ? (
                      <p className="act-likes">
                        <FavoriteBorderIcon sx={{ fontSize: 15 }} />
                        {likes}
                      </p>
                    ) : (
                      <p className="act-likes act-likes--muted">
                        <FavoriteBorderIcon sx={{ fontSize: 15 }} />
                        İlk beğeniyi sen bırak
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Activities;
