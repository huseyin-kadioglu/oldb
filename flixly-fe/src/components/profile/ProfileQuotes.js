import { Link } from "react-router-dom";
import CoverImage from "../ui/CoverImage";
import SectionHeader from "../ui/SectionHeader";
import "./ProfileQuotes.css";

const ProfileQuotes = ({ quotes = [], username, isOwnProfile }) => {
  const items = Array.isArray(quotes) ? quotes : [];

  return (
    <section className="profile-section pq-section">
      <SectionHeader
        title="Alıntı defteri"
        to={`/profile/${username}/quotes`}
        linkLabel={items.length ? "Tümü" : isOwnProfile ? "Aç" : undefined}
      />

      {items.length === 0 ? (
        <div className="pq-empty">
          <p>
            {isOwnProfile
              ? "Henüz alıntı yok. Okurken yakaladığın satırları buraya bırak."
              : "Henüz alıntı paylaşılmamış."}
          </p>
          {isOwnProfile && (
            <Link to={`/profile/${username}/quotes`} className="profile-btn profile-btn--subtle">
              Alıntı ekle
            </Link>
          )}
        </div>
      ) : (
        <div className="pq-preview-list">
          {items.slice(0, 3).map((q) => (
            <blockquote key={q.id} className="pq-preview-card">
              <p className="pq-handwriting">“{q.body}”</p>
              <footer className="pq-preview-meta">
                {q.coverUrl && (
                  <Link to={q.bookId ? `/book/${q.bookId}` : `/profile/${username}/quotes`}>
                    <CoverImage src={q.coverUrl} alt={q.bookTitle || ""} className="pq-mini-cover" />
                  </Link>
                )}
                <div>
                  {q.bookTitle && (
                    <Link
                      to={q.bookId ? `/book/${q.bookId}` : `/profile/${username}/quotes`}
                      className="pq-book-link"
                    >
                      {q.bookTitle}
                    </Link>
                  )}
                  {q.pageNote && <span className="pq-page-note">{q.pageNote}</span>}
                </div>
              </footer>
            </blockquote>
          ))}
          {items.length > 3 && (
            <Link to={`/profile/${username}/quotes`} className="profile-see-more">
              Tümünü gör →
            </Link>
          )}
        </div>
      )}
    </section>
  );
};

export default ProfileQuotes;
