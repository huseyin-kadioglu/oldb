import { useEffect, useState } from "react";
import "./BookSummaryView.css";
import BookSummaryViewCoverAndStats from "./BookSummaryViewCoverAndStats.js";
import BookSummaryTitleDescAndLog from "./BookSummaryTitleDescAndLog.js";
import { useLocation, useParams } from "react-router-dom";
import { getAuthorById, getBookById } from "../../service/APIService.js";

const BookSummaryView = (props) => {
  const [author, setAuthor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const params = useParams();

  // book may come from location state (when navigated from list),
  // or from App's `books` prop via route element, or we fetch by id.
  const stateBook = location.state?.book;
  const [book, setBook] = useState(stateBook || null);

  useEffect(() => {
    if (!book) {
      // try to resolve from props.books (passed from App)
      const propBooks = props?.books || [];
      const found = propBooks.find((b) => String(b.id) === String(params.bookId));
      if (found) {
        setBook(found);
      } else {
        // fetch from API
        fetchBook();
      }
    }
  }, [book, props, params.bookId]);

  // When book is available, fetch its author (or mark loading complete)
  useEffect(() => {
    if (book?.authorId) {
      fetchAuthor();
    } else if (book) {
      setLoading(false);
    }
  }, [book?.authorId, book]);

  const fetchAuthor = async () => {
    try {
      const data = await getAuthorById(book.authorId);
      setAuthor(data);
    } catch (err) {
      setError("Yazarlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBook = async () => {
    try {
      const data = await getBookById(params.bookId);
      setBook(data?.book || data);
    } catch (err) {
      setError("Kitap yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

    if (loading) return <div className="page-layout"><main className="page-main"><p>Yükleniyor…</p></main></div>;
    if (!book) return <div className="page-layout"><main className="page-main"><p>Kitap bulunamadı.</p></main></div>;
    if (error) return <div className="page-layout"><main className="page-main"><p>{error}</p></main></div>;

  return (
    <div className="page-layout">
      <main className="page-main">
        <div className="bookSummaryMainView">
          <BookSummaryViewCoverAndStats book={book} author={author} />
          <BookSummaryTitleDescAndLog book={book} author={author} />
        </div>
      </main>
      <aside className="page-sidebar" aria-hidden="true" />
    </div>
  );
};
export default BookSummaryView;
