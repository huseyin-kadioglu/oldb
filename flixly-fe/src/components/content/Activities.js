import "../content/Content.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getBooks, getProfileSummary } from "../../service/APIService";
import FrameBlock from "../common/FrameBlock";
import { useParams } from "react-router-dom";
import Review from "../profile/Review";

const Activies = ({ books }) => {
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

  return (
    <div className="container">
      <Review reviews={profileSummary?.reviews} />
    </div>
  );
};
export default Activies;
