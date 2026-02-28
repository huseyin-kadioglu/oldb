import ProfileSummary from "./ProfileSummary";
import FrameBlock from "./../common/FrameBlock";
import { useEffect, useState } from "react";
import "./ProfilePage.css";
import Review from "./Review";
import { getProfileSummaryByUsername } from "../../service/APIService";
import { useParams, useNavigate } from "react-router-dom";

const BookListSection = ({ title, books, navigateTo, emptyText }) => {
  const navigate = useNavigate();
  const preview = books?.slice(0, 6) || [];
  const extra = (books?.length || 0) - 6;

  return (
    <div className="profile-list-section" onClick={() => navigate(navigateTo)}>
      <div className="profile-list-header">
        <span className="profile-list-title">{title}</span>
        <span className="profile-list-count">{books?.length || 0}</span>
      </div>
      <hr />
      {preview.length > 0 ? (
        <div className="profile-list-covers">
          {preview.map((book) => (
            <img
              key={book.id}
              src={book.coverUrl}
              alt={book.title}
              className="profile-list-cover"
              title={book.title}
            />
          ))}
          {extra > 0 && <span className="profile-list-more">+{extra}</span>}
        </div>
      ) : (
        <p className="profile-list-empty">{emptyText}</p>
      )}
    </div>
  );
};

const Profile = (props) => {
  const { username } = useParams();
  const [profileSummary, setProfileSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileSummary();
  }, [username]);

  const fetchProfileSummary = async () => {
    try {
      const data = await getProfileSummaryByUsername(username);
      setProfileSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <ProfileSummary props={props} profileSummary={profileSummary} />

      <div className="profile-page">
        <div className="main-content">
          <FrameBlock
            title="Favori Kitaplar"
            books={profileSummary?.favoriteBooks}
          />

          <Review reviews={profileSummary?.reviews} />
        </div>

        <aside className="sidebar">
          <BookListSection
            title="Kütüphanem"
            books={profileSummary?.libraryBooks}
            navigateTo={`/profile/${username}/list/library`}
            emptyText="Henüz kütüphaneye kitap eklenmemiş."
          />

          <BookListSection
            title="Okuma Listesi"
            books={profileSummary?.readList}
            navigateTo={`/profile/${username}/list/readlist`}
            emptyText="Henüz kitap eklenmemiş."
          />

          <BookListSection
            title="Tamamlananlar"
            books={profileSummary?.completedBooks}
            navigateTo={`/profile/${username}/list/completed`}
            emptyText="Henüz tamamlanan kitap yok."
          />
        </aside>
      </div>
    </>
  );
};

export default Profile;
