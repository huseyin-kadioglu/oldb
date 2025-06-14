import { useEffect, useState } from "react";
import { getBookApprovals } from "../../service/APIService";
import { rejectBookApproval } from "../../service/APIService";

import "./BookApproval.css";

const BookApproval = () => {
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    console.log("rendering BookApproval");
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

  const handleApprove = () => {
    console.log("approving the book.");
    // onayladıktan sonra kitap servisine gidip kitabı eklemeli.
    handleBookApprovals();
  };

  const handleReject = async (bookId) => {
    try {
      console.log("handleReject bookId", bookId);
      await rejectBookApproval(bookId); // `book` nesnesi varsa
      console.log("Kitap başarıyla reddedildi.");
      // Opsiyonel: Listeyi yenile, modal kapat vs.
      handleBookApprovals();
    } catch (err) {
      console.error("Reddetme işlemi başarısız:", err);
      alert("Kitap reddedilirken bir hata oluştu.");
    }
  };

  return (
    <div className="book-approval-container">
      {approvals.map((book) => (
        <div className="book-approval-card" key={book.id}>
          <img src={book.coverUrl} className="book-poster" alt="Kitap" />
          <div className="book-info">
            <div className="book-meta">
              <h2 className="book-title">{book.title}</h2>
              <span className="book-year">{book.year}</span>
              <span className="book-author">
                {book.author?.name || "Bilinmiyor"}
              </span>
            </div>
            <p className="book-description">{book.description}</p>
            <p className="book-contributor">Katkı: {book.contributedUser}</p>
            <div className="book-actions">
              <button className="approve-btn" onClick={handleApprove}>
                ✓
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(book?.id)}
              >
                X
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookApproval;
