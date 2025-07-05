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
      {token ? <p></p> : ( <p>Sign up for more content!</p> )}
      <FrameBlock books={books} title="Popular Books" />
    </div>
  );
};
export default Content;
