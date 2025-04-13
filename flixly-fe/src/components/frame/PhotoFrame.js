import React from "react";
import "./PhotoFrame.css";
import { Link } from "react-router-dom";

const PhotoFrame = ({ book, coverUrl, title, className }) => {

  const imageClass = className ? className : "cover";

  return (
    <div className="photo-frame">
      <Link to={"/book/}"}>
        <img src={coverUrl} alt={title} className={imageClass} />
      </Link>
      <p className="title">{title}</p>
    </div>
  );
};

export default PhotoFrame;
