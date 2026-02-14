import "./PublicContentPage.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StarRateIcon from "@mui/icons-material/StarRate";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ListIcon from "@mui/icons-material/List";
import FlagIcon from "@mui/icons-material/Flag";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Link } from "react-router-dom";

const PublicContentPage = () => {
  return (
    <div className="public-content-wrapper">
      <h2>Kitaplarınızı takip edin</h2>
      <p className="tagline">Okuduğunuz kitapları loglayın, puanlayın ve listelerinizi paylaşın.</p>

      <div className="feature-row">
        <div className="feature-card">
          <VisibilityIcon className="feature-icon" />
          <p>Keep track of your book list</p>
        </div>
        <div className="feature-card">
          <StarRateIcon className="feature-icon" />
          <p>Rate and review your books</p>
        </div>
        <div className="feature-card">
          <ListIcon className="feature-icon" />
          <p>Create custom reading lists</p>
        </div>
      </div>

      <div className="feature-row">
        <div className="feature-card">
          <FavoriteIcon className="feature-icon" />
          <p>Mark your favorites</p>
        </div>
        <div className="feature-card">
          <FlagIcon className="feature-icon" />
          <p>Set reading goals</p>
        </div>
        <div className="feature-card">
          <MenuBookIcon className="feature-icon" />
          <p>Track daily reading progress</p>
        </div>
      </div>

      <Link to="/register" className="signup-button">
        Hemen Kaydol
      </Link>
    </div>
  );
};

export default PublicContentPage;
