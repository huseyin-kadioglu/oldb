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
import { UserDisplayName } from "./ProVerifiedBadge";
import "./CommentSection.css";

const formatCommentDate = (c) => {
  const raw = c.updatedAt || c.createdAt;
  if (!raw) return "";
  const updated =
    c.updatedAt && c.createdAt && new Date(c.updatedAt).getTime() > new Date(c.createdAt).getTime() + 1000;
  const label = new Date(raw).toLocaleDateString("tr-TR");
  return updated ? `Güncellendi · ${label}` : label;
};

const SpoilerBody = ({ body }) => {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <div className="comment-spoiler-wrap">
        <span className="comment-spoiler-badge">Spoiler</span>
        <p className="comment-body">{body}</p>
        <button
          type="button"
          className="comment-spoiler-toggle"
          onClick={() => setRevealed(false)}
        >
          Gizle
        </button>
      </div>
    );
  }

  return (
    <div className="comment-spoiler-wrap">
      <button
        type="button"
        className="comment-spoiler-curtain"
        onClick={() => setRevealed(true)}
        aria-expanded="false"
      >
        <span className="comment-spoiler-badge">Spoiler içerir</span>
        <span className="comment-spoiler-hint">Görmek için tıkla</span>
      </button>
    </div>
  );
};

const CommentSection = ({ targetType, targetId, title = "Yorumlar" }) => {
  const token = sessionStorage.getItem("token");
  const myAvatar = sessionStorage.getItem("avatarUrl");
  const myUsername = sessionStorage.getItem("username");
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const applyOwnCommentToForm = (list) => {
    if (!myUsername) {
      setEditingId(null);
      return;
    }
    const mine = list.find((c) => c.username === myUsername);
    if (mine) {
      setEditingId(mine.id);
      setBody(mine.body || "");
      setSpoiler(!!mine.spoiler);
    } else {
      setEditingId(null);
      setBody("");
      setSpoiler(false);
    }
  };

  const load = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const data = await getComments(targetType, targetId);
      const list = Array.isArray(data) ? data : [];
      setComments(list);
      applyOwnCommentToForm(list);
      setError(null);
    } catch {
      setError("Yorumlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditingId(null);
    setBody("");
    setSpoiler(false);
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
      const saved = await createComment({
        targetType,
        targetId,
        body: body.trim(),
        spoiler,
      });
      setComments((prev) => {
        const without = prev.filter((c) => c.id !== saved.id);
        return [saved, ...without];
      });
      setEditingId(saved.id);
      setBody(saved.body || "");
      setSpoiler(!!saved.spoiler);
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
              placeholder={
                editingId
                  ? "Yorumunu güncelle…"
                  : "Düşüncelerini yaz…"
              }
              rows={3}
              maxLength={2000}
            />
          </div>
          <div className="comment-form-actions">
            <label className="comment-spoiler-option">
              <input
                type="checkbox"
                checked={spoiler}
                onChange={(e) => setSpoiler(e.target.checked)}
              />
              <span>Spoiler içerir</span>
            </label>
            <button type="submit" disabled={submitting || !body.trim()}>
              {submitting
                ? "Kaydediliyor…"
                : editingId
                  ? "Yorumu güncelle"
                  : "Yorum yap"}
            </button>
          </div>
          {editingId && (
            <p className="comment-form-hint">Bu kitap/yazar için tek yorumun güncellenir.</p>
          )}
        </form>
      ) : (
        <p className="comment-login-hint">Yorum yazmak için giriş yapın.</p>
      )}

      {loading && <p className="comment-meta">Yükleniyor…</p>}
      {error && <p className="comment-error">{error}</p>}

      <div className="comment-list">
        {comments.map((c) => (
          <article className={`comment-card ${c.id === editingId ? "is-mine" : ""}`} key={c.id}>
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
                      <UserDisplayName
                        name={c.profileName || c.username}
                        role={c.role}
                        badgeSize="xs"
                      />
                    </Link>
                  ) : (
                    <span className="comment-author">Anonim</span>
                  )}
                  <span className="comment-date">{formatCommentDate(c)}</span>
                </div>
                {c.spoiler ? (
                  <SpoilerBody body={c.body} />
                ) : (
                  <p className="comment-body">{c.body}</p>
                )}
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
