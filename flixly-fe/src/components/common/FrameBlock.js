import PhotoFrame from "../frame/PhotoFrame";
import "./FrameBlock.css";

const FrameBlock = ({ title, books, showGhostMenu = true }) => {

  return (
    <div className="frame-block">
      <p>{title}</p>
      <hr></hr>
      <div className="gallery">
        {books?.map((book, index) => (
          <PhotoFrame key={book?.id ?? index} book={book} showGhostMenu={showGhostMenu} />
        ))}
      </div>
    </div>
  );
};
export default FrameBlock;
