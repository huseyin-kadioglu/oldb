import ProfileSummary from "./ProfileSummary";
import FrameBlock from "./../common/FrameBlock";
import { getProfileSummary } from "../../service/APIService";
import { useEffect, useState } from "react";
import "./ProfilePage.css";
import Review from "./Review";

const Profile = (props) => {
  const [profileSummary, setProfileSummary] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileSummary();
  }, []);

  const fetchProfileSummary = async () => {
    try {
      const data = await getProfileSummary();
      setProfileSummary(data);
    } catch (err) {
      setError("Kitaplar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  console.log("profileSummary", profileSummary);
  return (
    <>
      <ProfileSummary props={props} profileSummary={profileSummary} />

      <div className="profile-page">
        <div className="main-content">
          <FrameBlock
            title="Favourite Books"
            books={profileSummary?.favoriteBooks}
          />
          {/*           <FrameBlock
            title="Recent Activity"
            books={profileSummary?.recentActivity}
          /> */}
          <Review reviews={profileSummary?.reviews} />
        </div>

        <aside className="sidebar">
          <div className="readlist">
            <h2>Readlist</h2>
            <hr></hr>
            <div className="readlist-images">
              {profileSummary?.readList?.slice(0, 10).map((book, index) => (
                <img
                  key={book.id}
                  src={book.coverUrl}
                  alt={book.title}
                  className="readlist-image"
                  style={{ zIndex: 5 - index, left: `${index * 15}px` }} // bindirme efekti için
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};
export default Profile;
