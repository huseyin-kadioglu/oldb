import PhotoFrame from "../frame/PhotoFrame";
import "./FrameBlock.css";
import React, { useEffect, useState } from "react";
import { getBooks } from "../../service/APIService"; // Servis dosyasını import et

const FrameBlock = ({ title, initialBooks }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooks(); // Servis çağrısı
        console.log(data);
        setBooks(data);
      } catch (err) {
        setError("Kitaplar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="frame-block">
      <p>{title}</p>
      <hr></hr>
      <div className="gallery">
        {initialBooks == null
          ? books.map((book, index) => (
              <PhotoFrame
                key={index}
                book={book}
                coverUrl={book.coverUrl}
                title={book.title}
              />
            ))
          : initialBooks.map((book, index) => (
              <PhotoFrame
                key={index}
                coverUrl={book.coverUrl}
                title={book.title}
              />
            ))}
      </div>
    </div>
  );
};
export default FrameBlock;
