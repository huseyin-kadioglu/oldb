import { useEffect, useState } from "react";
import { getBookApprovals } from "../../service/APIService";
import "./BookApproval.css";

const BookApproval = () => {
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    handleBookApprovals();
  }, []);

  const handleBookApprovals = async () => {
    try {
      const data = await getBookApprovals();
      setApprovals(data);
    } catch (err) {
      console.error("Onaylar alınamadı:", err);
    }
  };

  return (
    <div className="book-approval-container">
      {approvals.map((book) => (
        <div className="book-approval-card" key={book.id}>
          <img
            src="https://via.placeholder.com/100x140?text=Kitap"
            className="book-poster"
            alt="Kitap"
          />
          <div className="book-info">
            <h2 className="book-title">{book.title}</h2>
            <p className="book-sub">
              {book.year} — Katkı: {book.contributedUser}
            </p>
            <p className="book-description">{book.description}</p>
            <div className="book-actions">
              <button className="approve-btn">Onayla</button>
              <button className="reject-btn">Reddet</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookApproval;
