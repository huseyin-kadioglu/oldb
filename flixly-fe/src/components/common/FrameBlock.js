import PhotoFrame from "../frame/PhotoFrame";
import "./FrameBlock.css";

const FrameBlock = ({ title, books }) => {
  return (
    <div className="frame-block">
      <p>{title}</p>
      <hr></hr>
      <div className="gallery">
        {books.map((book, index) => (
          <PhotoFrame key={index} coverUrl={book.coverUrl} title={book.title} />
        ))}
      </div>
    </div>
  );
};
export default FrameBlock;
