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
        <span className="book-year"> ({book.publicationYear}) </span>
        <span className="book-written-by"> Written by </span>
        <span className="author">
          <Link
            className="book-author"
            to={`/author/${book.authorId}`}
            state={{ author }}
          >
            {author.name}
          </Link>
        </span>
      </div>
      <div className="details-and-actions">
        <div className="desc-and-detail-card">
          <span className="desc">
            <p>{book.description}</p>
          </span>
          <div className="detail-card">
            <ul>
              <li>
                <span>Publisher</span>
                <p>İş Bankası Kültür Yayınları</p>
              </li>
              <li>
                <span>Publication Year</span>
                <p>2014</p>
              </li>
              <li>
                <span>Çevirmen</span>
                <p>Levent Cinemre</p>
              </li>
              <li>
                <span>Sayfa Sayısı</span>
                <p>524</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="action-menu">
          <aside>
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
    </div>
  );
};
export default BookSummaryTitleDescAndLog;
