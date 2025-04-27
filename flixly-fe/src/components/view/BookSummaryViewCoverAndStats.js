import { useState } from "react";
import "./BookSummaryView.css";
import PhotoFrame from "./../frame/PhotoFrame.js";

const BookSummaryViewCoverAndStats = (props) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="coverAndStats">
      <PhotoFrame title={"book.title"} showTitle={false} />
    </div>
  );
};
export default BookSummaryViewCoverAndStats;
