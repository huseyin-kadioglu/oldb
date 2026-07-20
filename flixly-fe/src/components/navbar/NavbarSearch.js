import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { getSearchSuggestions } from "../../service/APIService";
import InitialAvatar from "../common/InitialAvatar";
import CoverImage from "../ui/CoverImage";
import "./NavbarSearch.css";

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

const buildFlatItems = (books, authors, query) => {
  const items = [];
  (books || []).forEach((book) => {
    items.push({ type: "book", id: `book-${book.id}`, data: book });
  });
  (authors || []).forEach((author) => {
    items.push({ type: "author", id: `author-${author.id}`, data: author });
  });
  if (query.trim().length >= MIN_CHARS) {
    items.push({ type: "discover", id: "discover", data: { query: query.trim() } });
  }
  return items;
};

const NavbarSearch = () => {
  const navigate = useNavigate();
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const flatItems = buildFlatItems(books, authors, query);
  const showEmpty =
    dropdownOpen &&
    !loading &&
    query.trim().length >= MIN_CHARS &&
    books.length === 0 &&
    authors.length === 0;

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
    setActiveIndex(-1);
  }, []);

  const resetResults = useCallback(() => {
    setBooks([]);
    setAuthors([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        closeDropdown();
        if (!query.trim()) setExpanded(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [closeDropdown, query]);

  useEffect(() => {
    const trimmed = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (trimmed.length < MIN_CHARS) {
      resetResults();
      setDropdownOpen(false);
      return undefined;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setDropdownOpen(true);
      setActiveIndex(-1);
      try {
        const data = await getSearchSuggestions(trimmed, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setBooks(data?.books || []);
        setAuthors(data?.authors || []);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setBooks([]);
        setAuthors([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, resetResults]);

  const goDiscover = (q) => {
    const term = (q || query).trim();
    if (!term) return;
    navigate(`/discover?q=${encodeURIComponent(term)}`);
    setQuery("");
    setExpanded(false);
    closeDropdown();
  };

  const activateItem = (item) => {
    if (!item) return;
    if (item.type === "book") {
      navigate(`/book/${item.data.id}`);
    } else if (item.type === "author") {
      navigate(`/author/${item.data.id}`);
    } else if (item.type === "discover") {
      goDiscover(item.data.query);
      return;
    }
    setQuery("");
    setExpanded(false);
    closeDropdown();
  };

  const submitSearch = () => {
    if (activeIndex >= 0 && flatItems[activeIndex]) {
      activateItem(flatItems[activeIndex]);
      return;
    }
    goDiscover(query);
  };

  const expandAndFocus = () => {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      closeDropdown();
      if (!query.trim()) {
        setExpanded(false);
        inputRef.current?.blur();
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
      return;
    }
    if (!dropdownOpen || flatItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1));
    }
  };

  const bookStartIndex = 0;
  const authorStartIndex = books.length;
  const discoverIndex = flatItems.findIndex((i) => i.type === "discover");

  return (
    <div
      className={`navbar-search${expanded ? " is-expanded" : ""}`}
      ref={rootRef}
    >
      <div className="navbar-search-field">
        <input
          ref={inputRef}
          type="text"
          className="navbar-search-input"
          placeholder="Kitap veya yazar ara"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setExpanded(true);
          }}
          onFocus={() => {
            setExpanded(true);
            if (query.trim().length >= MIN_CHARS) setDropdownOpen(true);
          }}
          onKeyDown={onKeyDown}
          aria-label="Kitap veya yazar ara"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={dropdownOpen}
          role="combobox"
        />
        <button
          type="button"
          className="navbar-search-btn"
          onClick={() => {
            if (expanded || window.matchMedia("(min-width: 768px)").matches) {
              submitSearch();
            } else {
              expandAndFocus();
            }
          }}
          aria-label="Ara"
        >
          <SearchIcon className="navbar-search-icon" />
        </button>
      </div>

      {dropdownOpen && query.trim().length >= MIN_CHARS && (
        <div className="navbar-search-dropdown" id={listId} role="listbox">
          {loading && (
            <div className="navbar-search-skel" aria-hidden="true">
              <div className="navbar-search-skel-row" />
              <div className="navbar-search-skel-row" />
              <div className="navbar-search-skel-row short" />
            </div>
          )}

          {!loading && books.length > 0 && (
            <div className="navbar-search-section">
              <p className="navbar-search-section-label">Kitaplar</p>
              {books.map((book, idx) => {
                const flatIdx = bookStartIndex + idx;
                return (
                  <button
                    key={book.id}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === flatIdx}
                    className={`navbar-search-item ${activeIndex === flatIdx ? "active" : ""}`}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    onClick={() => activateItem({ type: "book", data: book })}
                  >
                    <CoverImage
                      src={book.coverUrl}
                      alt=""
                      className="navbar-search-cover"
                    />
                    <span className="navbar-search-item-text">
                      <span className="navbar-search-item-title">{book.title}</span>
                      {book.authorName && (
                        <span className="navbar-search-item-sub">{book.authorName}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && authors.length > 0 && (
            <div className="navbar-search-section">
              <p className="navbar-search-section-label">Yazarlar</p>
              {authors.map((author, idx) => {
                const flatIdx = authorStartIndex + idx;
                return (
                  <button
                    key={author.id}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === flatIdx}
                    className={`navbar-search-item ${activeIndex === flatIdx ? "active" : ""}`}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    onClick={() => activateItem({ type: "author", data: author })}
                  >
                    <InitialAvatar
                      name={author.name}
                      src={author.imageUrl}
                      className="navbar-search-avatar"
                    />
                    <span className="navbar-search-item-text">
                      <span className="navbar-search-item-title">{author.name}</span>
                      {author.bookCount > 0 && (
                        <span className="navbar-search-item-sub">
                          {author.bookCount} kitap
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {showEmpty && (
            <div className="navbar-search-empty">
              <p>Sonuç bulunamadı</p>
              <button type="button" onClick={() => goDiscover(query)}>
                Keşfet’te ara
              </button>
            </div>
          )}

          {!loading && !showEmpty && discoverIndex >= 0 && (
            <button
              type="button"
              role="option"
              aria-selected={activeIndex === discoverIndex}
              className={`navbar-search-footer ${activeIndex === discoverIndex ? "active" : ""}`}
              onMouseEnter={() => setActiveIndex(discoverIndex)}
              onClick={() => goDiscover(query)}
            >
              Tüm kitap sonuçlarını Keşfet’te gör
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
