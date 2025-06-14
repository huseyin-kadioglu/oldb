import { useEffect, useState } from "react";
import {
  getAuthorApprovals,
  approveAuthorApproval,
  rejectAuthorApproval,
} from "../../service/APIService";

import "./BookApproval.css"; // Aynı stil kullanılabilir

const AuthorApproval = () => {
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    console.log("Rendering AuthorApproval");
    handleAuthorApprovals();
  }, []);

  const handleAuthorApprovals = async () => {
    try {
      const data = await getAuthorApprovals();
      setApprovals(data);
    } catch (err) {
      console.error("Yazar onayları alınamadı:", err);
    }
  };

  const handleApprove = async (authorId) => {
    try {
      console.log("Approving author with ID:", authorId);
      await approveAuthorApproval(authorId);
      handleAuthorApprovals();
    } catch (err) {
      console.error("Onay işlemi başarısız:", err);
      alert("Yazar onaylanırken bir hata oluştu.");
    }
  };

  const handleReject = async (authorId) => {
    try {
      console.log("Rejecting author with ID:", authorId);
      await rejectAuthorApproval(authorId);
      handleAuthorApprovals();
    } catch (err) {
      console.error("Reddetme işlemi başarısız:", err);
      alert("Yazar reddedilirken bir hata oluştu.");
    }
  };

  return (
    <div className="book-approval-container">
      {approvals.map((author) => (
        <div className="book-approval-card" key={author.id}>
          <img src={author.portrait} className="book-poster" alt="Yazar" />
          <div className="book-info">
            <div className="book-meta">
              <h2 className="book-title">
                {author.name} {author.surname}
              </h2>
              <span className="book-year">
                {author.birthYear} - {author.deathYear || "..."}
              </span>
            </div>
            <p className="book-description">{author.description}</p>
            <p className="book-contributor">Katkı: {author.contributedUser}</p>
            <div className="book-actions">
              <button
                className="approve-btn"
                onClick={() => handleApprove(author.id)}
              >
                ✓
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(author.id)}
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

export default AuthorApproval;
