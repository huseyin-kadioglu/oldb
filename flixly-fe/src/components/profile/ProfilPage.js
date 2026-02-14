import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileSummary from "./ProfileSummary";
import FrameBlock from "./../common/FrameBlock";
import Review from "./Review";
import { getProfileSummary } from "../../service/APIService";
import "./ProfilePage.css";

const ProfilePage = () => {
  // Burada profil sayfası açılacak. Kendi profilimi yoksa başkasının mı diye bakılmalı.
  const { username } = useParams(); // URL'den kullanıcı adını al
  const [profileSummary, setProfileSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Giriş yapan kullanıcıyı sistemden al (örneğin Context'ten)
  const isOwnProfile = sessionStorage.getItem("username") === username;

  useEffect(() => {
    fetchProfileSummary();
  }, [username]);

  const fetchProfileSummary = async () => {
    try {
      const data = await getProfileSummary(username);
      console.log("ProfilePage rendered! Fetching data for", username);
      setProfileSummary(data);
    } catch (err) {
      setError("Profil yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  if (!profileSummary) return null;

  return (
    <>
      <ProfileSummary
        profileSummary={profileSummary}
        isOwnProfile={isOwnProfile}
      />

      <div className="page-layout">
        <main className="page-main">
          <div className="main-content">
            <FrameBlock
              title="Favori Kitaplar"
              books={profileSummary?.favoriteBooks}
            />
            <FrameBlock
              title="Son Aktiviteler"
              books={profileSummary?.recentActivity}
            />
            <Review reviews={profileSummary?.reviews} />
          </div>
        </main>

        <aside className="page-sidebar">
          <div className="sidebar-logo">
            <img src="getpro.png" alt="Logo" />
          </div>
          <div className="readlist sidebar-block">
            <h2 className="sidebar-title">Okuma listesi</h2>
            <hr />
            <div className="readlist-images">
              {profileSummary?.readList?.slice(0, 6).map((book) => (
                <img
                  key={book.id}
                  src={book.coverUrl}
                  alt={book.title}
                  className="readlist-image"
                  title={book.title}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default ProfilePage;
