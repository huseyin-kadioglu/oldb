import { useEffect, useState } from "react";
import { getPendingAvatars, approveAvatar, rejectAvatar } from "../../service/APIService";
import "./ProfileApproval.css";

const ProfileApproval = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const data = await getPendingAvatars();
      setPendingList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approveAvatar(userId);
      setMessage("Onaylandı.");
      setPendingList((prev) => prev.filter((u) => u.userId !== userId));
    } catch {
      setMessage("Hata oluştu.");
    }
    setTimeout(() => setMessage(null), 2500);
  };

  const handleReject = async (userId) => {
    try {
      await rejectAvatar(userId);
      setMessage("Reddedildi.");
      setPendingList((prev) => prev.filter((u) => u.userId !== userId));
    } catch {
      setMessage("Hata oluştu.");
    }
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="page-layout">
      <main className="page-main">
        <div className="approval-page">
          <h1 className="approval-title">Profil Fotoğrafı Onayları</h1>
          {message && <div className="approval-banner">{message}</div>}

          {loading && <p className="approval-status">Yükleniyor...</p>}

          {!loading && pendingList.length === 0 && (
            <div className="approval-empty">
              Bekleyen fotoğraf isteği bulunmuyor.
            </div>
          )}

          {!loading && pendingList.length > 0 && (
            <div className="approval-grid">
              {pendingList.map((item) => (
                <div key={item.userId} className="approval-card">
                  <div className="approval-avatars">
                    <div className="approval-avatar-block">
                      <span className="approval-label">Mevcut</span>
                      {item.currentAvatarUrl ? (
                        <img src={item.currentAvatarUrl} alt="Mevcut" className="approval-img" />
                      ) : (
                        <div className="approval-img-placeholder">—</div>
                      )}
                    </div>
                    <div className="approval-arrow">→</div>
                    <div className="approval-avatar-block">
                      <span className="approval-label">Yeni</span>
                      <img src={item.pendingAvatarUrl} alt="Yeni" className="approval-img" />
                    </div>
                  </div>

                  <p className="approval-username">@{item.username}</p>

                  <div className="approval-actions">
                    <button
                      className="approval-btn approval-btn--approve"
                      onClick={() => handleApprove(item.userId)}
                    >
                      Onayla
                    </button>
                    <button
                      className="approval-btn approval-btn--reject"
                      onClick={() => handleReject(item.userId)}
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <aside className="page-sidebar" aria-hidden="true" />
    </div>
  );
};

export default ProfileApproval;
