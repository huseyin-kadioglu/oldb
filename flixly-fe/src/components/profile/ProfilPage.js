import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ProfileSummary from "./ProfileSummary";
import ProfileTabs from "./ProfileTabs";
import CurrentlyReadingSection from "./CurrentlyReadingSection";
import ProfileShelf, { ProfileEmpty } from "./ProfileShelf";
import ProfileActivityFeed from "./ProfileActivityFeed";
import YearlyGoalCard from "./YearlyGoalCard";
import ReadingIdentityCard from "./ReadingIdentityCard";
import Review from "./Review";
import BookFilter from "../common/BookFilter";
import CoverImage from "../ui/CoverImage";
import SectionHeader from "../ui/SectionHeader";
import {
  createUserActivityFromGhostMenu,
  getProfileSummaryByUsername,
} from "../../service/APIService";
import {
  buildReadingIdentity,
  isValidProfileTab,
} from "./profileUtils";
import "../ui/folios-ui.css";
import "./ProfilePage.css";
import "./Profile.css";
import "./ProfileCoverStrip.css";
import "./YearlyGoalCard.css";
import "./ReadingIdentityCard.css";
import "./CurrentlyReadingSection.css";
import "./ProfileActivityFeed.css";
import "./ProfileTabs.css";

const MiniCoverGrid = ({ books, to, emptyText, limit = 8 }) => {
  const items = (books || []).slice(0, limit);
  if (!items.length) {
    return <p className="profile-empty profile-empty--compact">{emptyText}</p>;
  }
  return (
    <>
      <div className="profile-mini-covers">
        {items.map((book) => (
          <Link key={book.id} to={`/book/${book.id}`} state={{ book }} title={book.title}>
            <CoverImage src={book.coverUrl} alt={book.title || ""} />
          </Link>
        ))}
      </div>
      {to && books.length > limit && (
        <Link to={to} className="profile-see-more">
          Tümünü gör →
        </Link>
      )}
    </>
  );
};

const ProfilePage = ({ books = [] }) => {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = isValidProfileTab(tabParam) ? tabParam : "overview";

  const [profileSummary, setProfileSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritePickerOpen, setFavoritePickerOpen] = useState(false);
  const isOwnProfile = sessionStorage.getItem("username") === username;

  const loadProfile = useCallback(() => {
    getProfileSummaryByUsername(username)
      .then((data) => {
        setProfileSummary(data);
        setError(null);
      })
      .catch(() => setError("Profil yüklenirken bir hata oluştu."))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    setLoading(true);
    loadProfile();
  }, [loadProfile]);

  const setTab = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === "overview") next.delete("tab");
    else next.set("tab", id);
    setSearchParams(next, { replace: true });
  };

  const handleAddFavorite = async (book) => {
    if (!book) return;
    setFavoritePickerOpen(false);
    try {
      await createUserActivityFromGhostMenu({
        bookId: book.id,
        authorId: book.authorId,
        actionType: "FAVOURITE",
        action: "ADD",
      });
      loadProfile();
    } catch {
      alert("Favori eklenemedi.");
    }
  };

  const identity = useMemo(
    () => buildReadingIdentity(profileSummary),
    [profileSummary]
  );

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-hero profile-hero--skeleton" aria-busy="true">
          <div className="profile-hero-content">
            <div className="pcs-skeleton" style={{ width: 76, height: 76, borderRadius: "50%" }} />
            <div className="profile-skel-lines">
              <div className="pcs-skeleton" style={{ height: 18, width: 160, borderRadius: 4 }} />
              <div className="pcs-skeleton" style={{ height: 12, width: 220, borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <p className="page-loading">Profil yükleniyor…</p>
      </div>
    );
  }

  if (error) return <div className="page-error">{error}</div>;
  if (!profileSummary) return null;

  const readBooks = profileSummary.readBooks || profileSummary.completedBooks || [];
  const favorites = profileSummary.favoriteBooks || [];
  const continueReading = profileSummary.continueReading || [];
  const library = profileSummary.libraryBooks || [];
  const shopping = profileSummary.shoppingBooks || [];
  const readList = profileSummary.readList || [];
  const dropped = profileSummary.droppedBooks || [];
  const activities = profileSummary.recentActivity || [];
  const reviews = profileSummary.reviews || [];
  const badges = profileSummary.earnedBadges || [];
  const genres = profileSummary.genrePreferences || [];
  const actor = profileSummary.profileName || username;

  const recentReadCovers = (() => {
    const fromActivity = activities
      .filter((a) => a.coverUrl && (a.status === "READ" || a.status === "COMPLETED" || a.rating > 0))
      .reduce((acc, a) => {
        if (!acc.some((x) => x.bookId === a.bookId || x.id === a.bookId)) {
          acc.push({
            id: a.bookId,
            bookId: a.bookId,
            title: a.bookTitle,
            coverUrl: a.coverUrl,
            authorName: a.authorName,
          });
        }
        return acc;
      }, []);
    return fromActivity.length >= 3 ? fromActivity : readBooks;
  })();

  const authorCounts = {};
  activities.forEach((book) => {
    const name = book.authorName;
    if (!name) return;
    authorCounts[name] = (authorCounts[name] || 0) + 1;
  });
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const emptyOwn = (text, action) => (
    <ProfileEmpty>
      <p>{text}</p>
      {action}
    </ProfileEmpty>
  );
  const emptyGuest = (text) => (
    <ProfileEmpty>
      <p>{text}</p>
    </ProfileEmpty>
  );

  const overviewMain = (
    <>
      <section className="profile-section profile-section--featured">
        <CurrentlyReadingSection
          books={continueReading}
          isOwnProfile={isOwnProfile}
          onUpdated={loadProfile}
        />
      </section>

      <ProfileShelf
        title="Son Okunanlar"
        to={`/profile/${username}/list/read`}
        books={recentReadCovers}
        limit={16}
        empty={
          isOwnProfile
            ? emptyOwn("Henüz okunan kitap yok. İlk logunu bırak.")
            : emptyGuest("Henüz okunan kitap yok.")
        }
      />

      <ProfileShelf
        title="Favori Kitaplar"
        to={`/profile/${username}/list/favorites`}
        books={favorites}
        limit={16}
        action={
          isOwnProfile ? (
            <button
              type="button"
              className="profile-btn profile-btn--subtle"
              onClick={() => setFavoritePickerOpen(true)}
            >
              + Favori ekle
            </button>
          ) : null
        }
        empty={
          isOwnProfile
            ? emptyOwn("Favori listen boş.", (
                <button
                  type="button"
                  className="profile-btn profile-btn--subtle"
                  onClick={() => setFavoritePickerOpen(true)}
                >
                  Favori ekle
                </button>
              ))
            : emptyGuest("Favori kitap yok.")
        }
      />

      <section className="profile-section">
          <SectionHeader
            title="Son Aktiviteler"
            to={activities.length ? `/profile/${username}?tab=activity` : undefined}
            linkLabel="Tümü"
          />
        <ProfileActivityFeed
          activities={activities}
          actorName={actor}
          limit={8}
          empty={
            isOwnProfile
              ? emptyOwn("Henüz aktivite yok — bir kitap logla.")
              : emptyGuest("Henüz aktivite yok.")
          }
        />
      </section>

      {reviews.length > 0 && (
        <section className="profile-section">
          <SectionHeader title="İncelemeler" to={`/profile/${username}?tab=reviews`} linkLabel="Tümü" />
          <Review reviews={reviews.slice(0, 3)} />
        </section>
      )}
    </>
  );

  const booksTab = (
    <>
      <ProfileShelf
        title="Son Okunanlar"
        to={`/profile/${username}/list/read`}
        books={recentReadCovers}
        limit={24}
        empty={emptyGuest(isOwnProfile ? "Henüz okunan kitap yok." : "Okunan kitap yok.")}
      />
      <ProfileShelf
        title="Favoriler"
        to={`/profile/${username}/list/favorites`}
        books={favorites}
        limit={24}
        action={
          isOwnProfile ? (
            <button
              type="button"
              className="profile-btn profile-btn--subtle"
              onClick={() => setFavoritePickerOpen(true)}
            >
              + Favori ekle
            </button>
          ) : null
        }
        empty={emptyGuest("Favori yok.")}
      />
      <ProfileShelf
        title="Kütüphane"
        to={`/profile/${username}/list/library`}
        books={library}
        limit={24}
        empty={
          isOwnProfile
            ? emptyOwn("Kütüphanen boş. Sahip olduğun kitapları ekle.")
            : emptyGuest("Kütüphane boş.")
        }
      />
      <ProfileShelf
        title="Alınacaklar"
        to={`/profile/${username}/list/shopping`}
        books={shopping}
        limit={24}
        empty={
          isOwnProfile
            ? emptyOwn("Alınacaklar listen boş.")
            : emptyGuest("Alınacak kitap yok.")
        }
      />
    </>
  );

  const listsTab = (
    <>
      <ProfileShelf
        title="Okuma Listesi"
        to={`/profile/${username}/list/readlist`}
        books={readList}
        limit={24}
        empty={emptyGuest(isOwnProfile ? "Okuma listen boş." : "Okuma listesi boş.")}
      />
      <ProfileShelf
        title="Kütüphane"
        to={`/profile/${username}/list/library`}
        books={library}
        limit={24}
        empty={emptyGuest("Kütüphane boş.")}
      />
      <ProfileShelf
        title="Alınacaklar"
        to={`/profile/${username}/list/shopping`}
        books={shopping}
        limit={24}
        empty={emptyGuest("Alınacaklar boş.")}
      />
      <ProfileShelf
        title="Bırakılanlar"
        to={`/profile/${username}/list/dropped`}
        books={dropped}
        limit={24}
        empty={emptyGuest("Bırakılan kitap yok.")}
      />
    </>
  );

  const sidebar = (
    <aside className="page-sidebar profile-sidebar">
      <YearlyGoalCard
        yearlyGoal={profileSummary.yearlyBookGoal}
        booksThisYear={profileSummary.bookReadThisYear ?? 0}
        isOwnProfile={isOwnProfile}
        onUpdated={loadProfile}
      />

      <ReadingIdentityCard identity={identity} />

      {genres.length > 0 && (
        <div className="sidebar-block sidebar-block--soft">
          <h3 className="sidebar-title">Tür dağılımı</h3>
          <div className="genre-pref-list">
            {genres.slice(0, 5).map((g) => (
              <div className="genre-pref-row" key={g.genre}>
                <div className="genre-pref-top">
                  <span>{g.genre}</span>
                  <span>{g.percent}%</span>
                </div>
                <div className="genre-pref-bar">
                  <div style={{ width: `${g.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topAuthors.length > 0 && (
        <div className="sidebar-block sidebar-block--soft">
          <h3 className="sidebar-title">En çok okunan yazarlar</h3>
          {topAuthors.map(([name, count]) => {
            const pct = Math.min(100, count * 18);
            return (
              <div className="author-progress-row" key={name}>
                <div className="author-progress-top">
                  <span className="author-progress-name">{name}</span>
                  <span className="author-progress-count">{count}</span>
                </div>
                <div className="author-progress-bar">
                  <div className="author-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="sidebar-block sidebar-block--soft">
        <div className="sidebar-title-row">
          <h3 className="sidebar-title">Rozetler</h3>
          <button type="button" className="yg-edit" onClick={() => setTab("badges")}>
            Tümü
          </button>
        </div>
        {badges.length === 0 ? (
          <p className="profile-empty profile-empty--compact">
            {isOwnProfile ? "Henüz rozet yok — okumaya devam et." : "Rozet yok."}
          </p>
        ) : (
          <div className="profile-badges-grid">
            {badges.slice(0, 8).map((b) => (
              <button
                type="button"
                key={b.id || b.code}
                className="profile-badge-item"
                title={b.title}
                onClick={() => setTab("badges")}
              >
                <span>{b.icon}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-block sidebar-block--soft">
        <div className="sidebar-title-row">
          <h3 className="sidebar-title">Kütüphane</h3>
          <Link to={`/profile/${username}/list/library`} className="yg-edit">
            Tümü
          </Link>
        </div>
        <MiniCoverGrid
          books={library}
          to={`/profile/${username}/list/library`}
          emptyText={isOwnProfile ? "Kütüphanen boş." : "Kütüphane boş."}
          limit={8}
        />
      </div>

      <div className="sidebar-block sidebar-block--soft">
        <div className="sidebar-title-row">
          <h3 className="sidebar-title">Alınacaklar</h3>
          <Link to={`/profile/${username}/list/shopping`} className="yg-edit">
            Tümü
          </Link>
        </div>
        <MiniCoverGrid
          books={shopping}
          to={`/profile/${username}/list/shopping`}
          emptyText={isOwnProfile ? "Alınacaklar boş." : "Alınacak kitap yok."}
          limit={8}
        />
      </div>
    </aside>
  );

  let mainContent;
  switch (activeTab) {
    case "books":
      mainContent = booksTab;
      break;
    case "reviews":
      mainContent = reviews.length ? (
        <Review reviews={reviews} />
      ) : (
        emptyGuest(isOwnProfile ? "Henüz inceleme yazmadın." : "İnceleme yok.")
      );
      break;
    case "lists":
      mainContent = listsTab;
      break;
    case "activity":
      mainContent = (
        <ProfileActivityFeed
          activities={activities}
          actorName={actor}
          limit={40}
          empty={emptyGuest(isOwnProfile ? "Aktivite yok." : "Aktivite yok.")}
        />
      );
      break;
    case "badges":
      mainContent =
        badges.length === 0 ? (
          emptyGuest(isOwnProfile ? "Henüz rozet yok." : "Rozet yok.")
        ) : (
          <div className="profile-badges-full">
            {badges.map((b) => (
              <Link to="/badges" key={b.id || b.code} className="profile-badge-full-item" title={b.title}>
                <span className="profile-badge-full-icon">{b.icon}</span>
                <span className="profile-badge-full-title">{b.title}</span>
              </Link>
            ))}
          </div>
        );
      break;
    default:
      mainContent = overviewMain;
  }

  const showSidebar = activeTab === "overview" || activeTab === "books";

  return (
    <div className="profile-page">
      <ProfileSummary profileSummary={profileSummary} isOwnProfile={isOwnProfile} />
      <ProfileTabs active={activeTab} onChange={setTab} />

      <div className={`page-layout ${showSidebar ? "" : "page-layout-full"}`}>
        <main className="page-main">{mainContent}</main>
        {showSidebar && sidebar}
      </div>

      {favoritePickerOpen && (
        <BookFilter
          open={favoritePickerOpen}
          handleDialog={setFavoritePickerOpen}
          selectedBookHandler={handleAddFavorite}
          data={books}
        />
      )}
    </div>
  );
};

export default ProfilePage;
