import React from "react";
import "./PhotoFrame.css";
import { Link } from "react-router-dom";

const PhotoFrame = ({
  book,
  coverUrl = "https://img.kitapyurdu.com/v1/getImage/fn:5723564/wh:true/wi:800",
  title,
  className,
  showTitle = true,
}) => {
  const imageClass = className ? className : "cover";

  return (
    <div className="photo-frame">
      <Link to={"/book/}"}>
        <img src={coverUrl} alt={title} className={imageClass} />
      </Link>
      {showTitle && <p className="title">{title}</p>}
    </div>
  );
};

export default PhotoFrame;
