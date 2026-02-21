import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuthorApprovals,
  approveAuthorApproval,
  rejectAuthorApproval,
} from "../../service/APIService";
import GenericMessageDialog from "../common/GenericMessageDialog";
import EditIcon from "@mui/icons-material/Edit";
import "./BookApproval.css";

const AuthorApproval = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [editableId, setEditableId] = useState(null);
  const [dialog, setDialog] = useState({ open: false, title: "", message: "" });

  // Admin role check
  useEffect(() => {
    const userRole = sessionStorage.getItem("userRole");
    if (!userRole || userRole !== "ADMIN") {
      setDialog({
        open: true,
        title: "Erişim Reddedildi",
        message: "Bu sayfa sadece admin tarafından erişilebilir.",
      });
      setTimeout(() => navigate("/"), 2000);
    }
  }, [navigate]);

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
      setDialog({
        open: true,
        title: "Başarılı",
        message: "Yazar başarıyla onaylandı.",
      });
      handleAuthorApprovals();
    } catch (err) {
      console.error("Onay işlemi başarısız:", err);
      setDialog({
        open: true,
        title: "Hata",
        message: "Yazar onaylanırken bir hata oluştu.",
      });
    }
  };

  const handleReject = async (authorId) => {
    try {
      await rejectAuthorApproval(authorId);
      setDialog({
        open: true,
        title: "Başarılı",
        message: "Yazar başarıyla reddedildi.",
      });
      handleAuthorApprovals();
    } catch (err) {
      console.error("Reddetme işlemi başarısız:", err);
      setDialog({
        open: true,
        title: "Hata",
        message: "Yazar reddedilirken bir hata oluştu.",
      });
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
      {dialog.open && (
        <GenericMessageDialog
          open={dialog.open}
          onClose={() => setDialog({ ...dialog, open: false })}
          title={dialog.title}
          message={dialog.message}
        />
      )}
    </div>
  );
};

export default AuthorApproval;
