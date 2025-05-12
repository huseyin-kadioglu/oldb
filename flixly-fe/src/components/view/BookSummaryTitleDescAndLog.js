import { useState } from "react";
import "./BookSummaryView.css";
import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";

const BookSummaryTitleDescAndLog = ({ book, author }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //console.log(book);

  return (
    <div className="container">
      <div className="title">
        <span className="book-title">{book.title}</span>
        <span className="book-year"> {book.publicationYear} </span>
        <span className="book-written-by"> Written by </span>
        <Link
          className="book-author"
          to={`/author/${book.authorId}`}
          state={{ author }}
        >
          {author.name}
        </Link>
      </div>
      <div className="activity">
        <div className="desc">
          <p>{book.description}</p>
        </div>

        <aside className="activity-menu">
          <ul>
            <li>
              <CheckBoxOutlineBlankIcon style={{ fontSize: 30 }} />
              <span>Read</span>
            </li>
            <li>
              <FavoriteBorderIcon style={{ fontSize: 30 }} />
              <span>Favourite</span>
            </li>
            <li>
              <LibraryAddIcon style={{ fontSize: 30 }} />
              <span>Readlist</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};
export default BookSummaryTitleDescAndLog;
