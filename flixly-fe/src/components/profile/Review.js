import "./Review.css";

const Review = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="review-section">
      <h3 className="review-section-title">İncelemeler</h3>
      <hr />
      {reviews.map((review) => (
        <div className="review-card" key={review.bookId}>
          <img
            src={review.coverUrl}
            alt={review.title}
            className="review-cover"
          />
          <div className="review-content">
            <div className="review-title-line">
              <h3 className="review-title">{review.title}</h3>
              <span className="review-meta">{review.year}</span>
              {review?.authorName && (
                <span className="review-meta"> · {review.authorName}</span>
              )}
            </div>
            <div className="review-rating-row">
              <span className="review-rating">{"★".repeat(Math.min(5, Math.max(0, Number(review.rating) || 0)))}</span>
              <span className="review-date">
                {review.readDate
                  ? new Date(review.readDate).toLocaleDateString("tr-TR")
                  : ""}
              </span>
            </div>
            {review.comment && (
              <p className="review-comment">{review.comment}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Review;
