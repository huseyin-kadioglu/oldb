import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import SectionHeader from "../ui/SectionHeader";
import CoverImage from "../ui/CoverImage";
import BookCoverCard from "../ui/BookCoverCard";
import { UserDisplayName } from "../common/ProVerifiedBadge";
import {
  getActivityRecent,
  getCommunityReviews,
  getCommunityStats,
  getDailyReadCheckin,
  getProfileSummaryByUsername,
  setDailyReadCheckin,
} from "../../service/APIService";
import "../ui/folios-ui.css";
import "./Content.css";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
};

const formatDate = () =>
  new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const stars = (rating) => {
  const n = Number(rating) || 0;
  if (n <= 0) return null;
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
};

const formatShortDate = (item) => {
  const raw = item.readDate || item.updateDate || item.createdAt;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

const flag = (book, ...keys) => keys.some((k) => !!book?.[k]);

const Content = ({ books, token }) => {
  const username = sessionStorage.getItem("username");
  const [profile, setProfile] = useState(null);
  const [community, setCommunity] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [communityReviews, setCommunityReviews] = useState([]);
  const [checkin, setCheckin] = useState(null);
  const [checkinBusy, setCheckinBusy] = useState(false);

  const popular =
    community?.booksReadThisMonthList?.length > 0
      ? community.booksReadThisMonthList
      : [...(books || [])]
          .filter((b) => b.averageRating > 0)
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 8);

  const popularFallback =
    popular.length > 0
      ? popular
      : [...(books || [])].sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0)).slice(0, 8);

  const editorPicks = (books || [])
    .filter((b) => flag(b, "isEditorChoice", "editorChoice"))
    .slice(0, 10);
  const weeklyPicks = (books || [])
    .filter((b) => flag(b, "isWeeklyPick", "weeklyPick"))
    .slice(0, 10);
  const newReleases = (books || [])
    .filter((b) => flag(b, "isNewRelease", "newRelease"))
    .slice(0, 10);

  useEffect(() => {
    getCommunityStats().then(setCommunity).catch(() => setCommunity(null));
    getActivityRecent(12).then(setRecentActivity).catch(() => setRecentActivity([]));
    getCommunityReviews(4).then(setCommunityReviews).catch(() => setCommunityReviews([]));
  }, []);

  useEffect(() => {
    if (token && username) {
      getProfileSummaryByUsername(username).then(setProfile).catch(() => setProfile(null));
      getDailyReadCheckin()
        .then(setCheckin)
        .catch(() => setCheckin(null));
    } else {
      setProfile(null);
      setCheckin(null);
    }
  }, [token, username]);

  const displayName = profile?.profileName || username;

  const toggleCheckin = async () => {
    if (!token || checkinBusy) return;
    const next = !checkin?.checkedInToday;
    setCheckinBusy(true);
    setCheckin((prev) =>
      prev
        ? { ...prev, checkedInToday: next }
        : { checkedInToday: next, readingStreak: next ? 1 : 0, today: "" }
    );
    try {
      const data = await setDailyReadCheckin(next);
      setCheckin(data);
      if (profile && data?.readingStreak != null) {
        setProfile({ ...profile, readingStreak: data.readingStreak });
      }
    } catch {
      setCheckin((prev) => (prev ? { ...prev, checkedInToday: !next } : prev));
    } finally {
      setCheckinBusy(false);
    }
  };

  const renderBookRail = (title, list, linkLabel = "Daha fazla") => {
    if (!list || list.length === 0) return null;
    return (
      <section className="lb-section">
        <SectionHeader title={title} to="/books" linkLabel={linkLabel} />
        <div className="lb-poster-row lb-poster-row--large">
          {list.map((book) => (
            <div key={book.id} className="lb-popular-item">
              <BookCoverCard book={book} showAuthor={false} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="lb-home">
      <header className="lb-hero">
        <div className="lb-hero-left">
          <p className="lb-hero-date">{formatDate().toUpperCase()}</p>
          {token ? (
            <>
              <h1 className="lb-hero-title">
                {greeting()}, {displayName || "Okur"}.
              </h1>
              {profile ? (
                <p className="lb-hero-sub">
                  Bu yıl <strong>{profile.bookReadThisYear ?? 0}</strong> kitap okudun
                  — toplam <strong>{profile.bookRead ?? 0}</strong> kitap.
                </p>
              ) : (
                <p className="lb-hero-sub">Okuma yolculuğuna devam et.</p>
              )}

              {checkin && (
                <div className="lb-checkin">
                  <button
                    type="button"
                    className={`lb-checkin-btn ${checkin.checkedInToday ? "is-checked" : ""}`}
                    disabled={checkinBusy}
                    onClick={toggleCheckin}
                  >
                    <span className="lb-checkin-tick" aria-hidden>
                      {checkin.checkedInToday ? "✓" : ""}
                    </span>
                    <span className="lb-checkin-label">
                      {checkin.checkedInToday ? "Bugün okudun" : "Bugün kitap okudun mu?"}
                    </span>
                  </button>
                  {(checkin.readingStreak > 0 || checkin.checkedInToday) && (
                    <span className="lb-checkin-streak" title="Okuma serisi">
                      <LocalFireDepartmentOutlinedIcon sx={{ fontSize: 16 }} />
                      {checkin.readingStreak ?? 0} gün
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="lb-hero-title">Kitaplarını keşfet ve logla.</h1>
              <p className="lb-hero-sub">
                OLDB’de okuduklarını kaydet, puanla ve okurlarla paylaş.
              </p>
            </>
          )}

          {community && (
            <p className="lb-hero-community">
              Üyelerimiz bu ay <strong>{community.booksReadThisMonth ?? 0}</strong> kitap okudu
              {community.activeMembers > 0 && (
                <>
                  {" "}· <strong>{community.activeMembers}</strong> aktif üye
                </>
              )}
            </p>
          )}

          {!token && (
            <div className="lb-hero-actions">
              <Link to="/signup" className="lb-hero-btn lb-hero-btn--primary">
                Üye ol
              </Link>
              <Link to="/signin" className="lb-hero-btn lb-hero-btn--ghost">
                Giriş yap
              </Link>
            </div>
          )}
        </div>

        {community && (
          <div className="lb-hero-stats">
            <div className="lb-stat">
              <span className="lb-stat-value">
                {(community.booksReadThisMonth ?? 0).toLocaleString("tr-TR")}
              </span>
              <span className="lb-stat-label">Bu ay okunan</span>
            </div>
            <div className="lb-stat">
              <span className="lb-stat-value">
                {(community.activeMembers ?? 0).toLocaleString("tr-TR")}
              </span>
              <span className="lb-stat-label">Aktif üye</span>
            </div>
            {token && profile && (
              <div className="lb-stat">
                <span className="lb-stat-value">{profile.bookReadThisYear ?? 0}</span>
                <span className="lb-stat-label">Senin bu yıl</span>
              </div>
            )}
          </div>
        )}
      </header>

      {renderBookRail("stoa şunları önerdi", editorPicks, "Keşfet")}
      {renderBookRail("Haftanın kitabı", weeklyPicks)}
      {renderBookRail("Yeni çıkanlar", newReleases)}

      <section className="lb-section">
        <SectionHeader
          title="Yeni aktiviteler"
          to="/activities"
          linkLabel="Aktiviten"
          icon={<BoltOutlinedIcon fontSize="small" />}
        />
        {recentActivity.length > 0 ? (
          <div className="lb-poster-row">
            {recentActivity.slice(0, 8).map((item) => (
              <Link
                key={`${item.activityId}-${item.userId}`}
                to={item.bookId ? `/book/${item.bookId}` : "/activities"}
                className="lb-activity-poster"
              >
                <div className="lb-poster-frame">
                  <CoverImage src={item.coverUrl} alt={item.bookTitle} className="lb-poster-img" />
                  <div className="lb-poster-user">
                    <CoverImage
                      src={item.avatarUrl}
                      alt={item.username}
                      className="lb-poster-avatar"
                      variant="avatar"
                    />
                    <UserDisplayName
                      name={item.username || "okur"}
                      role={item.role}
                      badgeSize="xs"
                    />
                  </div>
                </div>
                <div className="lb-poster-meta">
                  <span className="lb-poster-stars">{stars(item.rating)}</span>
                  <span className="lb-poster-icons">
                    {item.hasReview && <RateReviewOutlinedIcon sx={{ fontSize: 14 }} />}
                    {item.status === "LIKE" && <FavoriteBorderIcon sx={{ fontSize: 14 }} />}
                  </span>
                  <span className="lb-poster-date">{formatShortDate(item)}</span>
                </div>
                {item.comment ? (
                  <p className="lb-poster-quote">
                    “{String(item.comment).slice(0, 72)}
                    {item.comment.length > 72 ? "…" : ""}”
                  </p>
                ) : item.bookTitle ? (
                  <p className="lb-poster-book">{item.bookTitle}</p>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <p className="lb-empty">Henüz aktivite yok — ilk logu sen bırak.</p>
        )}
      </section>

      <section className="lb-section">
        <SectionHeader title="Popüler" to="/books" linkLabel="Daha fazla" />
        <div className="lb-poster-row lb-poster-row--large">
          {popularFallback.slice(0, 8).map((book) => (
            <div key={book.id} className="lb-popular-item">
              <BookCoverCard book={book} showAuthor={false} />
            </div>
          ))}
        </div>
      </section>

      {communityReviews.length > 0 && (
        <section className="lb-section">
          <SectionHeader title="Popüler incelemeler" to="/activities" linkLabel="Aktivite" />
          <div className="lb-review-list">
            {communityReviews.map((review) => (
              <article className="lb-review-card" key={review.activityId}>
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
                  </div>
                  <h3 className="lb-review-title">
                    <Link to={`/book/${review.bookId}`}>{review.title}</Link>
                  </h3>
                  {review.rating > 0 && (
                    <p className="lb-review-stars">{stars(review.rating)}</p>
                  )}
                  {review.comment && <p className="lb-review-text">{review.comment}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Content;
