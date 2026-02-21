import React, { useState } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import InitialAvatar from "../common/InitialAvatar";

const ProfileSummary = ({ profileSummary, isOwnProfile }) => {
  console.log(isOwnProfile);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleEditProfile = () => {
    navigate("/settings");
  };

  const handleCopyProfileLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileSummary?.username}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);

      // kısa süre sonra kapansın
      setTimeout(() => {
        setCopied(false);
        setMenuOpen(false);
      }, 1200);
    } catch (err) {
      console.error("Link kopyalanamadı", err);
    }
  };

  return (
    <div className="profile-summary">
      <div className="user-info">
        <InitialAvatar name={profileSummary?.profileName} />

        <div className="user-info-text">
          <div className="username-row">
            <p className="username">{profileSummary?.profileName}</p>

            <div className="actions">
              <div className="menu-wrapper">
                <button className="menu-button" onClick={toggleMenu}>
                  ⋯
                </button>

                {menuOpen && (
                  <div className="menu-popup">
                    {!copied ? (
                      <button
                        className="menu-item"
                        onClick={handleCopyProfileLink}
                      >
                        Profil linkini kopyala
                      </button>
                    ) : (
                      <span className="copied-text">Kopyalandı ✓</span>
                    )}
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <button className="edit-button" onClick={handleEditProfile}>
                  Profili düzenle
                </button>
              )}
            </div>
          </div>

          <p className="description">
            {profileSummary?.bio || "Henüz bir biyografi eklenmemiş."}
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
        <div className="stat-divider"></div>
        <div className="stat">
          <span className="value">{profileSummary?.contributionPoint ?? 0}</span>
          <span className="definition">CONTRIBUTION</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary;
