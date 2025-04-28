import React from "react";
import "./PhotoFrame.css";
import { Link } from "react-router-dom";

const PhotoFrame = ({
  book,
  className,
  showTitle = true,
  justShowCover = false,
}) => {
  const imageClass = className ? className : "cover";
  const coverUrl =
    book?.coverUrl === undefined
      ? "https://img.kitapyurdu.com/v1/getImage/fn:5723564/wh:true/wi:800"
      : book.coverUrl;

  console.log("PhotoFrame book: ", book);

  if (!book) {
    return <div>Kitap verisi yok</div>;
  }

  return justShowCover == true ? (
    <div className="photo-frame">
      <img src={coverUrl} alt={book.title} className={imageClass} />
      {showTitle && <p className="title">{book.title}</p>}
    </div>
  ) : (
    <div className="photo-frame">
      <Link to={`/book/${book.id}`} state={{ book }}>
        <img src={coverUrl} alt={book.title} className={imageClass} />
      </Link>
      {showTitle && <p className="title">{book.title}</p>}
    </div>
  );
};

export default PhotoFrame;
