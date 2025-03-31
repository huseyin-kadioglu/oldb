import "./Content.css";
import FrameBlock from "../common/FrameBlock";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getBooks } from "../../service/BookService"; // Servis dosyasını import et

const Content = () => {
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
      <h2>
        Welcome back,{" "}
        <span>
          <Link to={"/profile"}>{user}</Link>
        </span>
        . Here’s what we’ve been reading...
      </h2>
      <FrameBlock books={books} title="Popular Books"></FrameBlock>
    </div>
  );
};
export default Content;
