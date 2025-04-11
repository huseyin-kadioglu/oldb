import React from "react";
import "./PhotoFrame.css";
import { Link } from "react-router-dom";

const PhotoFrame = ({ coverUrl, title, className }) => {

  const imageClass = className ? className : "cover";

  return (
    <div className="photo-frame">
      <Link to={"/"}>
        <img src={coverUrl} alt={title} className={imageClass} />
      </Link>
      <p className="title">{title}</p>
    </div>
  );
};

export default PhotoFrame;
