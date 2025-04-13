import { useState } from "react";
import "./BookSummaryView.css";
import { Link } from "react-router-dom";

const BookSummaryTitleDescAndLog = (props) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="titleDescLog">
      <p>
        {" "}
        KENDİME DÜŞÜNCELER MÖ.200 Written by{" "}
        <span>
          {" "}
          <Link to={"/author/${authorId}"}> MARCUS AURELIUS</Link>
        </span>{" "}
      </p>

      <div> TOTAL READ FALAN.</div>
    </div>
  );
};
export default BookSummaryTitleDescAndLog;
