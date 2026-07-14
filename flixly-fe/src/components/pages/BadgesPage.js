import { useEffect, useState } from "react";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SectionHeader from "../ui/SectionHeader";
import { getBadges } from "../../service/APIService";
import COPY from "../../copy";
import "../ui/folios-ui.css";
import "./BadgesPage.css";

const RARITY_META = {
  common: { label: "Yaygın", color: "#6b7280" },
  uncommon: { label: "Seyrek", color: "#00e054" },
  rare: { label: "Nadir", color: "#64c8ff" },
  epic: { label: "Epik", color: "#a855f7" },
  legendary: { label: "Efsanevi", color: "#d4af37" },
};

const rarityColor = (key) => RARITY_META[key]?.color || "#6b7280";

const BadgesPage = () => {
  const username = sessionStorage.getItem("username");
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getBadges(username || undefined);
        setBadges(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Rozetler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  const earned = badges.filter((b) => b.earned);
  const legendary = badges.filter((b) => b.legendaryTrack && !b.earned);
  const inProgressLegendary = badges.filter((b) => b.legendaryTrack);

  if (loading) return <div className="badges-page">Yükleniyor…</div>;
  if (error) return <div className="badges-page">{error}</div>;

  return (
    <div className="badges-page">
      <header className="badges-hero">
        <p className="badges-eyebrow">BAŞARIM VİTRİNİ</p>
        <h1 className="badges-title">Rozetlerin</h1>
        <div className="badges-hero-row">
          <div className="badges-summary folios-card">
            <div>
              <span className="badges-summary-val">{earned.length}</span>
              <span className="badges-summary-lbl">Kazanıldı</span>
            </div>
            <div className="badges-summary-divider" />
            <div>
              <span className="badges-summary-val muted">{badges.length}</span>
              <span className="badges-summary-lbl">Toplam</span>
            </div>
          </div>
          <div className="badges-rarity-legend">
            {Object.entries(RARITY_META).map(([key, r]) => (
              <span key={key} className="rarity-pill">
                <span className="rarity-dot" style={{ background: r.color }} />
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {inProgressLegendary.length > 0 && (
        <section className="badges-section">
          <SectionHeader title="Efsanevi Başarımlar" icon={<EmojiEventsOutlinedIcon fontSize="small" />} />
          <div className="legendary-grid">
            {(legendary.length ? legendary : inProgressLegendary).map((item) => (
              <div className="legendary-card folios-card" key={item.id || item.code}>
                {!item.earned && <LockOutlinedIcon className="legendary-lock" />}
                <span className="legendary-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="legendary-progress-meta">
                  <span>
                    {item.current} / {item.goal}
                  </span>
                  <span>{item.percent}%</span>
                </div>
                <div className="legendary-bar">
                  <div className="legendary-bar-fill" style={{ width: `${item.percent}%` }} />
                </div>
                <span className="legendary-tag">Efsanevi</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="badges-section">
        <SectionHeader
          title={`Kazanılan Rozetler (${earned.length})`}
          icon={<EmojiEventsOutlinedIcon fontSize="small" />}
        />
        {earned.length === 0 ? (
          <p className="badges-empty">{COPY.empty.badgesStart}</p>
        ) : (
          <div className="earned-grid">
            {earned.map((badge) => (
              <div className="earned-card folios-card" key={badge.id || badge.code}>
                <span className="earned-icon">{badge.icon}</span>
                <h3>{badge.title}</h3>
                <p>{badge.description}</p>
                <div className="earned-footer">
                  <span
                    className="earned-rarity"
                    style={{ color: rarityColor(badge.rarity), borderColor: rarityColor(badge.rarity) }}
                  >
                    {RARITY_META[badge.rarity]?.label || badge.rarity}
                  </span>
                  {badge.tag && <span className="earned-tag">{badge.tag}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BadgesPage;
