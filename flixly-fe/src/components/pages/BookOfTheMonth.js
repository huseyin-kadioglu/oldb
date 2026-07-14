import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CoverImage from "../ui/CoverImage";
import CommentSection from "../common/CommentSection";
import { getBotm, voteBotm } from "../../service/APIService";
import "./BookOfTheMonth.css";

const BookOfTheMonth = () => {
  const token = sessionStorage.getItem("token");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingId, setVotingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getBotm()
      .then((data) => {
        setStatus(data);
        setError(null);
      })
      .catch(() => setError("Ayın kitabı yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleVote = async (bookId) => {
    if (!token) {
      alert("Oy vermek için giriş yapmalısın.");
      return;
    }
    setVotingId(bookId);
    try {
      const next = await voteBotm(bookId);
      setStatus(next);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Oy kaydedilemedi.");
    } finally {
      setVotingId(null);
    }
  };

  if (loading) {
    return (
      <div className="botm-page">
        <p className="botm-muted">Yükleniyor…</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="botm-page">
        <p className="botm-muted">{error || "Veri yok."}</p>
      </div>
    );
  }

  const isPoll = status.phase === "POLL";
  const hasWinner = !!status.winnerBookId;

  return (
    <div className="botm-page">
      <header className="botm-hero">
        <p className="botm-kicker">Stoa okuma kulübü</p>
        <h1 className="botm-title">Ayın kitabı</h1>
        <p className="botm-sub">{status.label}</p>
      </header>

      {hasWinner && !isPoll && (
        <section className="botm-room">
          <div className="botm-winner">
            <Link to={`/book/${status.winnerBookId}`} className="botm-winner-cover">
              <CoverImage
                src={status.winnerCoverUrl}
                alt={status.winnerTitle || ""}
                className="botm-winner-img"
              />
            </Link>
            <div className="botm-winner-copy">
              <p className="botm-winner-label">Bu ay okuyoruz</p>
              <h2 className="botm-winner-title">
                <Link to={`/book/${status.winnerBookId}`}>{status.winnerTitle}</Link>
              </h2>
              {status.winnerAuthorName && (
                <p className="botm-winner-author">{status.winnerAuthorName}</p>
              )}
              <p className="botm-muted">
                Spoiler’lara dikkat ederek konuş — aşağıda ortak salon.
              </p>
            </div>
          </div>
          <CommentSection
            targetType="BOOK"
            targetId={status.winnerBookId}
            title="Okuma odası"
          />
        </section>
      )}

      {isPoll && (
        <section className="botm-poll">
          <h2 className="botm-section-title">Adaylar</h2>
          <p className="botm-muted">
            Son hafta oylaması: bir kitap seç. Kazanan gelecek ay okunur.
          </p>
          <div className="botm-candidates">
            {(status.candidates || []).map((c) => {
              const selected = status.myVotedBookId === c.bookId || c.votedByMe;
              return (
                <article
                  key={c.bookId}
                  className={`botm-candidate ${selected ? "is-selected" : ""}`}
                >
                  <Link to={`/book/${c.bookId}`} className="botm-candidate-cover">
                    <CoverImage src={c.coverUrl} alt={c.title || ""} />
                  </Link>
                  <div className="botm-candidate-body">
                    <h3>
                      <Link to={`/book/${c.bookId}`}>{c.title}</Link>
                    </h3>
                    {c.authorName && <p className="botm-muted">{c.authorName}</p>}
                    <p className="botm-votes">{c.voteCount ?? 0} oy</p>
                    <button
                      type="button"
                      className="botm-vote-btn"
                      disabled={votingId === c.bookId}
                      onClick={() => handleVote(c.bookId)}
                    >
                      {selected ? "Oyun bu" : "Oy ver"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {!token && (
            <p className="botm-muted" style={{ marginTop: 16 }}>
              Oy vermek için <Link to="/signin">giriş yap</Link>.
            </p>
          )}
        </section>
      )}

      {!isPoll && !hasWinner && (
        <section className="botm-poll">
          <p className="botm-muted">Henüz ayın kitabı belirlenmedi.</p>
          {(status.candidates || []).length > 0 && (
            <>
              <h2 className="botm-section-title">Adaylar</h2>
              <div className="botm-candidates">
                {status.candidates.map((c) => (
                  <article key={c.bookId} className="botm-candidate">
                    <Link to={`/book/${c.bookId}`} className="botm-candidate-cover">
                      <CoverImage src={c.coverUrl} alt={c.title || ""} />
                    </Link>
                    <div className="botm-candidate-body">
                      <h3>
                        <Link to={`/book/${c.bookId}`}>{c.title}</Link>
                      </h3>
                      {c.authorName && <p className="botm-muted">{c.authorName}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default BookOfTheMonth;
