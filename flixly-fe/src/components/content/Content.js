import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SectionHeader from "../ui/SectionHeader";
import CoverImage from "../ui/CoverImage";
import BookCoverCard from "../ui/BookCoverCard";
import {
  getActivityRecent,
  getCommunityReviews,
  getCommunityStats,
  getProfileSummaryByUsername,
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

const Content = ({ books, token }) => {
  const username = sessionStorage.getItem("username");
  const [profile, setProfile] = useState(null);
  const [community, setCommunity] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [communityReviews, setCommunityReviews] = useState([]);

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

  useEffect(() => {
    getCommunityStats().then(setCommunity).catch(() => setCommunity(null));
    getActivityRecent(12).then(setRecentActivity).catch(() => setRecentActivity([]));
    getCommunityReviews(4).then(setCommunityReviews).catch(() => setCommunityReviews([]));
  }, []);

  useEffect(() => {
    if (token && username) {
      getProfileSummaryByUsername(username).then(setProfile).catch(() => setProfile(null));
    } else {
      setProfile(null);
    }
  }, [token, username]);

  const displayName = profile?.profileName || username || "Okur";

  return (
    <div className="lb-home">
      <header className="lb-hero">
        <div className="lb-hero-left">
          <p className="lb-hero-date">{formatDate().toUpperCase()}</p>
          <h1 className="lb-hero-title">
            {greeting()}, {displayName}.
          </h1>
          {token && profile ? (
            <p className="lb-hero-sub">
              Bu yıl <strong>{profile.bookReadThisYear ?? 0}</strong> kitap okudun
              — toplam <strong>{profile.bookRead ?? 0}</strong> kitap.
            </p>
          ) : (
            <p className="lb-hero-sub">
              Okuduğun kitapları logla, puanla ve listelerini paylaş.
            </p>
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
            <Link to="/signup" className="lb-hero-cta">
              Hemen Kaydol
            </Link>
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
                    <span>{item.username || "okur"}</span>
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
              </Link>
            ))}
          </div>
        ) : (
          <p className="lb-empty">Henüz aktivite yok — ilk logu sen bırak.</p>
        )}
      </section>

      <section className="lb-section">
        <SectionHeader
          title="Popüler"
          to="/books"
          linkLabel="Daha fazla"
        />
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
                      src={null}
                      alt={review.username}
                      className="lb-review-avatar"
                      variant="avatar"
                    />
                    {review.username ? (
                      <Link to={`/profile/${review.username}`} className="lb-review-user">
                        {review.profileName || review.username}
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
