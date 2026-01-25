import "../content/Content.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getBooks } from "../../service/APIService";
import FrameBlock from "../common/FrameBlock";
import { useParams } from "react-router-dom";

const Books = ({ books }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { bookId } = useParams();

  return (
    <div className="container">
      <FrameBlock books={books} title="All Books" />
    </div>
  );
};
export default Books;
