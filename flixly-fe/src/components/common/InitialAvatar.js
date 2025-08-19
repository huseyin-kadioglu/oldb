import React from "react";
import "./Avatar.css";

const InitialAvatar = ({ name, navbarImg = false }) => {
  if (!name) return <div className={navbarImg ? "navbar-avatar" : "avatar"}>?</div>;

  const initials = name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div className={navbarImg ? "navbar-avatar" : "avatar"}>
      {initials}
    </div>
  );
};

export default InitialAvatar;
