import "./BookSummaryView.css";
import PhotoFrame from "./../frame/PhotoFrame.js";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";

const BookSummaryViewCoverAndStats = ({ book }) => {
  return (
    <div className="coverAndStats">
      <PhotoFrame book={book} showTitle={false} showGhostMenu={true} />
      <div className="cover-stats-minimal">
        <span className="cover-stat"><FavoriteIcon className="cover-stat-icon like" /> {book?.howManyPplLiked ?? 0}</span>
        <span className="cover-stat"><StarIcon className="cover-stat-icon star" /> {book?.howManyPplFavourited ?? 0}</span>
      </div>
    </div>
  );
};

export default BookSummaryViewCoverAndStats;
