import PhotoFrame from "../frame/PhotoFrame";
import "./FrameBlock.css";

const FrameBlock = ({ title, books }) => {
  books = [
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81YOuOGFCJL._AC_UF1000,1000_QL80_.jpg",
      title: "1984 - George Orwell",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/71QKQ9mwV7L._AC_UF1000,1000_QL80_.jpg",
      title: "Brave New World - Aldous Huxley",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81A-mvlo+QL._AC_UF1000,1000_QL80_.jpg",
      title: "The Catcher in the Rye - J.D. Salinger",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/71jG%2Be7roXL._AC_UF1000,1000_QL80_.jpg",
      title: "The Great Gatsby - F. Scott Fitzgerald",
    },
  ];

  return (
    <div className="frame-block">
      <p>{title}</p>
      <hr></hr>
      <div className="gallery">
        {books.map((book, index) => (
          <PhotoFrame key={index} imageUrl={book.imageUrl} title={book.title} />
        ))}
      </div>
    </div>
  );
};
export default FrameBlock;
