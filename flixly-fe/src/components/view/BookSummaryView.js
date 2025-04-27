import { useState } from "react";
import "./BookSummaryView.css";
import BookSummaryViewCoverAndStats from "./BookSummaryViewCoverAndStats.js";
import BookSummaryTitleDescAndLog from "./BookSummaryTitleDescAndLog.js";
import BookSummaryViewActivity from "./BookSummaryViewActivity.js";

const BookSummaryView = (props) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="bookSummaryMainView">
      <BookSummaryViewCoverAndStats />
      <BookSummaryTitleDescAndLog />
    </div>
  );
};
export default BookSummaryView;
