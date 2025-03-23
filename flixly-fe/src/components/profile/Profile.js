import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import NavigationBar from "../navbar/NavigationBar";
import "./Profile.css";
import Image from "../frame/Image";

const Profile = () => {
  return (
    <div className="container">
      <div className="profile">
        <div className="profile-summary">
          <div className="user-info">
            <Image />

            <div className="user-info">
              <p className="username">huseyinkadioglu</p>
              <p className="location">İstanbul, Türkiye</p>
              <a href="#" className="profile-link">
                Profili Gör
              </a>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <p className="stat-number">100</p>
              <p className="stat-label">Toplam</p>
            </div>
            <div className="stat-divider"></div> {/* Uzun çubuk */}
            <div className="stat">
              <p className="stat-number">10</p>
              <p className="stat-label">Bu Yıl</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
