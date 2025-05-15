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
    console.log("BookSummaryView render");
    fetchAuthor();
  }, []);

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

  return (
    <div className="bookSummaryMainView">
      <BookSummaryViewCoverAndStats book={book} author={author} />
      <BookSummaryTitleDescAndLog book={book} author={author} />
    </div>
  );
};
export default BookSummaryView;
