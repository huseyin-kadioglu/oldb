import React from "react";
import CoverImage from "../ui/CoverImage";
import "./PhotoFrame.css";

const AuthorFrame = ({ coverUrl, name }) => {
  return (
    <div className="photo-frame">
      <CoverImage
        src={coverUrl}
        alt={name || "Yazar"}
        className="small-pic"
        variant="avatar"
      />
    </div>
  );
};

export default AuthorFrame;
