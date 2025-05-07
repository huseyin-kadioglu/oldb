import ProfileSummary from "./ProfileSummary";
import FrameBlock from "./../common/FrameBlock";
import { getProfileSummary } from "../../service/APIService";
import React, { useEffect, useState } from "react";

const Profile = (props) => {
  const [profileSummary, setProfileSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileSummary();
  }, []);

  const fetchProfileSummary = async () => {
    try {
      const data = await getProfileSummary(); // Servis çağrısı
      setProfileSummary(data);
    } catch (err) {
      setError("Kitaplar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProfileSummary props={props} profileSummary={profileSummary} />
      <FrameBlock
        title="Favourite Books"
        favBooks={profileSummary?.favoriteBooks}
      />
      <FrameBlock title="Recent Activity" />
    </div>
  );
};
export default Profile;
