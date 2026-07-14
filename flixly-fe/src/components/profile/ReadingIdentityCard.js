import { formatStars } from "./profileUtils";
import COPY from "../../copy";
import "./ReadingIdentityCard.css";

const ReadingIdentityCard = ({ identity }) => {
  if (!identity?.ready) {
    return (
      <div className="ri-card">
        <h3 className="ri-title">Okuma profili</h3>
        <p className="ri-empty">
          {COPY.empty.readingIdentity}
        </p>
      </div>
    );
  }

  const rows = [
    identity.topGenre && { label: "En çok okunan tür", value: identity.topGenre },
    identity.secondGenre && { label: "İkinci tür", value: identity.secondGenre },
    identity.topAuthor && { label: "En çok okunan yazar", value: identity.topAuthor },
    identity.averageRating != null && {
      label: "Ortalama puan",
      value: Number(identity.averageRating).toFixed(1),
    },
    identity.mostFrequentRating != null && {
      label: "En sık verilen puan",
      value: formatStars(identity.mostFrequentRating) || String(identity.mostFrequentRating),
    },
    {
      label: "Bu yıl okunan",
      value: `${identity.bookReadThisYear ?? 0} kitap`,
    },
  ].filter(Boolean);

  return (
    <div className="ri-card">
      <h3 className="ri-title">Okuma profili</h3>
      <dl className="ri-list">
        {rows.map((row) => (
          <div className="ri-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default ReadingIdentityCard;
