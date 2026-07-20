import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../../service/APIService";
import "./CoverImage.css";

const DEFAULT_COVER = "/default-cover.svg";
const DEFAULT_AVATAR = "/default-avatar.svg";

export const defaultCoverUrl = (title) => DEFAULT_COVER;
export const defaultAvatarUrl = (name) => DEFAULT_AVATAR;

const CoverImage = ({ src, alt, className, style, variant = "cover" }) => {
  const fallback = variant === "avatar" ? DEFAULT_AVATAR : DEFAULT_COVER;
  const resolved = resolveMediaUrl(src) || (src && String(src).trim() ? String(src).trim() : null);
  const [url, setUrl] = useState(resolved || fallback);

  useEffect(() => {
    setUrl(resolved || fallback);
  }, [resolved, fallback]);

  return (
    <img
      src={url}
      alt={alt || (variant === "avatar" ? "Portre" : "Kitap kapağı")}
      className={`cover-image ${className || ""}`}
      style={style}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (url !== fallback) setUrl(fallback);
      }}
    />
  );
};

export default CoverImage;
