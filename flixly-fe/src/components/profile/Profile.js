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
    <div>
      <div className="profile">
        <div className="profile-summary">
          <div className="user-info">
            <Image />
            <p className="username">huseyinkadioglu</p>
            <p className="location">İstanbul, Türkiye</p>
          </div>

          <div className="stats">
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
      </div>
    </div>
  );
};
export default Profile;
