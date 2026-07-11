import { useState } from "react";
import { updateProfile } from "../../service/APIService";
import "./YearlyGoalCard.css";

const YearlyGoalCard = ({
  yearlyGoal,
  booksThisYear = 0,
  isOwnProfile,
  onUpdated,
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(yearlyGoal || 24);
  const [saving, setSaving] = useState(false);

  const year = new Date().getFullYear();
  const hasGoal = yearlyGoal != null && yearlyGoal > 0;

  if (!hasGoal && !isOwnProfile) return null;

  const pct = hasGoal ? Math.min(100, Math.round((100 * booksThisYear) / yearlyGoal)) : 0;
  const done = hasGoal && booksThisYear >= yearlyGoal;

  const save = async (e) => {
    e.preventDefault();
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > 1000) {
      alert("1–1000 arası bir hedef girin (0 = kaldır).");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ yearlyBookGoal: Math.floor(n) });
      setEditing(false);
      onUpdated?.();
    } catch (err) {
      alert(err?.message || "Hedef kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (!hasGoal && isOwnProfile && !editing) {
    return (
      <div className="yg-card yg-card--cta">
        <h3 className="yg-title">{year} okuma hedefi</h3>
        <p className="yg-empty">Bu yıl için bir kitap hedefi belirle.</p>
        <button
          type="button"
          className="profile-btn profile-btn--subtle"
          onClick={() => setEditing(true)}
        >
          Hedef belirle
        </button>
      </div>
    );
  }

  return (
    <div className={`yg-card ${done ? "is-done" : ""}`}>
      <div className="yg-head">
        <h3 className="yg-title">{year} hedefi</h3>
        {isOwnProfile && !editing && (
          <button
            type="button"
            className="yg-edit"
            onClick={() => {
              setValue(yearlyGoal || 24);
              setEditing(true);
            }}
          >
            Düzenle
          </button>
        )}
      </div>

      {editing ? (
        <form className="yg-form" onSubmit={save}>
          <label>
            Kitap sayısı
            <input
              type="number"
              min={0}
              max={1000}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <div className="yg-form-actions">
            <button type="submit" className="profile-btn profile-btn--primary" disabled={saving}>
              {saving ? "…" : "Kaydet"}
            </button>
            <button
              type="button"
              className="profile-btn profile-btn--ghost"
              onClick={() => setEditing(false)}
            >
              İptal
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="yg-count">
            <strong>{booksThisYear}</strong>
            <span> / {yearlyGoal}</span>
          </p>
          <div className="yg-bar" aria-hidden="true">
            <div className="yg-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="yg-meta">
            {done ? "Hedef tamamlandı 🎉" : `%${pct} tamamlandı`}
          </p>
        </>
      )}
    </div>
  );
};

export default YearlyGoalCard;
