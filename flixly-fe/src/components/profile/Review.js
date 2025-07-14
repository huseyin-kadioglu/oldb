import "./Review.css";

const Review = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  console.log(reviews);
  return (
    <div className="review-section">
      <h2>Reviews</h2>
      <hr></hr>
      {reviews.map((review) => (
        <div className="review-card" key={review.bookId}>
          <img
            src={review.coverUrl}
            alt={review.title}
            className="review-cover"
          />

          <div className="review-content">
            <div className="review-header">
              <div className="review-title-line">
                <h3 className="review-title">{review.title}</h3>
                <span className="release-date">{review.year}</span>
                <span className="author-name">{review?.authorName}</span>
              </div>
            </div>

            <div className="review-rating-row">
              <span className="review-rating">{"⭐".repeat(4)}</span>
              <span className="review-date">
                Read on {new Date(review.readDate).toLocaleDateString()}
              </span>
            </div>

            <p className="review-comment">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Review;
