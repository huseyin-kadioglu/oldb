import "../content/Content.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getBooks } from "../../service/BookService";
import FrameBlock from "../common/FrameBlock";

const Books = () => {
  const user = "huseyinkadioglu";

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

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

  return (
    <div className="container">
      <FrameBlock books={books} title="All Books"></FrameBlock>
    </div>
  );
};
export default Books;
