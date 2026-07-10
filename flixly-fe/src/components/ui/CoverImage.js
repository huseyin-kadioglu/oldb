import { useEffect, useState } from "react";
import "./CoverImage.css";

const DEFAULT_COVER = "/default-cover.svg";
const DEFAULT_AVATAR = "/default-avatar.svg";

export const defaultCoverUrl = (title) => DEFAULT_COVER;
export const defaultAvatarUrl = (name) => DEFAULT_AVATAR;

const CoverImage = ({ src, alt, className, style, variant = "cover" }) => {
  const fallback = variant === "avatar" ? DEFAULT_AVATAR : DEFAULT_COVER;
  const [url, setUrl] = useState(src && String(src).trim() ? src : fallback);

  useEffect(() => {
    setUrl(src && String(src).trim() ? src : fallback);
  }, [src, fallback]);

  return (
    <img
      src={url}
      alt={alt || (variant === "avatar" ? "Portre" : "Kitap kapağı")}
      className={`cover-image ${className || ""}`}
      style={style}
      loading="lazy"
      onError={() => {
        if (url !== fallback) setUrl(fallback);
      }}
    />
  );
};

export default CoverImage;
