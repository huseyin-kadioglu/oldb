import { Link } from "react-router-dom";
import PhotoFrame from "../frame/PhotoFrame";
import CoverImage from "../ui/CoverImage";
import "./FrameBlock.css";

const FrameBlock = ({ title, books, showGhostMenu = true, compact = false }) => {
  const list = books || [];

  return (
    <div className={`frame-block${compact ? " frame-block--compact" : ""}`}>
      <p>{title}</p>
      <hr />
      {compact ? (
        <div className="gallery gallery--compact">
          {list.map((book, index) => (
            <Link
              key={book?.id ?? index}
              to={book?.id ? `/book/${book.id}` : "#"}
              className="gallery-compact-item"
              title={book?.title}
            >
              <CoverImage
                src={book?.coverUrl || book?.cover}
                alt={book?.title || "Kapak"}
                className="gallery-compact-img"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="gallery">
          {list.map((book, index) => (
            <PhotoFrame key={book?.id ?? index} book={book} showGhostMenu={showGhostMenu} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FrameBlock;
