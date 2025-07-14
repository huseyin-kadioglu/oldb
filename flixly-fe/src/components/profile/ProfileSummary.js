import React, { useState } from "react";
import Image from "../frame/Image";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const ProfileSummary = ({ profileSummary }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleEditProfile = () => {
    navigate("/editProfile");
  };

  return (
    <div className="profile-summary">
      <div className="user-info">
        <Image />

        <div className="user-info-text">
          <div className="username-row">
            <p className="username">{profileSummary?.profileName}</p>

            <div className="actions">
              <button className="menu-button" onClick={toggleMenu}>
                ⋯
              </button>
              <button className="edit-button" onClick={handleEditProfile}>
                Edit Profile
              </button>

              {menuOpen && (
                <div className="menu-popup">
                  <p>Test içeriği buraya!</p>
                </div>
              )}
            </div>
          </div>

          <p className="description">
            It’s just a place where I write notes to myself.
          </p>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="value">{profileSummary?.pagePerDay}</span>
          <span className="definition">PAGE PER DAY</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <span className="value">{profileSummary?.bookRead}</span>
          <span className="definition">TOTAL</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <span className="value">{profileSummary?.bookReadThisYear}</span>
          <span className="definition">THIS YEAR</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <span className="value">{profileSummary?.readList?.length}</span>
          <span className="definition">READLIST</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary;
