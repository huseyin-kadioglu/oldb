import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import {
  createComment,
  getComments,
  toggleCommentLike,
} from "../../service/APIService";
import { showToast } from "../../utils/uiEvents";
import CoverImage from "../ui/CoverImage";
import InitialAvatar from "./InitialAvatar";
import { UserDisplayName } from "./ProVerifiedBadge";
import "./CommentSection.css";

const formatCommentDate = (c) => {
  const raw = c.updatedAt || c.createdAt;
  if (!raw) return "";
  const updated =
    c.updatedAt &&
    c.createdAt &&
    new Date(c.updatedAt).getTime() > new Date(c.createdAt).getTime() + 1000;
  const label = new Date(raw).toLocaleDateString("tr-TR");
  return updated ? `Güncellendi · ${label}` : label;
};

const reviewStars = (rating) => {
  const n = Number(rating) || 0;
  if (n <= 0) return null;
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
};

const SpoilerBody = ({ body }) => {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <div className="comment-spoiler-wrap">
        <span className="comment-spoiler-badge">Spoiler</span>
        <ClampedBody text={body} />
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
        <span className="comment-spoiler-badge">Bu yorum spoiler içeriyor</span>
        <span className="comment-spoiler-hint">Göster</span>
      </button>
    </div>
  );
};

const ClampedBody = ({ text }) => {
  const [open, setOpen] = useState(false);
  const long = (text || "").length > 220 || (text || "").split("\n").length > 4;

  return (
    <div className="comment-body-wrap">
      <p className={`comment-body ${open || !long ? "is-open" : ""}`}>{text}</p>
      {long && (
        <button
          type="button"
          className="comment-clamp-more"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Daha az göster" : "Devamını oku"}
        </button>
      )}
    </div>
  );
};

const CommentSection = ({
  targetType,
  targetId,
  title = "Yorumlar",
  placeholder = "Bu kitap hakkında ne düşünüyorsun?",
}) => {
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
  const [inlineError, setInlineError] = useState(null);
  const [sort, setSort] = useState("newest");

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
    setSort("newest");
    load();
  }, [targetType, targetId]);

  const sortedComments = useMemo(() => {
    const list = [...comments];
    if (sort === "helpful") {
      list.sort((a, b) => {
        const likeDiff = (b.likeCount || 0) - (a.likeCount || 0);
        if (likeDiff !== 0) return likeDiff;
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      });
    } else {
      list.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      );
    }
    return list;
  }, [comments, sort]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast("Yorum yazmak için giriş yap.");
      return;
    }
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setInlineError(null);
    const wasEdit = !!editingId;
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
      showToast(wasEdit ? "Yorumun güncellendi" : "Yorumun kaydedildi");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Yorum kaydedilemedi.";
      setInlineError(msg);
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (comment) => {
    if (!token) {
      showToast("Beğenmek için giriş yap.");
      return;
    }
    try {
      const updated = await toggleCommentLike(comment.id);
      setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      showToast(err?.response?.data?.message || "Beğeni işlemi başarısız.");
    }
  };

  return (
    <section className="comment-section">
      <div className="comment-section-head">
        <h3 className="folios-section-title comment-section-title">{title}</h3>
        {comments.length > 1 && (
          <label className="comment-sort">
            <span className="comment-sort-label">Sırala</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Yorum sıralaması"
            >
              <option value="newest">En yeniler</option>
              <option value="helpful">En faydalılar</option>
            </select>
          </label>
        )}
      </div>

      {token ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-form-row">
            <InitialAvatar name={myUsername} src={myAvatar} className="comment-avatar" />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={editingId ? "Yorumunu güncelle…" : placeholder}
              rows={2}
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
          {inlineError && <p className="comment-error">{inlineError}</p>}
        </form>
      ) : (
        <p className="comment-login-hint">Yorum yazmak için giriş yapın.</p>
      )}

      {loading && <p className="comment-meta">Yükleniyor…</p>}
      {error && <p className="comment-error">{error}</p>}

      <div className="comment-list">
        {sortedComments.map((c) => {
          const stars = reviewStars(c.rating);
          return (
            <article
              className={`comment-card ${c.id === editingId ? "is-mine" : ""}`}
              key={c.id}
            >
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
                      <InitialAvatar
                        name={c.profileName || c.username}
                        className="comment-avatar"
                      />
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
                    {stars && (
                      <span className="comment-user-stars" aria-label={`${c.rating} yıldız`}>
                        {stars}
                      </span>
                    )}
                    <span className="comment-date">{formatCommentDate(c)}</span>
                  </div>
                  {c.spoiler ? <SpoilerBody body={c.body} /> : <ClampedBody text={c.body} />}
                  <button
                    type="button"
                    className={`comment-like ${c.likedByMe ? "active" : ""}`}
                    onClick={() => handleLike(c)}
                    aria-pressed={!!c.likedByMe}
                  >
                    {c.likedByMe ? (
                      <ThumbUpAltIcon fontSize="small" />
                    ) : (
                      <ThumbUpAltOutlinedIcon fontSize="small" />
                    )}
                    <span>{c.likeCount ?? 0}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {!loading && comments.length === 0 && (
          <p className="comment-meta">Henüz yorum yok — ilk yorumu sen yaz.</p>
        )}
      </div>
    </section>
  );
};

export default CommentSection;
