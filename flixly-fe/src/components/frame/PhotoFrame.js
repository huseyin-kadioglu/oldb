import React from "react";
import "./PhotoFrame.css";
import { Link } from "react-router-dom";

const PhotoFrame = ({ imageUrl, title }) => {
  return (
    <div className="photo-frame">
      <Link to={"/"}>
        <img src={imageUrl} alt={title} className="cover" />
      </Link>
      <p className="title">{title}</p>
    </div>
  );
};

export default PhotoFrame;
