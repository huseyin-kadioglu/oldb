import { useEffect, useState } from "react";
import "./BookSummaryView.css";
import BookSummaryViewCoverAndStats from "./BookSummaryViewCoverAndStats.js";
import BookSummaryTitleDescAndLog from "./BookSummaryTitleDescAndLog.js";
import { useLocation } from "react-router-dom";
import { getAuthorById } from "../../service/APIService.js";

const BookSummaryView = (props) => {
  const [author, setAuthor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();

  const book = location.state?.book;

  useEffect(() => {
    if (book?.authorId) fetchAuthor();
    else setLoading(false);
  }, [book?.authorId]);

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

  if (!book) return <div className="page-layout"><main className="page-main"><p>Kitap bulunamadı.</p></main></div>;
  if (loading) return <div className="page-layout"><main className="page-main"><p>Yükleniyor…</p></main></div>;
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
