import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import {
  createComment,
  getComments,
  toggleCommentLike,
} from "../../service/APIService";
import CoverImage from "../ui/CoverImage";
import InitialAvatar from "./InitialAvatar";
import "./CommentSection.css";

const CommentSection = ({ targetType, targetId, title = "Yorumlar" }) => {
  const token = sessionStorage.getItem("token");
  const myAvatar = sessionStorage.getItem("avatarUrl");
  const myUsername = sessionStorage.getItem("username");
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const data = await getComments(targetType, targetId);
      setComments(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError("Yorumlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [targetType, targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Yorum yazmak için giriş yapın.");
      return;
    }
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const created = await createComment({
        targetType,
        targetId,
        body: body.trim(),
      });
      setComments((prev) => [created, ...prev]);
      setBody("");
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Yorum kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (comment) => {
    if (!token) {
      alert("Beğenmek için giriş yapın.");
      return;
    }
    try {
      const updated = await toggleCommentLike(comment.id);
      setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      alert(err?.response?.data?.message || "Beğeni işlemi başarısız.");
    }
  };

  return (
    <section className="comment-section">
      <h3 className="comment-section-title">{title}</h3>

      {token ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-form-row">
            <InitialAvatar name={myUsername} src={myAvatar} className="comment-avatar" />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Düşüncelerini yaz…"
              rows={3}
              maxLength={2000}
            />
          </div>
          <button type="submit" disabled={submitting || !body.trim()}>
            {submitting ? "Gönderiliyor…" : "Yorum yap"}
          </button>
        </form>
      ) : (
        <p className="comment-login-hint">Yorum yazmak için giriş yapın.</p>
      )}

      {loading && <p className="comment-meta">Yükleniyor…</p>}
      {error && <p className="comment-error">{error}</p>}

      <div className="comment-list">
        {comments.map((c) => (
          <article className="comment-card" key={c.id}>
            <div className="comment-card-main">
              {c.username ? (
                <Link to={`/profile/${c.username}`} className="comment-avatar-link">
                  {c.avatarUrl ? (
                    <CoverImage
                      src={c.avatarUrl}
                      alt={c.profileName || c.username}
                      className="comment-avatar"
                      variant="avatar"
                    />
                  ) : (
                    <InitialAvatar name={c.profileName || c.username} className="comment-avatar" />
                  )}
                </Link>
              ) : (
                <InitialAvatar name="?" className="comment-avatar" />
              )}
              <div className="comment-card-content">
                <div className="comment-card-head">
                  {c.username ? (
                    <Link to={`/profile/${c.username}`} className="comment-author">
                      {c.profileName || c.username}
                    </Link>
                  ) : (
                    <span className="comment-author">Anonim</span>
                  )}
                  <span className="comment-date">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("tr-TR")
                      : ""}
                  </span>
                </div>
                <p className="comment-body">{c.body}</p>
                <button
                  type="button"
                  className={`comment-like ${c.likedByMe ? "active" : ""}`}
                  onClick={() => handleLike(c)}
                >
                  {c.likedByMe ? <ThumbUpAltIcon fontSize="small" /> : <ThumbUpAltOutlinedIcon fontSize="small" />}
                  <span>{c.likeCount ?? 0}</span>
                </button>
              </div>
            </div>
          </article>
        ))}
        {!loading && comments.length === 0 && (
          <p className="comment-meta">Henüz yorum yok — ilk yorumu sen yaz.</p>
        )}
      </div>
    </section>
  );
};

export default CommentSection;
