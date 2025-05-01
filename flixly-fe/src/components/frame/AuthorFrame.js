import React from "react";
import "./PhotoFrame.css";

const AuthorFrame = ({
  coverUrl = "https://img.kitapyurdu.com/v1/getImage/fn:5723564/wh:true/wi:800",
}) => {
  return (
    <div className="photo-frame">
      <img src={coverUrl} className={"small-pic"} />
    </div>
  );
};

export default AuthorFrame;
