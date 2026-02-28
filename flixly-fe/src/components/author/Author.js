import { useState, useEffect } from "react";
import AuthorFrame from "../frame/AuthorFrame";
import "./Author.css";
import { useLocation, useParams } from "react-router-dom";
import PhotoFrame from "../frame/PhotoFrame";
import AuthorProgressBar from "./AuthorProgressBar";
import { getAuthorById, rateAuthor } from "../../service/APIService";

const Author = () => {
  const location = useLocation();
  const params = useParams();
  const [author, setAuthor] = useState(location.state?.author || null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!author) fetchAuthor();
    else {
      setLoading(false);
      if (author.userRating) setUserRating(author.userRating);
    }
  }, [author]);

  const fetchAuthor = async () => {
    try {
      const data = await getAuthorById(params.authorId);
      const authorData = data?.author || data;
      setAuthor(authorData);
      if (authorData?.userRating) setUserRating(authorData.userRating);
    } catch (err) {
      console.error(err);
      setError("Yazar yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    const newRating = userRating === rating ? 0 : rating;
    setUserRating(newRating);
    try {
      await rateAuthor(author.id, newRating);
    } catch (err) {
      console.error("Rating gönderilemedi:", err);
      setUserRating(userRating);
    }
  };

  if (loading) return <div className="author-view">Yükleniyor…</div>;
  if (error) return <div className="author-view">{error}</div>;
  if (!author) return <div className="author-view">Yazar bulunamadı.</div>;

  const totalBooks = author.bookWrittenBy?.length ?? 0;
  const readBooks = 5; // TODO: auth sonrası gerçek veri
  const displayTotal = totalBooks > 0 ? totalBooks : 10;

  return (
    <div className="page-layout">
      <main className="page-main">
    <div className="author-view">
      <div className="author-left">
        <p className="author-heading-label">Yazan</p>
        <h1 className="author-name">{author.name}</h1>
        <hr />

        <div className="author-gallery gallery">
              {author.bookWrittenBy != null &&
            author.bookWrittenBy.map((book, index) => (
              <PhotoFrame key={book?.id ?? index} book={book} showTitle showGhostMenu={true} />
            ))}
        </div>
      </div>
      <div className="author-right">
        <AuthorFrame coverUrl={author.portrait} className="author-photo" />
        <div className="author-dates">
          <div className="author-date-item">{author.birthDate || "1904"}</div>
          <div>–</div>
          <div className="author-date-item">
            {author.deathDate || "Halen yaşıyor"}
          </div>
        </div>

        <div className="author-info-container">
          <div
            className={`author-description ${showFullDesc ? "full" : ""}`}
            onClick={() => setShowFullDesc(!showFullDesc)}
            title={showFullDesc ? "Gösterimi kapat" : "Devamını gör"}
            style={{ cursor: "pointer" }}
          >
            <p>{author.description || "—"}</p>
            {!showFullDesc && author.description && (
              <span className="show-more">... Devamını gör</span>
            )}
          </div>

          <AuthorProgressBar totalBooks={displayTotal} readBooks={readBooks} />

          <div className="author-rating-block">
            {author.averageRating > 0 && (
              <div className="author-avg-rating">
                <span className="author-avg-star">★</span>
                <span className="author-avg-val">{Number(author.averageRating).toFixed(1)}</span>
                {author.ratingCount > 0 && (
                  <span className="author-avg-count">({author.ratingCount} oy)</span>
                )}
              </div>
            )}
            <p className="author-rating-label">Puanla</p>
            <div className="author-rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`author-star-btn ${(hoverRating || userRating) >= star ? "active" : ""}`}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${star} yıldız`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
      </main>
      <aside className="page-sidebar" aria-hidden="true" />
    </div>
  );
};
export default Author;
