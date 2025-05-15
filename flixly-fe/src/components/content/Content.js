import "./Content.css";
import FrameBlock from "../common/FrameBlock";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getBooks } from "../../service/APIService"; // Servis dosyasını import et

const Content = ({ books, token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    // burada gerek kalmayabilir parentında çağırıyor.
  }, [token]);

  console.log(books);

  return (
    <div className="container">
      {token ? (
        <h2>
          Welcome back,{" "}
          <span>
            <Link to={"/profile"}>{username}</Link>
          </span>
          . Here’s what we’ve been reading...
        </h2>
      ) : (
        <p>Sign up for more content!</p>
      )}
      <FrameBlock books={books} title="Popular Books" />
    </div>
  );
};
export default Content;
