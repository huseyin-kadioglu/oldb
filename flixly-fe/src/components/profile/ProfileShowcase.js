import { useEffect, useMemo, useState } from "react";
import BookFilter from "../common/BookFilter";
import {
  createShowcase,
  updateShowcase,
  deleteShowcase,
  reorderShowcases,
  createUserActivityFromGhostMenu,
  isProPlanRole,
  extractApiErrorMessage,
} from "../../service/APIService";
import ProfileShowcaseRenderer from "./showcase/ProfileShowcaseRenderer";
import ShowcaseEditor from "./showcase/ShowcaseEditor";
import {
  SHOWCASE_TYPE,
  VITRINE_COPY,
} from "./showcase/showcaseConstants";
import "../ui/folios-ui.css";
import "./ProfileShowcase.css";

const favoriteBookLimit = () => 5;

const ProfileShowcase = ({
  showcases = [],
  showcaseLimit = 1,
  role,
  isOwnProfile,
  books = [],
  favoriteBooks = [],
  onChanged,
}) => {
  const limit = showcaseLimit || (isProPlanRole(role) ? 3 : 1);
  const favLimit = favoriteBookLimit();
  const items = useMemo(
    () => (Array.isArray(showcases) ? showcases : []),
    [showcases]
  );
  const visibleItems = useMemo(() => {
    if (isOwnProfile) return items;
    return items.filter((item) => {
      if ((item.type || SHOWCASE_TYPE.QUOTE) !== SHOWCASE_TYPE.FAVORITE_BOOKS) {
        return true;
      }
      return Array.isArray(item.books) && item.books.length > 0;
    });
  }, [items, isOwnProfile]);

  const favoritesForPicker = useMemo(() => {
    const byId = new Map((books || []).map((b) => [b.id, b]));
    return (favoriteBooks || []).map((book) => {
      const fromCatalog = byId.get(book.id);
      return {
        ...book,
        authorName: book.authorName || fromCatalog?.authorName || "",
        coverUrl: book.coverUrl || fromCatalog?.coverUrl,
      };
    });
  }, [favoriteBooks, books]);

  const usedTypes = useMemo(
    () => new Set(items.map((i) => i.type || SHOWCASE_TYPE.QUOTE)),
    [items]
  );

  const availableTypes = useMemo(() => {
    const types = [];
    if (!usedTypes.has(SHOWCASE_TYPE.QUOTE)) types.push(SHOWCASE_TYPE.QUOTE);
    if (!usedTypes.has(SHOWCASE_TYPE.FAVORITE_BOOKS)) types.push(SHOWCASE_TYPE.FAVORITE_BOOKS);
    return types;
  }, [usedTypes]);

  const canAdd = isOwnProfile && items.length < limit && availableTypes.length > 0;

  const [managing, setManaging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [quote, setQuote] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(SHOWCASE_TYPE.QUOTE);
  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState([]);
  const [localPickedBooks, setLocalPickedBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [limitShow, setLimitShow] = useState(false);

  useEffect(() => {
    if (!composerOpen) {
      setSelectedBook(null);
      setQuote("");
      setTitle("");
      setDescription("");
      setEditingId(null);
      setSelectedFavoriteIds([]);
      setLocalPickedBooks([]);
      setInlineError("");
      setType(availableTypes[0] || SHOWCASE_TYPE.QUOTE);
    }
  }, [composerOpen, availableTypes]);

  const normalizeId = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const selectedFavoriteBooks = useMemo(() => {
    const byId = new Map();
    for (const book of favoritesForPicker) {
      const id = normalizeId(book.id);
      if (id != null) byId.set(id, book);
    }
    for (const book of localPickedBooks) {
      const id = normalizeId(book.id);
      if (id != null) byId.set(id, book);
    }
    for (const book of books || []) {
      const id = normalizeId(book.id);
      if (id != null && !byId.has(id)) byId.set(id, book);
    }
    return selectedFavoriteIds
      .map((id) => byId.get(normalizeId(id)))
      .filter(Boolean)
      .map((book) => ({
        id: normalizeId(book.id),
        bookId: normalizeId(book.id),
        title: book.title,
        authorName: book.authorName,
        coverUrl: book.coverUrl,
      }));
  }, [selectedFavoriteIds, favoritesForPicker, localPickedBooks, books]);

  const closeComposer = () => setComposerOpen(false);

  const openAdd = () => {
    setMenuOpen(false);
    if (items.length >= limit || availableTypes.length === 0) {
      setLimitShow(true);
      return;
    }
    setLimitShow(false);
    setManaging(false);
    setEditingId(null);
    setType(availableTypes[0] || SHOWCASE_TYPE.QUOTE);
    setSelectedBook(null);
    setQuote("");
    setTitle("");
    setDescription("");
    setSelectedFavoriteIds([]);
    setLocalPickedBooks([]);
    setComposerOpen(true);
  };

  const startManaging = () => {
    setMenuOpen(false);
    setComposerOpen(false);
    setManaging(true);
  };

  const finishManaging = () => {
    setManaging(false);
    setComposerOpen(false);
    setMenuOpen(false);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setType(item.type || SHOWCASE_TYPE.QUOTE);
    setSelectedBook(
      item.bookId
        ? {
            id: item.bookId,
            title: item.bookTitle,
            coverUrl: item.coverUrl,
            authorName: item.authorName,
          }
        : null
    );
    setQuote(item.quote || "");
    setTitle(
      item.type === SHOWCASE_TYPE.FAVORITE_BOOKS
        ? item.title === VITRINE_COPY.defaultFavoriteTitle
          ? ""
          : item.title || ""
        : item.title === VITRINE_COPY.defaultQuoteTitle
          ? ""
          : item.title || ""
    );
    setDescription(item.description || "");
    const bookRows = Array.isArray(item.books) ? item.books : [];
    const ids = bookRows.map((b) => normalizeId(b.bookId ?? b.id)).filter((id) => id != null);
    setSelectedFavoriteIds(ids);
    setLocalPickedBooks(
      bookRows.map((b) => ({
        id: normalizeId(b.bookId ?? b.id),
        title: b.title,
        authorName: b.authorName,
        coverUrl: b.coverUrl,
      })).filter((b) => b.id != null)
    );
    setComposerOpen(true);
    setManaging(true);
  };

  const handleBookPicked = (book) => {
    if (!book) return;
    setSelectedBook(book);
    setPickerOpen(false);
  };

  const removeFavoriteId = (bookId) => {
    const id = normalizeId(bookId);
    setSelectedFavoriteIds((prev) => prev.filter((x) => normalizeId(x) !== id));
    setLocalPickedBooks((prev) => prev.filter((b) => normalizeId(b.id) !== id));
    setInlineError("");
  };

  const selectFavoriteCandidate = async (book) => {
    if (!book?.id) return;
    const bookId = normalizeId(book.id);
    if (bookId == null) return;
    if (selectedFavoriteIds.includes(bookId)) return;
    if (selectedFavoriteIds.length >= favLimit) {
      setInlineError(VITRINE_COPY.booksLimit(favLimit));
      return;
    }

    const alreadyFavorite = favoritesForPicker.some((f) => normalizeId(f.id) === bookId);
    setBusy(true);
    setInlineError("");
    try {
      if (!alreadyFavorite) {
        await createUserActivityFromGhostMenu({
          bookId,
          authorId: book.authorId,
          actionType: "FAVOURITE",
          action: "ADD",
        });
      }
      setLocalPickedBooks((prev) =>
        prev.some((b) => normalizeId(b.id) === bookId) ? prev : [...prev, { ...book, id: bookId }]
      );
      setSelectedFavoriteIds((prev) => (prev.includes(bookId) ? prev : [...prev, bookId]));
      // Profili kaydetmeden yenileme: seçim state'ini bozmamak için onChanged yok
    } catch (err) {
      setInlineError(extractApiErrorMessage(err, "Kitap favorilere eklenemedi."));
    } finally {
      setBusy(false);
    }
  };

  const canSave =
    type === SHOWCASE_TYPE.FAVORITE_BOOKS
      ? selectedFavoriteIds.length > 0
      : quote.trim().length >= 2;

  const handleSave = async () => {
    if (!canSave) return;
    setBusy(true);
    setInlineError("");
    try {
      const payload =
        type === SHOWCASE_TYPE.FAVORITE_BOOKS
          ? {
              type: SHOWCASE_TYPE.FAVORITE_BOOKS,
              title: title.trim() || null,
              description: description.trim() || null,
              bookIds: selectedFavoriteIds.map(normalizeId).filter((id) => id != null),
            }
          : {
              type: SHOWCASE_TYPE.QUOTE,
              title: title.trim() || null,
              description: description.trim() || null,
              bookId: selectedBook?.id ?? null,
              quote: quote.trim(),
            };
      if (editingId) {
        await updateShowcase(editingId, payload);
      } else {
        await createShowcase(payload);
      }
      setComposerOpen(false);
      setManaging(false);
      onChanged?.();
    } catch (err) {
      setInlineError(extractApiErrorMessage(err, VITRINE_COPY.saveError));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    setInlineError("");
    try {
      await deleteShowcase(deleteTarget.id);
      if (editingId === deleteTarget.id) setComposerOpen(false);
      setDeleteTarget(null);
      onChanged?.();
    } catch (err) {
      setInlineError(extractApiErrorMessage(err, VITRINE_COPY.deleteError));
    } finally {
      setBusy(false);
    }
  };

  const moveItem = async (index, direction) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setBusy(true);
    try {
      await reorderShowcases(next.map((i) => i.id));
      onChanged?.();
    } catch (err) {
      setInlineError(extractApiErrorMessage(err, "Sıralama güncellenemedi."));
    } finally {
      setBusy(false);
    }
  };

  if (!isOwnProfile && visibleItems.length === 0) {
    return null;
  }

  const showActions = isOwnProfile && managing && !composerOpen;

  const slots = Array.from({ length: limit }, (_, i) => i < items.length);

  return (
    <section className={`profile-section profile-showcase ${managing ? "is-managing" : ""}`}>
      <div className="folios-section-header ps-section-header">
        <div className="ps-section-heading">
          <h2 className="folios-section-title">{VITRINE_COPY.section}</h2>
          {isOwnProfile && (
            <div className="ps-slot-meter" title={`${items.length} / ${limit}`} aria-label={`${items.length} / ${limit}`}>
              <span className="ps-slot-count">{items.length}/{limit}</span>
              <span className="ps-slot-dots" aria-hidden="true">
                {slots.map((filled, i) => (
                  <span key={i} className={`ps-slot-dot ${filled ? "is-filled" : ""}`} />
                ))}
              </span>
            </div>
          )}
        </div>
        {isOwnProfile && (
          <div className="ps-header-actions">
            {managing ? (
              <button type="button" className="folios-see-all" onClick={finishManaging}>
                {VITRINE_COPY.finishManage}
              </button>
            ) : (
              <div className="ps-manage-menu">
                <button
                  type="button"
                  className="folios-see-all"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {VITRINE_COPY.manage}
                </button>
                {menuOpen && (
                  <div className="ps-manage-dropdown" role="menu">
                    <button type="button" role="menuitem" onClick={openAdd}>
                      {VITRINE_COPY.add}
                    </button>
                    {items.length > 0 && (
                      <button type="button" role="menuitem" onClick={startManaging}>
                        {VITRINE_COPY.edit}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {limitShow && (
        <p className="ps-inline-error" role="status">
          {VITRINE_COPY.limitFull}
        </p>
      )}

      {items.length === 0 && isOwnProfile && !composerOpen && (
        <div className="ps-empty">
          <p className="ps-empty-title">{VITRINE_COPY.emptyTitle}</p>
          <p>{VITRINE_COPY.emptyBody}</p>
          <button type="button" className="profile-btn profile-btn--subtle" onClick={openAdd}>
            {VITRINE_COPY.add}
          </button>
        </div>
      )}

      {!composerOpen && (
        <div className="ps-list">
          {visibleItems.map((item) => {
            const index = items.findIndex((i) => i.id === item.id);
            return (
              <ProfileShowcaseRenderer
                key={item.id}
                item={item}
                isOwnProfile={isOwnProfile}
                showActions={showActions}
                busy={busy}
                canMoveUp={showActions && index > 0}
                canMoveDown={showActions && index < items.length - 1}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onMoveUp={() => moveItem(index, -1)}
                onMoveDown={() => moveItem(index, 1)}
              />
            );
          })}
        </div>
      )}

      {composerOpen && (
        <ShowcaseEditor
          editingId={editingId}
          type={type}
          setType={setType}
          typeLocked={!!editingId}
          availableTypes={
            editingId
              ? [type]
              : availableTypes.length
                ? availableTypes
                : [SHOWCASE_TYPE.QUOTE]
          }
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          quote={quote}
          setQuote={setQuote}
          selectedBook={selectedBook}
          onPickBook={() => setPickerOpen(true)}
          onClearBook={() => setSelectedBook(null)}
          catalogBooks={books}
          favoriteBooks={favoritesForPicker}
          selectedFavoriteIds={selectedFavoriteIds}
          selectedFavoriteBooks={selectedFavoriteBooks}
          onSelectFavoriteCandidate={selectFavoriteCandidate}
          onRemoveFavoriteId={removeFavoriteId}
          favoriteLimit={favLimit}
          inlineError={inlineError}
          busy={busy}
          onCancel={closeComposer}
          onSave={handleSave}
          canSave={canSave}
        />
      )}

      {pickerOpen && (
        <BookFilter
          open={pickerOpen}
          handleDialog={setPickerOpen}
          selectedBookHandler={handleBookPicked}
          data={books}
        />
      )}

      {deleteTarget && (
        <div className="ps-confirm" role="dialog" aria-modal="true" aria-labelledby="ps-del-title">
          <div className="ps-confirm-card">
            <h4 id="ps-del-title">{VITRINE_COPY.deleteConfirmTitle}</h4>
            <p>{VITRINE_COPY.deleteConfirmBody}</p>
            <div className="ps-confirm-actions">
              <button type="button" className="ps-action" onClick={() => setDeleteTarget(null)} disabled={busy}>
                {VITRINE_COPY.cancel}
              </button>
              <button
                type="button"
                className="ps-action ps-action--danger"
                onClick={confirmDelete}
                disabled={busy}
              >
                {VITRINE_COPY.deleteConfirmAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileShowcase;
