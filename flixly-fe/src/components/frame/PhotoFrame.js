import React from "react";
import './PhotoFrame.css'

const PhotoFrame = ({ imageUrl, title }) => {
  return (
    <div className="photo-frame">
    <img src={imageUrl} alt={title} className="photo" />
    <p className="title">{title}</p>
  </div>
  );
};

export default PhotoFrame;