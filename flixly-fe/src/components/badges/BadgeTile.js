import "./BadgeTile.css";

export const RARITY_META = {
  common: { label: "Yaygın", color: "#8b929a" },
  uncommon: { label: "Seyrek", color: "#3d9b6e" },
  rare: { label: "Nadir", color: "#4a90d9" },
  epic: { label: "Epik", color: "#8b5cf6" },
  legendary: { label: "Efsanevi", color: "#d4af37" },
};

export const rarityColor = (key) => RARITY_META[String(key || "").toLowerCase()]?.color || "#8b929a";

export const rarityLabel = (key) => RARITY_META[String(key || "").toLowerCase()]?.label || key;

const formatEarned = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
};

/**
 * Ortak rozet tile — /badges ve profil sekmesi.
 * @param {object} badge
 * @param {boolean} canSelect — kendi profilinde / kendi badges sayfasında
 * @param {function} onFeature — (badge) => void
 * @param {function} onUnfeature — () => void
 * @param {boolean} highlight
 */
const BadgeTile = ({
  badge,
  canSelect = false,
  onFeature,
  onUnfeature,
  highlight = false,
}) => {
  if (!badge) return null;
  const earned = !!badge.earned;
  const featured = !!badge.featured;
  const rarity = String(badge.rarity || "common").toLowerCase();
  const earnedLabel = formatEarned(badge.earnedAt);

  return (
    <article
      id={`badge-${badge.code}`}
      className={[
        "badge-tile",
        earned ? "is-earned" : "is-locked",
        featured ? "is-featured" : "",
        highlight ? "is-highlight" : "",
        `rarity-${rarity}`,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--rarity": rarityColor(rarity) }}
      title={badge.description}
    >
      <div className="badge-tile-icon" aria-hidden="true">
        {badge.icon || "🏅"}
      </div>
      <div className="badge-tile-body">
        <div className="badge-tile-top">
          <h3 className="badge-tile-title">{badge.title}</h3>
          {featured && <span className="badge-tile-pin">Profilde</span>}
        </div>
        <span className="badge-tile-rarity">{rarityLabel(rarity)}</span>
        <p className="badge-tile-desc">{badge.description}</p>

        {earned ? (
          earnedLabel && <span className="badge-tile-meta">{earnedLabel}</span>
        ) : (
          <div className="badge-tile-progress">
            <div className="badge-tile-progress-meta">
              <span>
                {badge.current ?? 0} / {badge.goal ?? 0}
              </span>
              <span>{badge.percent ?? 0}%</span>
            </div>
            <div className="badge-tile-bar">
              <div
                className="badge-tile-bar-fill"
                style={{ width: `${Math.min(100, badge.percent ?? 0)}%` }}
              />
            </div>
          </div>
        )}

        {canSelect && earned && (
          <div className="badge-tile-actions">
            {featured ? (
              <button type="button" className="badge-tile-btn is-active" onClick={onUnfeature}>
                Profilden kaldır
              </button>
            ) : (
              <button type="button" className="badge-tile-btn" onClick={() => onFeature?.(badge)}>
                Profilde sergile
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default BadgeTile;
