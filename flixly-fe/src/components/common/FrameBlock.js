import PhotoFrame from "../frame/PhotoFrame";
import "./FrameBlock.css";
import React, { useEffect, useState } from "react";
import { getBooks } from "../../service/APIService"; // Servis dosyasını import et

const FrameBlock = ({ title, favBooks }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  // fixme: burada da gerek olmayabilir parentında çağrılıyor.
  const fetchBooks = async () => {
    try {
      const data = await getBooks(); // Servis çağrısı
      setBooks(data);
    } catch (err) {
      setError("Kitaplar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="frame-block">
      <p>{title}</p>
      <hr></hr>
      <div className="gallery">
        {favBooks == null
          ? books.map((book, index) => <PhotoFrame key={index} book={book} />)
          : favBooks.map((book, index) => (
              <PhotoFrame book={book} key={index} />
            ))}
      </div>
    </div>
  );
};
export default FrameBlock;
