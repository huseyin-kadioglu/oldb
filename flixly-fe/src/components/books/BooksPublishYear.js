import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBooksByPublishYear } from "../../service/APIService";
import FrameBlock from "../common/FrameBlock";
import PhotoFrame from "../frame/PhotoFrame";
import "./BooksPublishYear.css";
import AuthorFrame from "../frame/AuthorFrame";
import StarIcon from "@mui/icons-material/Star";

const BooksPublishYear = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState(null);
  const [nobelWinnerBook, setNobelWinnerBook] = useState(null);
  const [nobelWinnerAuthor, setNobelWinnerAuthor] = useState(null);

  const { publishYear } = useParams();

  useEffect(() => {
    fetchBooksByPublicationYear();
  }, []);

  const fetchBooksByPublicationYear = async () => {
    try {
      const data = await getBooksByPublishYear(publishYear);
      setBooks(data?.books);
      setNobelWinnerBook(data?.nobelPrizeWinner);
      setNobelWinnerAuthor(data?.author);
    } catch (err) {
      setError("Kitaplar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container">
      {nobelWinnerBook && (
        <div className="nobel-section">
          <div className="nobel-left">
            <AuthorFrame coverUrl={nobelWinnerAuthor?.portrait} />
          </div>
          <div className="nobel-right">
            <div className="nobel-badge">🏅 Nobel Edebiyat Ödülü</div>
            <p className="nobel-text">
              <strong>{nobelWinnerAuthor?.name}</strong>, "
              <strong>{nobelWinnerBook?.title}</strong>" adlı kitabıyla{" "}
              {publishYear} yılında Nobel Edebiyat Ödülü'nü kazanmıştır.
            </p>
          </div>
        </div>
      )}
      <FrameBlock books={books} title={`Books written in ${publishYear}`} />
    </div>
  );
};

export default BooksPublishYear;
