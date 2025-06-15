import { useEffect, useState } from "react";
import {
  getAuthorApprovals,
  approveAuthorApproval,
  rejectAuthorApproval,
} from "../../service/APIService";

import EditIcon from "@mui/icons-material/Edit";
import "./BookApproval.css";

const AuthorApproval = () => {
  const [approvals, setApprovals] = useState([]);
  const [editableId, setEditableId] = useState(null);

  useEffect(() => {
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

  const toggleEditable = (id) => {
    setEditableId((prev) => (prev === id ? null : id));
  };

  const handleInputChange = (id, field, value) => {
    setApprovals((prev) =>
      prev.map((author) =>
        author.id === id ? { ...author, [field]: value } : author
      )
    );
  };

  const handleApprove = async (author) => {
    try {
      await approveAuthorApproval(author);
      handleAuthorApprovals();
    } catch (err) {
      console.error("Onay işlemi başarısız:", err);
      alert("Yazar onaylanırken bir hata oluştu.");
    }
  };

  const handleReject = async (authorId) => {
    try {
      await rejectAuthorApproval(authorId);
      handleAuthorApprovals();
    } catch (err) {
      console.error("Reddetme işlemi başarısız:", err);
      alert("Yazar reddedilirken bir hata oluştu.");
    }
  };

  return (
    <div className="book-approval-container">
      {approvals.map((author) => {
        const isEditable = editableId === author.id;

        return (
          <div className="book-approval-card" key={author.id}>
            <div
              style={{
                position: "absolute",
                top: 6,
                right: 10,
                cursor: "pointer",
                color: "#999",
              }}
              onClick={() => toggleEditable(author.id)}
              title={isEditable ? "Düzenlemeyi Kapat" : "Düzenle"}
            >
              <EditIcon fontSize="small" />
            </div>

            <img src={author.portrait} className="book-poster" alt="Yazar" />

            <div className="book-info">
              <div className="book-meta">
                {isEditable ? (
                  <>
                    <input
                      value={author.name}
                      onChange={(e) =>
                        handleInputChange(author.id, "name", e.target.value)
                      }
                      className="editable-dark"
                      placeholder="Ad"
                    />

                    <input
                      type="number"
                      value={author.birthYear}
                      onChange={(e) =>
                        handleInputChange(
                          author.id,
                          "birthYear",
                          e.target.value
                        )
                      }
                      className="editable-dark short"
                      placeholder="Doğum"
                    />
                    <input
                      type="number"
                      value={author.deathYear || ""}
                      onChange={(e) =>
                        handleInputChange(
                          author.id,
                          "deathYear",
                          e.target.value
                        )
                      }
                      className="editable-dark short"
                      placeholder="Ölüm"
                    />
                  </>
                ) : (
                  <>
                    <h2 className="book-title">{author.name}</h2>
                    <span className="book-year">
                      {author.birthYear} - {author.deathYear || "..."}
                    </span>
                  </>
                )}
              </div>

              <p className="book-description">
                {isEditable ? (
                  <textarea
                    value={author.description}
                    onChange={(e) =>
                      handleInputChange(
                        author.id,
                        "description",
                        e.target.value
                      )
                    }
                    className="editable-dark"
                    rows={3}
                  />
                ) : (
                  author.description
                )}
              </p>

              <input
                type="text"
                value={author.portrait}
                onChange={(e) =>
                  handleInputChange(author.id, "portrait", e.target.value)
                }
                readOnly={!isEditable}
                className={`editable-dark ${!isEditable ? "readonly" : ""}`}
                placeholder="Portre URL"
              />

              <p className="book-contributor">
                Katkı: {author.contributedUser}
              </p>

              <div className="book-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(author)}
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
        );
      })}
    </div>
  );
};

export default AuthorApproval;
