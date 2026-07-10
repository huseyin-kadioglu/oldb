import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import { getBooksByPublishYear } from "../../service/APIService";
import PhotoFrame from "../frame/PhotoFrame";
import CoverImage from "../ui/CoverImage";
import "../ui/folios-ui.css";
import "./BooksPublishYear.css";

const BooksPublishYear = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [nobelWinnerBook, setNobelWinnerBook] = useState(null);
  const [nobelWinnerAuthor, setNobelWinnerAuthor] = useState(null);
  const navigate = useNavigate();
  const { publishYear } = useParams();

  useEffect(() => {
    setLoading(true);
    getBooksByPublishYear(publishYear)
      .then((data) => {
        setBooks(data?.books || []);
        setNobelWinnerBook(data?.nobelPrizeWinner || null);
        setNobelWinnerAuthor(data?.author || null);
      })
      .catch(() => setError("Kitaplar yüklenirken bir hata oluştu."))
      .finally(() => setLoading(false));
  }, [publishYear]);

  if (loading) return <div className="page-loading">Yükleniyor…</div>;
  if (error) return <div className="page-error">{error}</div>;

  const otherBooks = nobelWinnerBook
    ? books.filter((b) => b.id !== nobelWinnerBook.id)
    : books;

  return (
    <div className="books-year-page">
      <button type="button" className="folios-back-link" onClick={() => navigate(-1)}>
        <ArrowBackIcon fontSize="small" /> Geri
      </button>

      <header className="books-year-header">
        <p className="books-year-label">YAYIN YILI</p>
        <h1 className="books-year-title">{publishYear}</h1>
        <p className="books-year-sub">
          Bu yılda yayımlanan {books.length} kitap
          {nobelWinnerBook ? " · Nobel Edebiyat Ödülü sahibi eser vurgulandı" : ""}
        </p>
      </header>

      {nobelWinnerBook && (
        <section className="nobel-highlight">
          <div className="nobel-highlight-badge">
            <EmojiEventsOutlinedIcon fontSize="small" />
            {publishYear} Nobel Edebiyat Ödülü
          </div>
          <div className="nobel-highlight-body">
            <Link
              to={`/book/${nobelWinnerBook.id}`}
              state={{ book: nobelWinnerBook }}
              className="nobel-highlight-cover-link"
            >
              <CoverImage
                src={nobelWinnerBook.coverUrl}
                alt={nobelWinnerBook.title}
                className="nobel-highlight-cover"
              />
            </Link>
            <div className="nobel-highlight-info">
              <h2 className="nobel-highlight-book-title">
                <Link to={`/book/${nobelWinnerBook.id}`} state={{ book: nobelWinnerBook }}>
                  {nobelWinnerBook.title}
                </Link>
              </h2>
              {nobelWinnerAuthor?.name && (
                <Link
                  to={`/author/${nobelWinnerBook.authorId}`}
                  state={{ author: nobelWinnerAuthor }}
                  className="nobel-highlight-author"
                >
                  {nobelWinnerAuthor.name}
                </Link>
              )}
              <p className="nobel-highlight-text">
                {nobelWinnerAuthor?.name || "Yazar"}, &ldquo;{nobelWinnerBook.title}&rdquo; ile{" "}
                {publishYear} yılında Nobel Edebiyat Ödülü&apos;nü kazanmıştır.
              </p>
              {nobelWinnerBook.description && (
                <p className="nobel-highlight-desc">{nobelWinnerBook.description}</p>
              )}
            </div>
            {nobelWinnerAuthor?.portrait && (
              <CoverImage
                src={nobelWinnerAuthor.portrait}
                alt={nobelWinnerAuthor.name}
                className="nobel-highlight-portrait"
              />
            )}
          </div>
        </section>
      )}

      <section className="books-year-grid-section">
        <h2 className="books-year-section-title">
          {publishYear} yılında yayımlanan kitaplar
        </h2>
        {otherBooks.length > 0 || (!nobelWinnerBook && books.length > 0) ? (
          <div className="books-year-grid">
            {(nobelWinnerBook ? otherBooks : books).map((book) => (
              <PhotoFrame
                key={book.id}
                book={book}
                showTitle
                showYear
                showGhostMenu
              />
            ))}
          </div>
        ) : (
          !nobelWinnerBook && (
            <p className="books-year-empty">Bu yıla ait kitap bulunamadı.</p>
          )
        )}
        {nobelWinnerBook && otherBooks.length === 0 && (
          <p className="books-year-empty">Bu yılda listelenen başka kitap yok.</p>
        )}
      </section>
    </div>
  );
};

export default BooksPublishYear;
