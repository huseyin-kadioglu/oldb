import "./Activities.css"; // önce bu
import { useEffect, useState } from "react";
import { getProfileSummary } from "../../service/APIService";
import Review from "../profile/Review";

const Activies = () => {
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

  const hasReviews = profileSummary?.reviews?.length > 0;

  return (
    <div className="activies-container">
      {loading && <div className="loading-message">Yükleniyor...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !hasReviews && (
        <div className="no-activity-message">
          Henüz bir aktivite bulunamadı.
        </div>
      )}

      {!loading && hasReviews && <Review reviews={profileSummary.reviews} />}
    </div>
  );
};

export default Activies;
