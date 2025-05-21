import "./Content.css";
import FrameBlock from "../common/FrameBlock";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Content = ({ books, token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = sessionStorage.getItem("username");

  return (
    <div className="container">
      {token ? (
        <div className="background-stars">
          {/* Yıldızlar */}
          <div
            style={{ top: "-10px", left: "10%", animationDelay: "0s" }}
            className="star"
          ></div>
          <div
            style={{ top: "-10px", left: "40%", animationDelay: "1.5s" }}
            className="star"
          ></div>
          <div
            style={{ top: "-10px", left: "70%", animationDelay: "3s" }}
            className="star"
          ></div>
          <div
            style={{ top: "-10px", left: "85%", animationDelay: "4.5s" }}
            className="star"
          ></div>

          {/* Dalgalanan şerit */}
          <div className="wave-banner">
            <h2>Under Construction!</h2>
          </div>
        </div>
      ) : (
        <p>Sign up for more content!</p>
      )}
      <FrameBlock books={books} title="Popular Books" />
    </div>
  );
};
export default Content;
