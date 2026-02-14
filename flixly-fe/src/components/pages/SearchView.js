import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuthors } from "../../service/APIService";
import "./SearchView.css";

const SearchView = ({ books }) => {
  const { searchTerm } = useParams();
  const navigate = useNavigate();
  
  const [authors, setAuthors] = useState([]);
  
  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const data = await getAuthors();
      setAuthors(data?.authors || []);
    } catch (err) {
      console.error("Authors yüklenirken hata:", err);
    }
  };

  const normalized = searchTerm.toLowerCase();

  const filteredBooks = books?.filter(
    (b) =>
      b.title.toLowerCase().includes(normalized) ||
      b.originalTitle?.toLowerCase().includes(normalized)
  );

  const filteredAuthors = authors?.filter((a) =>
    a.name.toLowerCase().includes(normalized)
  );

  return (
    <div className="page-layout">
      <main className="page-main">
        <div className="search-page container">
          <h2>
            <span className="search-term">&ldquo;{searchTerm}&rdquo;</span> için arama sonuçları
          </h2>

          {filteredAuthors.length > 0 && (
            <>
              <h3>Yazarlar ({filteredAuthors.length})</h3>
              <ul className="search-results-list">
                {filteredAuthors.map((author) => (
                  <li
                    key={author.id}
                    onClick={() => navigate(`/author/${author.id}`)}
                    className="search-item"
                  >
                    {author.name}
                  </li>
                ))}
              </ul>
            </>
          )}

          {filteredBooks.length > 0 && (
            <>
              <h3>Kitaplar ({filteredBooks.length})</h3>
              <ul className="search-results-list">
                {filteredBooks.map((book) => (
                  <li
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`, { state: { book } })}
                    className="search-item"
                  >
                    {book.title}
                  </li>
                ))}
              </ul>
            </>
          )}

          {filteredBooks.length === 0 && filteredAuthors.length === 0 && (
            <p className="no-results">Kitap veya yazar bulunamadı.</p>
          )}
        </div>
      </main>
      <aside className="page-sidebar" aria-hidden="true" />
    </div>
  );
};

export default SearchView;
