import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBookApprovals,
  rejectBookApproval,
  approveBookApproval,
} from "../../service/APIService";
import GenericMessageDialog from "../common/GenericMessageDialog";
import EditIcon from "@mui/icons-material/Edit";
import "./BookApproval.css";

const BookApproval = () => {
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

  const toggleEditable = (id) => {
    setEditableId((prev) => (prev === id ? null : id));
  };

  const handleInputChange = (id, field, value) => {
    setApprovals((prev) =>
      prev.map((book) =>
        book.id === id ? { ...book, [field]: value } : book
      )
    );
  };

  const handleApprove = async (book) => {
    try {
      await approveBookApproval(book);
      setDialog({
        open: true,
        title: "Başarılı",
        message: "Kitap başarıyla onaylandı.",
      });
      handleBookApprovals();
    } catch (err) {
      console.error("Onay işlemi başarısız:", err);
      setDialog({
        open: true,
        title: "Hata",
        message: "Kitap onaylanırken bir hata oluştu.",
      });
    }
  };

  const handleReject = async (bookId) => {
    try {
      await rejectBookApproval(bookId);
      setDialog({
        open: true,
        title: "Başarılı",
        message: "Kitap başarıyla reddedildi.",
      });
      handleBookApprovals();
    } catch (err) {
      console.error("Reddetme işlemi başarısız:", err);
      setDialog({
        open: true,
        title: "Hata",
        message: "Kitap reddedilirken bir hata oluştu.",
      });
    }
  };

  return (
    <div className="book-approval-container">
      {approvals.map((book) => {
        const isEditable = editableId === book.id;

        return (
          <div className="book-approval-card" key={book.id}>
            <div
              style={{
                position: "absolute",
                top: 6,
                right: 10,
                cursor: "pointer",
                color: "#999",
              }}
              onClick={() => toggleEditable(book.id)}
              title={isEditable ? "Düzenlemeyi Kapat" : "Düzenle"}
            >
              <EditIcon fontSize="small" />
            </div>

            <img
              src={book.coverUrl}
              className="book-poster"
              alt="Kitap"
              style={{ maxHeight: 160 }}
            />

            <div className="book-info">
              <div className="book-meta">
                {isEditable ? (
                  <input
                    value={book.title}
                    onChange={(e) => handleInputChange(book.id, "title", e.target.value)}
                    className="editable-dark"
                  />
                ) : (
                  <h2 className="book-title">{book.title}</h2>
                )}

                {isEditable ? (
                  <input
                    value={book.year || ""}
                    type="number"
                    onChange={(e) => handleInputChange(book.id, "year", e.target.value)}
                    className="editable-dark short"
                  />
                ) : (
                  <span className="book-year">{book.year}</span>
                )}

                <span className="book-author">
                  {book.author?.name || "Bilinmiyor"}
                </span>
              </div>

              <p className="book-description">
                {isEditable ? (
                  <textarea
                    value={book.description}
                    onChange={(e) =>
                      handleInputChange(book.id, "description", e.target.value)
                    }
                    className="editable-dark full"
                    rows={3}
                  />
                ) : (
                  book.description
                )}
              </p>

              <input
                type="text"
                value={book.coverUrl}
                onChange={(e) =>
                  handleInputChange(book.id, "coverUrl", e.target.value)
                }
                readOnly={!isEditable}
                className={`editable-dark ${!isEditable ? "readonly" : ""}`}
                placeholder="Kapak görseli URL"
              />

              {isEditable && (
                <>
                  <label style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "12px", color: "#9ab" }}>
                    <input
                      type="checkbox"
                      checked={book.isEditorChoice || false}
                      onChange={(e) =>
                        handleInputChange(book.id, "isEditorChoice", e.target.checked)
                      }
                    />
                    Editörün Seçimi
                  </label>
                  <label style={{ display: "flex", gap: "8px", alignItems: "center", color: "#9ab" }}>
                    <input
                      type="checkbox"
                      checked={book.isWeeklyPick || false}
                      onChange={(e) =>
                        handleInputChange(book.id, "isWeeklyPick", e.target.checked)
                      }
                    />
                    Haftanın Kitabı
                  </label>
                  <label style={{ display: "flex", gap: "8px", alignItems: "center", color: "#9ab" }}>
                    <input
                      type="checkbox"
                      checked={book.isNewRelease || false}
                      onChange={(e) =>
                        handleInputChange(book.id, "isNewRelease", e.target.checked)
                      }
                    />
                    Yeni Çıkan
                  </label>
                  <textarea
                    value={book.adminNotes || ""}
                    onChange={(e) =>
                      handleInputChange(book.id, "adminNotes", e.target.value)
                    }
                    className="editable-dark"
                    placeholder="Admin notları (kullanıcılara gösterilir)"
                    rows={2}
                    style={{ marginTop: "8px" }}
                  />
                </>
              )}

              <p className="book-contributor">Katkı: {book.contributedUser}</p>

              <div className="book-actions">
                <button className="approve-btn" onClick={() => handleApprove(book)}>
                  ✓
                </button>
                <button className="reject-btn" onClick={() => handleReject(book.id)}>
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

export default BookApproval;
