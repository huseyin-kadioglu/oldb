import { useState } from "react";
import "./BookSummaryView.css";

const BookSummaryViewCoverAndStats = (props) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="coverAndStats">
        <div> COVER </div>
        
        <div> TOTAL READ FALAN.</div>
    </div>
  );
};
export default BookSummaryViewCoverAndStats;
