import Image from "../frame/Image";
import React, { useEffect, useState } from "react";

import "./Profile.css";

const ProfileSummary = ({ props, profileSummary }) => {
  return (
    <div className="profile-summary">
      <div className="user-info">
        <Image />
        <div className="user-info-text">
          <p className="username">{profileSummary.username}</p>
          <p className="location">İstanbul, Türkiye</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="value">{profileSummary.pagePerDay}</span>
          <span className="definition">PAGE PER DAY</span>
        </div>
        <div className="stat-divider"></div> {/* Uzun çubuk */}
        <div className="stat">
          <span className="value">{profileSummary.bookRead}</span>
          <span className="definition">TOTAL</span>
        </div>
        <div className="stat-divider"></div> {/* Uzun çubuk */}
        <div className="stat">
          <span className="value">{profileSummary.bookReadThisYear}</span>
          <span className="definition">THIS YEAR</span>
        </div>
      </div>
    </div>
  );
};
export default ProfileSummary;
