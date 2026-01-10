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
    <div className="search-page">
      <h2>Arama Sonuçları: "{searchTerm}"</h2>

      {/* Yazarlar */}
      {filteredAuthors.length > 0 && (
        <>
          <h3>Yazarlar</h3>
          <ul>
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

      {/* Kitaplar */}
      {filteredBooks.length > 0 && (
        <>
          <h3>Kitaplar</h3>
          <ul>
            {filteredBooks.map((book) => (
              <li
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="search-item"
              >
                {book.title}
              </li>
            ))}
          </ul>
        </>
      )}

      {filteredBooks.length === 0 && filteredAuthors.length === 0 && (
        <p>Sonuç bulunamadı.</p>
      )}
    </div>
  );
};

export default SearchView;
