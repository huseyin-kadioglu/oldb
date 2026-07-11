import React, { useState } from "react";
import "./Avatar.css";
import { resolveMediaUrl } from "../../service/APIService";

const InitialAvatar = ({ name, src, navbarImg = false, className = "" }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const base = `${navbarImg ? "navbar-avatar" : "avatar"} ${className}`.trim();
  const resolved = resolveMediaUrl(src);

  const initials = name
    ? name
        .split(" ")
        .map((word) => word[0]?.toUpperCase())
        .slice(0, 2)
        .join("")
    : "?";

  if (resolved && !imgFailed) {
    return (
      <img
        src={resolved}
        alt={name || "Avatar"}
        className={base}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return <div className={base}>{initials || "?"}</div>;
};

export default InitialAvatar;
