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
  getDailyReadCheckin,
  getHomeFeed,
  getProfileSummaryByUsername,
  setDailyReadCheckin,
} from "../../service/APIService";
import { showToast } from "../../utils/uiEvents";
import "../ui/folios-ui.css";
import "./Content.css";
import COPY from "../../copy";
import PopularReviewCard from "./PopularReviewCard";

const CHECKIN_HINT_KEY = "oldb_checkin_hint_seen";

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

const Content = ({ token }) => {
  const username = sessionStorage.getItem("username");
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [checkin, setCheckin] = useState(null);
  const [checkinBusy, setCheckinBusy] = useState(false);
  const [checkinError, setCheckinError] = useState(null);
  const [showCheckinHint, setShowCheckinHint] = useState(
    () => localStorage.getItem(CHECKIN_HINT_KEY) !== "1"
  );

  const community = feed?.communityStats;
  // Avoid weak social proof while the community is still small.
  const showCommunityProof = (community?.activeMembers ?? 0) >= 25;
  const stoaPicks = feed?.stoaPicks || [];
  const newReleases = feed?.newReleases || [];
  const discussed = feed?.discussed || [];
  const allTimeMostRead = feed?.allTimeMostRead || [];
  const popularReviews = feed?.popularReviews || [];

  useEffect(() => {
    setFeedLoading(true);
    getHomeFeed()
      .then(setFeed)
      .catch(() => setFeed(null))
      .finally(() => setFeedLoading(false));
    getActivityRecent(12).then(setRecentActivity).catch(() => setRecentActivity([]));
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
    if (!token || checkinBusy || !checkin) return;
    const next = !checkin.checkedInToday;
    const previous = checkin;
    setCheckinBusy(true);
    setCheckinError(null);
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
      if (next) {
        const streak = data?.readingStreak ?? 0;
        showToast(
          streak > 0
            ? `${COPY.checkin.toastOk} · ${COPY.checkin.streak(streak)}`
            : COPY.checkin.toastOk
        );
        if (showCheckinHint) {
          localStorage.setItem(CHECKIN_HINT_KEY, "1");
          setShowCheckinHint(false);
        }
      }
    } catch {
      setCheckin(previous);
      setCheckinError(COPY.checkin.toastError);
      showToast(COPY.checkin.toastError);
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
              <BookCoverCard book={book} showAuthor={!!book.authorName} />
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
                  <div className="lb-checkin-block">
                    {!checkin.checkedInToday && (
                      <p className="lb-checkin-prompt">{COPY.checkin.prompt}</p>
                    )}
                    <div className="lb-checkin-row">
                      <button
                        type="button"
                        className={`lb-checkin-btn ${
                          checkin.checkedInToday ? "is-checked" : "is-action"
                        }${checkinBusy ? " is-busy" : ""}`}
                        disabled={checkinBusy}
                        onClick={toggleCheckin}
                        title={
                          checkin.checkedInToday ? COPY.checkin.undoTitle : undefined
                        }
                        aria-label={
                          checkinBusy
                            ? COPY.checkin.ariaBusy
                            : checkin.checkedInToday
                              ? COPY.checkin.ariaUndo
                              : COPY.checkin.ariaMark
                        }
                        aria-pressed={!!checkin.checkedInToday}
                      >
                        <span className="lb-checkin-tick" aria-hidden="true">
                          {checkin.checkedInToday ? "✓" : ""}
                        </span>
                        <span className="lb-checkin-label">
                          {checkinBusy
                            ? "Kaydediliyor…"
                            : checkin.checkedInToday
                              ? COPY.checkin.done
                              : COPY.checkin.action}
                        </span>
                      </button>
                      {(checkin.readingStreak > 0 || checkin.checkedInToday) && (
                        <span
                          className="lb-checkin-streak"
                          title={COPY.checkin.streak(checkin.readingStreak ?? 0)}
                        >
                          <LocalFireDepartmentOutlinedIcon
                            sx={{ fontSize: 16 }}
                            aria-hidden="true"
                          />
                          <span>{COPY.checkin.streak(checkin.readingStreak ?? 0)}</span>
                        </span>
                      )}
                    </div>
                    {!checkin.checkedInToday && showCheckinHint && (
                      <p className="lb-checkin-hint">{COPY.checkin.hint}</p>
                    )}
                    {checkinError && (
                      <p className="lb-checkin-error" role="alert">
                        {checkinError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="lb-hero-title">{COPY.home.heroGuest}</h1>
              <p className="lb-hero-sub">
                OLDB’de okuduklarını kaydet, puanla ve okurlarla paylaş.
              </p>
            </>
          )}

          {showCommunityProof && (
            <p className="lb-hero-community">
              Üyelerimiz bu ay <strong>{community.booksReadThisMonth ?? 0}</strong> kitap okudu
              {" "}· <strong>{community.activeMembers}</strong> aktif üye
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

        {(showCommunityProof || (token && profile)) && (
          <div className="lb-hero-stats">
            {showCommunityProof && (
              <>
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
              </>
            )}
            {token && profile && (
              <div className="lb-stat">
                <span className="lb-stat-value">{profile.bookReadThisYear ?? 0}</span>
                <span className="lb-stat-label">Senin bu yıl</span>
              </div>
            )}
          </div>
        )}
      </header>

      {feedLoading && <p className="lb-empty">Raflar yükleniyor…</p>}

      {renderBookRail("stoa önerdi", stoaPicks, "Keşfet")}
      {renderBookRail("Yeni çıkanlar", newReleases)}
      {renderBookRail("Konuşulanlar", discussed)}
      {renderBookRail("Tüm zamanların en çok okunanları", allTimeMostRead)}

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
          <p className="lb-empty">Henüz aktivite yok — ilk kaydı sen bırakabilirsin.</p>
        )}
      </section>

      {popularReviews.length > 0 && (
        <section className="lb-section">
          <SectionHeader title="Popüler incelemeler" to="/activities" linkLabel="Tüm incelemeler" />
          <div className="lb-review-list">
            {popularReviews.slice(0, 4).map((review) => (
              <PopularReviewCard key={review.activityId} review={review} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Content;
