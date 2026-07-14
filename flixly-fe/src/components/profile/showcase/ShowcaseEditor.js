import { useMemo, useState } from "react";
import { Autocomplete, Paper, TextField } from "@mui/material";
import CoverImage from "../../ui/CoverImage";
import {
  DESCRIPTION_MAX,
  QUOTE_MAX,
  SHOWCASE_TYPE,
  TITLE_MAX,
  VITRINE_COPY,
} from "./showcaseConstants";

const ShowcaseEditor = ({
  editingId,
  type,
  setType,
  typeLocked,
  availableTypes,
  title,
  setTitle,
  description,
  setDescription,
  quote,
  setQuote,
  selectedBook,
  onPickBook,
  onClearBook,
  catalogBooks = [],
  favoriteBooks = [],
  selectedFavoriteIds,
  selectedFavoriteBooks = [],
  onSelectFavoriteCandidate,
  onRemoveFavoriteId,
  favoriteLimit,
  inlineError,
  busy,
  onCancel,
  onSave,
  canSave,
}) => {
  const isFavorites = type === SHOWCASE_TYPE.FAVORITE_BOOKS;
  const [searchValue, setSearchValue] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const typeOptions = useMemo(() => {
    if (typeLocked) {
      return [
        {
          value: type,
          label:
            type === SHOWCASE_TYPE.FAVORITE_BOOKS
              ? VITRINE_COPY.typeFavorites
              : VITRINE_COPY.typeQuote,
        },
      ];
    }
    return availableTypes.map((value) => ({
      value,
      label:
        value === SHOWCASE_TYPE.FAVORITE_BOOKS
          ? VITRINE_COPY.typeFavorites
          : VITRINE_COPY.typeQuote,
    }));
  }, [availableTypes, type, typeLocked]);

  const searchOptions = useMemo(() => {
    const favIds = new Set((favoriteBooks || []).map((b) => b.id));
    const selected = new Set(selectedFavoriteIds || []);
    // Prefer showing favorites first when searching; still allow full catalog.
    return [...(catalogBooks || [])]
      .filter((b) => b?.id && !selected.has(b.id))
      .sort((a, b) => {
        const af = favIds.has(a.id) ? 0 : 1;
        const bf = favIds.has(b.id) ? 0 : 1;
        if (af !== bf) return af - bf;
        return (a.title || "").localeCompare(b.title || "", "tr");
      });
  }, [catalogBooks, favoriteBooks, selectedFavoriteIds]);

  const handleSearchPick = async (_, book) => {
    setSearchValue(null);
    setSearchInput("");
    if (!book) return;
    await onSelectFavoriteCandidate?.(book);
  };

  return (
    <div className="ps-composer">
      <h4 className="ps-composer-title">
        {editingId ? "Vitrini düzenle" : VITRINE_COPY.add}
      </h4>

      <label className="ps-field-label">
        {VITRINE_COPY.pickType}
        <select
          className="ps-select"
          value={type}
          disabled={busy || typeLocked || typeOptions.length === 0}
          onChange={(e) => setType(e.target.value)}
          aria-label={VITRINE_COPY.pickType}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="ps-field-label">
        {VITRINE_COPY.titleLabel}
        <input
          type="text"
          className="ps-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
          placeholder={
            isFavorites ? VITRINE_COPY.titlePlaceholder : VITRINE_COPY.defaultQuoteTitle
          }
          maxLength={TITLE_MAX}
          disabled={busy}
        />
      </label>

      {isFavorites && (
        <label className="ps-field-label">
          {VITRINE_COPY.descriptionLabel}
          <input
            type="text"
            className="ps-title-input"
            value={description || ""}
            onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
            placeholder={VITRINE_COPY.descriptionPlaceholder}
            maxLength={DESCRIPTION_MAX}
            disabled={busy}
          />
        </label>
      )}

      {isFavorites ? (
        <>
          <p className="ps-limit-hint">
            {VITRINE_COPY.booksSelected(selectedFavoriteIds.length, favoriteLimit)}
          </p>
          <p className="ps-search-hint">{VITRINE_COPY.searchHint}</p>

          <label className="ps-field-label">
            {VITRINE_COPY.searchBooks}
            <Autocomplete
              options={searchOptions}
              value={searchValue}
              inputValue={searchInput}
              onInputChange={(_, v) => setSearchInput(v)}
              onChange={handleSearchPick}
              disabled={busy || selectedFavoriteIds.length >= favoriteLimit}
              getOptionLabel={(option) => option?.title ?? ""}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              filterOptions={(options, state) => {
                const q = state.inputValue.trim().toLowerCase();
                if (!q) return options.slice(0, 40);
                return options
                  .filter((option) => {
                    return (
                      (option?.title ?? "").toLowerCase().includes(q) ||
                      (option?.authorName ?? "").toLowerCase().includes(q) ||
                      (option?.originalTitle ?? "").toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 40);
              }}
              noOptionsText="Kitap bulunamadı"
              PaperComponent={(props) => (
                <Paper
                  {...props}
                  sx={{
                    backgroundColor: "var(--color-background-card, #1c1c28)",
                    color: "var(--color-text-secondary, #ddd)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  elevation={0}
                />
              )}
              renderOption={(props, option) => {
                const isFav = (favoriteBooks || []).some((f) => f.id === option.id);
                return (
                  <li {...props} key={option.id} className="ps-search-option">
                    <CoverImage
                      src={option.coverUrl}
                      alt={option.title || ""}
                      className="ps-search-option-cover"
                    />
                    <span className="ps-search-option-meta">
                      <strong>{option.title}</strong>
                      <span>
                        {option.authorName || "—"}
                        {isFav ? " · Favori" : ""}
                      </span>
                    </span>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={VITRINE_COPY.searchPlaceholder}
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(0,0,0,0.35)",
                      color: "#eee",
                      borderRadius: "8px",
                      "& fieldset": { borderColor: "rgba(212,175,55,0.25)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.35)" },
                      "&.Mui-focused fieldset": { borderColor: "var(--color-accent, #d4af37)" },
                    },
                  }}
                />
              )}
            />
          </label>

          {selectedFavoriteBooks.length > 0 && (
            <div className="ps-selected-books">
              <p className="ps-field-label">{VITRINE_COPY.selectedBooks}</p>
              <ul className="ps-selected-list">
                {selectedFavoriteBooks.map((book) => (
                  <li key={book.id || book.bookId} className="ps-selected-item">
                    <CoverImage
                      src={book.coverUrl}
                      alt={book.title || ""}
                      className="ps-selected-cover"
                    />
                    <span className="ps-selected-meta">
                      <strong>{book.title}</strong>
                      <span>{book.authorName || "—"}</span>
                    </span>
                    <button
                      type="button"
                      className="ps-action"
                      onClick={() => onRemoveFavoriteId?.(book.id || book.bookId)}
                      disabled={busy}
                    >
                      {VITRINE_COPY.removeBook}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {favoriteBooks.length === 0 && selectedFavoriteIds.length === 0 && (
            <p className="ps-limit-hint">{VITRINE_COPY.noFavorites}</p>
          )}
          {selectedFavoriteIds.length >= favoriteLimit && (
            <p className="ps-inline-error">{VITRINE_COPY.booksLimit(favoriteLimit)}</p>
          )}
        </>
      ) : (
        <div className="ps-composer-row">
          <div className="ps-pick-col">
            <button type="button" className="ps-pick-book" onClick={onPickBook} disabled={busy}>
              {selectedBook ? (
                <>
                  <CoverImage
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title || ""}
                    className="ps-pick-cover"
                  />
                  <span className="ps-pick-meta">
                    <strong>{selectedBook.title}</strong>
                    <span>{selectedBook.authorName || "Kitap seçildi"}</span>
                  </span>
                </>
              ) : (
                <span className="ps-pick-placeholder">{VITRINE_COPY.pickBookOptional}</span>
              )}
            </button>
            {selectedBook && (
              <button type="button" className="ps-action ps-clear-book" onClick={onClearBook} disabled={busy}>
                {VITRINE_COPY.clearBook}
              </button>
            )}
          </div>
          <textarea
            className={`ps-quote-input ${selectedBook ? "" : "ps-quote-input--hand"}`}
            value={quote}
            onChange={(e) => setQuote(e.target.value.slice(0, QUOTE_MAX))}
            placeholder={
              selectedBook ? VITRINE_COPY.quotePlaceholderBook : VITRINE_COPY.quotePlaceholderSolo
            }
            rows={4}
            maxLength={QUOTE_MAX}
            disabled={busy}
          />
        </div>
      )}

      {inlineError && <p className="ps-inline-error">{inlineError}</p>}

      <div className="ps-composer-actions">
        {!isFavorites && (
          <span className="ps-char-count">
            {quote.length}/{QUOTE_MAX}
          </span>
        )}
        {isFavorites && (
          <span className="ps-char-count">
            {(title || "").length}/{TITLE_MAX}
          </span>
        )}
        <button type="button" className="ps-action" onClick={onCancel} disabled={busy}>
          {VITRINE_COPY.cancel}
        </button>
        <button
          type="button"
          className="profile-btn profile-btn--subtle"
          onClick={onSave}
          disabled={busy || !canSave}
        >
          {busy ? VITRINE_COPY.saving : editingId ? VITRINE_COPY.update : VITRINE_COPY.save}
        </button>
      </div>
    </div>
  );
};

export default ShowcaseEditor;
