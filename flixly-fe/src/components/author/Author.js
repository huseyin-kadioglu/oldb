import { useEffect } from "react";
import AuthorFrame from "../frame/AuthorFrame";
import "./Author.css";
import { useLocation } from "react-router-dom";
import PhotoFrame from "../frame/PhotoFrame";
import AuthorProgressBar from "./AuthorProgressBar";

const Author = ({}) => {
  const location = useLocation();
  const author = location.state?.author;
  
  const totalBooks = author.bookWrittenBy.length;
  // Authorizationdan sonra eklenecek.
  const readBooks = 5;
  const percentage = (readBooks / totalBooks) * 100;

  return (
    <div className="author-view">
      <div className="author-left">
        <span>
          <p>Written by</p>
        </span>
        <span>
          <h3>{author.name}</h3>
        </span>
        <hr></hr>

        <div className="gallery">
          {author.bookWrittenBy != null &&
            author.bookWrittenBy.map((book, index) => (
              <PhotoFrame key={index} book={book} justShowCover={true} />
            ))}
        </div>
      </div>
      <div className="author-right">
        <AuthorFrame coverUrl={author.portrait} />
        <span>
          <p>{author.description}</p>
        </span>

        <AuthorProgressBar totalBooks={10} readBooks={5} />
      </div>
    </div>
  );
};
export default Author;
