import { Link } from "react-router-dom";

import CoverImage from "./CoverImage";

import "../ui/folios-ui.css";



const BookCoverCard = ({ book, showAuthor = true }) => {

  if (!book) return null;



  return (

    <Link to={`/book/${book.id}`} state={{ book }} className="folios-book-card">

      <CoverImage

        src={book.coverUrl}

        alt={book.title}

        className="folios-book-card-cover"

      />

      <p className="folios-book-card-title">{book.title}</p>

      {showAuthor && (

        <p className="folios-book-card-author">{book.authorName || "—"}</p>

      )}

    </Link>

  );

};



export default BookCoverCard;

