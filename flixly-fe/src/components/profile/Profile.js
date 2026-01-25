import ProfileSummary from "./ProfileSummary";
import FrameBlock from "./../common/FrameBlock";
import { useEffect, useState } from "react";
import "./ProfilePage.css";
import Review from "./Review";
import { getProfileSummaryByUsername } from "../../service/APIService";
import { useParams } from "react-router-dom";

const Profile = (props) => {
  const { username } = useParams();

  const [profileSummary, setProfileSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileSummary();
  }, []);

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
            title="Favourite Books"
            books={profileSummary?.favoriteBooks}
          />

          <Review reviews={profileSummary?.reviews} />
        </div>

        <aside className="sidebar">
          <div className="readlist">
            <h2>Readlist</h2>
            <hr />

            <div className="readlist-images">
              {profileSummary?.readList?.slice(0, 10).map((book, index) => (
                <img
                  key={book.id}
                  src={book.coverUrl}
                  alt={book.title}
                  className="readlist-image"
                  style={{ left: `${index * 18}px`, zIndex: 10 - index }}
                />
              ))}
            </div>

            {profileSummary?.readList?.length > 10 && (
              <span className="readlist-more">
                +{profileSummary.readList.length - 10} more
              </span>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Profile;
