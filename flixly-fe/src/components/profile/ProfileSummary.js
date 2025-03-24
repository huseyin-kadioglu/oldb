import Image from "../frame/Image";
import "./Profile.css";

const ProfileSummary = (props) => {
  return (
    <div className="profile-summary">
      <div className="user-info">
        <Image />
        <div className="user-info-text">
          <p className="username">huseyinkadioglu</p>
          <p className="location">İstanbul, Türkiye</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="value">2.2</span>
          <span className="definition">PAGE PER DAY</span>
        </div>
        <div className="stat-divider"></div> {/* Uzun çubuk */}

        <div className="stat">
          <span className="value">100</span>
          <span className="definition">TOTAL</span>
        </div>
        <div className="stat-divider"></div> {/* Uzun çubuk */}
        <div className="stat">
          <span className="value">10</span>
          <span className="definition">THIS YEAR</span>
        </div>
      </div>
    </div>
  );
};
export default ProfileSummary;
