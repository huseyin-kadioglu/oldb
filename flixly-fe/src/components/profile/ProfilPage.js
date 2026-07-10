import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import ProfileSummary from "./ProfileSummary";

import SectionHeader from "../ui/SectionHeader";

import BookCoverCard from "../ui/BookCoverCard";

import CoverImage from "../ui/CoverImage";

import Review from "./Review";

import BookFilter from "../common/BookFilter";

import { createUserActivityFromGhostMenu, getProfileSummaryByUsername } from "../../service/APIService";
import { formatActivitySentence } from "../../utils/activityCopy";
import "../ui/folios-ui.css";
import "./ProfilePage.css";

const SidebarList = ({ title, books, to, emptyText }) => {

  const preview = books?.slice(0, 6) || [];

  if (!books?.length) {

    return (

      <div className="sidebar-block">

        <SectionHeader title={title} to={to} linkLabel="Tümü" />

        <p className="profile-list-empty">{emptyText}</p>

      </div>

    );

  }



  return (

    <div className="sidebar-block">

      <SectionHeader title={title} to={to} linkLabel="Tümü" />

      <div className="readlist-thumbs">

        {preview.map((book) => (

          <Link key={book.id} to={`/book/${book.id}`} state={{ book }}>

            <CoverImage src={book.coverUrl} alt={book.title} title={book.title} />

          </Link>

        ))}

      </div>

    </div>

  );

};



const ProfilePage = ({ books = [] }) => {

  const { username } = useParams();

  const [profileSummary, setProfileSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [favoritePickerOpen, setFavoritePickerOpen] = useState(false);

  const isOwnProfile = sessionStorage.getItem("username") === username;



  const loadProfile = () => {

    getProfileSummaryByUsername(username)

      .then(setProfileSummary)

      .catch(() => setError("Profil yüklenirken bir hata oluştu."))

      .finally(() => setLoading(false));

  };



  useEffect(() => {

    loadProfile();

  }, [username]);



  const handleAddFavorite = async (book) => {

    if (!book) return;

    setFavoritePickerOpen(false);

    await createUserActivityFromGhostMenu({

      bookId: book.id,

      authorId: book.authorId,

      actionType: "FAVOURITE",

      action: "ADD",

    });

    loadProfile();

  };



  if (loading) return <div className="page-loading">Yükleniyor…</div>;

  if (error) return <div className="page-error">{error}</div>;

  if (!profileSummary) return null;



  const readBooks = profileSummary.readBooks || profileSummary.completedBooks || [];



  const authorCounts = {};

  (profileSummary.recentActivity || []).forEach((book) => {

    const name = book.authorName || "Bilinmeyen";

    authorCounts[name] = (authorCounts[name] || 0) + 1;

  });

  const topAuthors = Object.entries(authorCounts)

    .sort((a, b) => b[1] - a[1])

    .slice(0, 4);



  return (

    <div className="profile-page">

      <ProfileSummary profileSummary={profileSummary} isOwnProfile={isOwnProfile} />



      <div className="page-layout">

        <main className="page-main">

          <section className="profile-section">

            <div className="profile-section-header-row">

              <SectionHeader

                title="Favori Kitaplar"

                to={`/profile/${username}/list/favorites`}

              />

              {isOwnProfile && (

                <button

                  type="button"

                  className="profile-add-favorite-btn"

                  onClick={() => setFavoritePickerOpen(true)}

                >

                  + Favori ekle

                </button>

              )}

            </div>

            {profileSummary.favoriteBooks?.length > 0 ? (

              <div className="folios-book-grid profile-book-grid">

                {profileSummary.favoriteBooks.map((book) => (

                  <BookCoverCard key={book.id} book={book} />

                ))}

              </div>

            ) : (

              <p className="profile-list-empty">Henüz favori kitap eklenmemiş.</p>

            )}

          </section>



          {profileSummary.recentActivity?.length > 0 && (

            <section className="profile-section">

              <SectionHeader title="Son Aktiviteler" to="/activities" />

              <div className="activity-feed">

                {profileSummary.recentActivity.slice(0, 5).map((book) => (
                  <Link
                    key={`${book.bookId}-${book.updateDate}`}
                    to={`/book/${book.bookId}`}
                    className="activity-feed-item folios-card"
                  >
                    <CoverImage src={book.coverUrl} alt="" className="activity-feed-cover" />
                    <div className="activity-feed-body">
                      <p className="activity-feed-text">
                        {formatActivitySentence(
                          book.comment ? "REVIEW" : book.status,
                          book.bookTitle || book.title,
                          profileSummary.profileName || username
                        )}
                      </p>
                      {book.authorName && (
                        <p className="activity-feed-meta">{book.authorName}</p>
                      )}
                    </div>
                  </Link>
                ))}

              </div>

            </section>

          )}



          <Review reviews={profileSummary.reviews} />

          {(profileSummary.genrePreferences || []).length > 0 && (
            <section className="home-section">
              <SectionHeader title="Tür tercihleri" />
              <div className="genre-pref-list">
                {profileSummary.genrePreferences.map((g) => (
                  <div className="genre-pref-row" key={g.genre}>
                    <div className="genre-pref-top">
                      <span>{g.genre}</span>
                      <span>{g.percent}%</span>
                    </div>
                    <div className="genre-pref-bar">
                      <div style={{ width: `${g.percent}%` }} />
                    </div>
                    <span className="genre-pref-count">{g.count} kitap</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>



        <aside className="page-sidebar">

          {topAuthors.length > 0 && (

            <div className="sidebar-block">

              <h3 className="sidebar-title">En Çok Okunan Yazarlar</h3>

              {topAuthors.map(([name, count]) => {

                const pct = Math.min(100, count * 20);

                return (

                  <div className="author-progress-row" key={name}>

                    <div className="author-progress-top">

                      <span className="author-progress-name">{name}</span>

                      <span className="author-progress-count">{count} kitap</span>

                    </div>

                    <div className="author-progress-bar">

                      <div className="author-progress-fill" style={{ width: `${pct}%` }} />

                    </div>

                  </div>

                );

              })}

            </div>

          )}



          <div className="sidebar-block">
            <h3 className="sidebar-title">Rozetler</h3>
            <div className="profile-badges-grid">
              {(profileSummary?.earnedBadges?.length ?? 0) === 0 ? (
                <p className="profile-list-empty">Henüz rozet yok.</p>
              ) : (
                profileSummary.earnedBadges.slice(0, 8).map((b) => (
                  <Link
                    to="/badges"
                    key={b.id || b.code}
                    className="profile-badge-item"
                    title={b.title}
                  >
                    <span>{b.icon}</span>
                  </Link>
                ))
              )}
            </div>
            <Link to="/badges" className="profile-badges-link">
              Tüm rozetleri gör →
            </Link>
          </div>



          <SidebarList

            title="Kütüphanem"

            books={profileSummary.libraryBooks}

            to={`/profile/${username}/list/library`}

            emptyText="Sahip olduğun kitaplar burada görünür."

          />



          <SidebarList

            title="Alınacaklar"

            books={profileSummary.shoppingBooks}

            to={`/profile/${username}/list/shopping`}

            emptyText="Alınacak kitaplar burada görünür."

          />



          <SidebarList

            title="Okuma Listesi"

            books={profileSummary.readList}

            to={`/profile/${username}/list/readlist`}

            emptyText="Henüz okuma listesine kitap eklenmemiş."

          />



          <SidebarList

            title="Okunanlar"

            books={readBooks}

            to={`/profile/${username}/list/read`}

            emptyText="Henüz okunan kitap yok."

          />



          <SidebarList

            title="Bırakılanlar"

            books={profileSummary.droppedBooks}

            to={`/profile/${username}/list/dropped`}

            emptyText="Henüz bırakılan kitap yok."

          />

        </aside>

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

