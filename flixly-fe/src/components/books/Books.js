import "../content/Content.css";
import "./Books.css";
import React, { useMemo, useState } from "react";
import FrameBlock from "../common/FrameBlock";
import BooksFilterPanel from "./BooksFilterPanel";
import { getFilteredBooks } from "../../service/APIService";

const Books = ({ books }) => {
  const [displayBooks, setDisplayBooks] = useState(null);
  const [loading, setLoading] = useState(false);

  const shownBooks = displayBooks !== null ? displayBooks : books;

  const allCountries = useMemo(() => {
    const set = new Set(books?.map((b) => b.authorCountry).filter(Boolean));
    return Array.from(set).sort();
  }, [books]);

  const handleFilterChange = async (filters) => {
    const hasFilter =
      filters.nobelOnly ||
      filters.country ||
      filters.yearFrom ||
      filters.yearTo ||
      filters.minRating > 0;

    if (!hasFilter) {
      setDisplayBooks(null);
      return;
    }

    setLoading(true);
    try {
      const result = await getFilteredBooks(filters);
      setDisplayBooks(result.books ?? []);
    } catch (err) {
      console.error("Filtre hatası:", err);
      setDisplayBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const title = loading
    ? "Kitaplar..."
    : `Kitaplar (${shownBooks?.length ?? 0})`;

  return (
    <div className="books-page">
      <BooksFilterPanel allCountries={allCountries} onFilterChange={handleFilterChange} />
      <FrameBlock books={shownBooks} title={title} />
    </div>
  );
};

export default Books;
