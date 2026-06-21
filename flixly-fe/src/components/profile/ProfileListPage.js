import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProfileBookList } from "../../service/APIService";
import FrameBlock from "../common/FrameBlock";
import "./ProfilePage.css";

const LIST_TITLES = {
  library: "Kütüphanem",
  readlist: "Okuma Listesi",
  completed: "Tamamlananlar",
};

const ProfileListPage = () => {
  const { username, listType } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const title = LIST_TITLES[listType?.toLowerCase()] ?? "Kitap Listesi";

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfileBookList(username, listType);
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Liste yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [username, listType]);

  if (loading) return <div className="profile-list-page">Yükleniyor...</div>;
  if (error) return <div className="profile-list-page">{error}</div>;

  return (
    <div className="profile-list-page">
      <Link to={`/profile/${username}`} className="profile-list-back">
        ← Profile dön
      </Link>
      <FrameBlock title={title} books={books} showGhostMenu={false} />
    </div>
  );
};

export default ProfileListPage;
