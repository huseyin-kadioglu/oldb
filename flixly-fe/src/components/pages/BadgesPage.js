import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BadgeTile from "../badges/BadgeTile";
import {
  getBadges,
  setFeaturedBadge,
  clearFeaturedBadge,
} from "../../service/APIService";
import "./BadgesPage.css";

const FILTERS = [
  { id: "all", label: "Tümü" },
  { id: "earned", label: "Kazanılanlar" },
  { id: "locked", label: "Kilitli" },
];

const CATEGORY_ORDER = [
  "Kilometre taşı",
  "Keşif",
  "Topluluk",
  "Koleksiyon",
];

const normalizeTag = (tag) => {
  const t = (tag || "").trim();
  if (!t) return "Diğer";
  if (/kilometre/i.test(t)) return "Kilometre taşı";
  if (/keşif|kesif/i.test(t)) return "Keşif";
  if (/topluluk/i.test(t)) return "Topluluk";
  if (/koleksiyon|alışkanlık|aliskanlik/i.test(t)) return "Koleksiyon";
  return t;
};

const BadgesPage = () => {
  const username = sessionStorage.getItem("username");
  const token = sessionStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get("highlight");

  const [badges, setBadges] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBadges(username || undefined);
      setBadges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Rozetler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!highlight || loading) return;
    const el = document.getElementById(`badge-${highlight}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlight, loading, badges]);

  const earnedCount = badges.filter((b) => b.earned).length;
  const total = badges.length;
  const percent = total ? Math.round((100 * earnedCount) / total) : 0;

  const filtered = useMemo(() => {
    if (filter === "earned") return badges.filter((b) => b.earned);
    if (filter === "locked") return badges.filter((b) => !b.earned);
    return badges;
  }, [badges, filter]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((b) => {
      const key = normalizeTag(b.tag);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(b);
    });
    const keys = [
      ...CATEGORY_ORDER.filter((k) => map.has(k)),
      ...[...map.keys()].filter((k) => !CATEGORY_ORDER.includes(k)),
    ];
    return keys.map((k) => ({ tag: k, items: map.get(k) }));
  }, [filtered]);

  const showFeedback = (msg) => {
    setFeedback(msg);
    window.clearTimeout(showFeedback._t);
    showFeedback._t = window.setTimeout(() => setFeedback(null), 2200);
  };

  const handleFeature = async (badge) => {
    if (!token || busy) return;
    setBusy(true);
    try {
      await setFeaturedBadge(badge.code);
      await load();
      showFeedback("Profil rozeti güncellendi.");
    } catch (err) {
      showFeedback(err?.response?.data?.message || err?.message || "Seçim başarısız.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnfeature = async () => {
    if (!token || busy) return;
    setBusy(true);
    try {
      await clearFeaturedBadge();
      await load();
      showFeedback("Profil rozeti kaldırıldı.");
    } catch (err) {
      showFeedback(err?.response?.data?.message || err?.message || "Kaldırma başarısız.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="badges-page">Yükleniyor…</div>;
  if (error) return <div className="badges-page">{error}</div>;

  return (
    <div className="badges-page">
      <header className="badges-toolbar">
        <div>
          <h1 className="badges-title">Rozetler</h1>
          <p className="badges-summary-line">
            {earnedCount} / {total} rozet kazanıldı · %{percent}
          </p>
        </div>
        <div className="badges-filters" role="tablist" aria-label="Filtre">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`badges-filter${filter === f.id ? " is-active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {feedback && <p className="badges-feedback" role="status">{feedback}</p>}

      {groups.length === 0 ? (
        <p className="badges-empty">Bu filtrede rozet yok.</p>
      ) : (
        groups.map((g) => (
          <section className="badges-section" key={g.tag}>
            <h2 className="badges-section-title">{g.tag}</h2>
            <div className="badges-grid">
              {g.items.map((badge) => (
                <BadgeTile
                  key={badge.code || badge.id}
                  badge={badge}
                  canSelect={!!token}
                  onFeature={handleFeature}
                  onUnfeature={handleUnfeature}
                  highlight={highlight === badge.code}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default BadgesPage;
