import ProfileSummary from "./ProfileSummary";
import FrameBlock from "./../common/FrameBlock";
import { getProfileSummary } from "../../service/BookService";
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
      console.log(data);
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
      <FrameBlock title="Favourite Films" initialBooks={profileSummary.favoriteBooks}></FrameBlock>
      <FrameBlock title="Recent Activity"></FrameBlock>
    </div>
  );
};
export default Profile;
