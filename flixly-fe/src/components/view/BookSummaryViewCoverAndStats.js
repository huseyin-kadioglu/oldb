import { useState } from "react";
import "./BookSummaryView.css";
import PhotoFrame from "./../frame/PhotoFrame.js";

const BookSummaryViewCoverAndStats = ({ book }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="coverAndStats">
      <PhotoFrame book={book} showTitle={false} />
    </div>
  );
};
export default BookSummaryViewCoverAndStats;
