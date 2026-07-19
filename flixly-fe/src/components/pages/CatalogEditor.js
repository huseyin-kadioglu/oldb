import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Autocomplete, Chip, TextField } from "@mui/material";
import {
  getAuthors,
  createCatalogAuthor,
  createCatalogBook,
  updateCatalogBook,
  getCatalogBook,
  checkCatalogDuplicates,
  lookupCatalogIsbn,
  searchCatalogGenres,
  isStaffRole,
} from "../../service/APIService";
import GenericMessageDialog from "../common/GenericMessageDialog";
import "./CatalogEditor.css";

const inputSx = {
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255,255,255,0.02)",
    color: "#e6edf3",
    fontSize: "0.9rem",
  },
  "& label": { color: "#9aa8b6", fontSize: "0.9rem" },
  "& label.Mui-focused": { color: "var(--color-primary-button)" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.18)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.35)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-primary-button)",
  },
};

const EMPTY_AUTHOR = {
  name: "",
  birthYear: "",
  deathYear: "",
  portrait: "",
  description: "",
};

const EMPTY_BOOK = {
  title: "",
  originalTitle: "",
  year: "",
  pageCount: "",
  coverUrl: "",
  genres: [],
  language: "",
  isbn: "",
  description: "",
  adminNotes: "",
  editorNotes: "",
  isEditorChoice: false,
  isWeeklyPick: false,
  isNewRelease: false,
};

const reasonLabel = {
  isbn: "Aynı ISBN",
  title_author: "Aynı yazar + başlık",
  original_title_author: "Aynı yazar + orijinal başlık",
};

const parseGenres = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return String(raw)
    .split(/[,;|/]/)
    .map((g) => g.trim())
    .filter(Boolean);
};

const CatalogEditor = () => {
  const navigate = useNavigate();
  const { id: editIdParam } = useParams();
  const editId = editIdParam ? Number(editIdParam) : null;
  const isEdit = Number.isFinite(editId) && editId > 0;

  const role = sessionStorage.getItem("userRole");
  const allowed = isStaffRole(role);

  const [authors, setAuthors] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);
  const [step, setStep] = useState(isEdit ? 2 : 1);
  const [authorMode, setAuthorMode] = useState("select");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [newAuthor, setNewAuthor] = useState(EMPTY_AUTHOR);
  const [book, setBook] = useState(EMPTY_BOOK);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [savingAuthor, setSavingAuthor] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [lookingUpIsbn, setLookingUpIsbn] = useState(false);
  const [checkingDup, setCheckingDup] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [isbnPreview, setIsbnPreview] = useState(null);
  const [weeklyConflict, setWeeklyConflict] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialog, setDialog] = useState({ open: false, title: "", message: "" });
  const [lastSavedBookId, setLastSavedBookId] = useState(null);
  const [audit, setAudit] = useState(null);

  const loadAuthors = () => {
    getAuthors()
      .then((data) => setAuthors(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Yazarlar alınamadı:", err));
  };

  useEffect(() => {
    if (!allowed) return;
    loadAuthors();
    searchCatalogGenres("")
      .then((data) => setGenreOptions(data?.genres || []))
      .catch(() => {});
  }, [allowed]);

  useEffect(() => {
    if (!allowed || !isEdit) return;
    setLoadingEdit(true);
    getCatalogBook(editId)
      .then((data) => {
        setBook({
          title: data.title || "",
          originalTitle: data.originalTitle || "",
          year: data.year || "",
          pageCount: data.pageCount ?? "",
          coverUrl: data.coverUrl || "",
          genres: parseGenres(data.genres),
          language: data.language || "",
          isbn: data.isbn || "",
          description: data.description || "",
          adminNotes: data.adminNotes || "",
          editorNotes: data.editorNotes || "",
          isEditorChoice: !!data.isEditorChoice,
          isWeeklyPick: !!data.isWeeklyPick,
          isNewRelease: !!data.isNewRelease,
        });
        setAudit({
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedBy: data.updatedBy,
          updatedAt: data.updatedAt,
        });
        if (data.authorId) {
          setSelectedAuthor({ id: data.authorId, name: data.authorName || "" });
        }
        setStep(2);
      })
      .catch((err) => {
        setDialog({
          open: true,
          title: "Hata",
          message: err.message || "Kitap yüklenemedi.",
        });
      })
      .finally(() => setLoadingEdit(false));
  }, [allowed, isEdit, editId]);

  const showError = (message) =>
    setDialog({ open: true, title: "Hata", message });

  const validateClient = () => {
    const errors = {};
    if (!book.title.trim()) errors.title = "Kitap adı zorunludur.";
    if (!selectedAuthor?.id) errors.author = "Yazar seçilmelidir.";
    const yearNum = book.year === "" ? null : Number(book.year);
    if (yearNum != null && (yearNum < 0 || yearNum > new Date().getFullYear() + 2)) {
      errors.year = "Geçersiz yıl.";
    }
    const isbnDigits = String(book.isbn || "").replace(/[^0-9Xx]/g, "");
    if (isbnDigits && isbnDigits.length !== 10 && isbnDigits.length !== 13) {
      errors.isbn = "ISBN 10 veya 13 haneli olmalı.";
    }
    if (book.pageCount !== "" && Number(book.pageCount) < 0) {
      errors.pageCount = "Sayfa sayısı negatif olamaz.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = (confirmWeeklyPickReplace = false) => ({
    title: book.title.trim(),
    originalTitle: book.originalTitle.trim(),
    authorId: selectedAuthor?.id,
    year: book.year ? Number(book.year) : 0,
    pageCount: book.pageCount !== "" ? Number(book.pageCount) : null,
    coverUrl: book.coverUrl.trim(),
    genres: book.genres.join(", "),
    language: book.language.trim(),
    isbn: book.isbn.trim(),
    description: book.description.trim(),
    adminNotes: book.adminNotes.trim(),
    editorNotes: book.editorNotes.trim(),
    isEditorChoice: book.isEditorChoice,
    isWeeklyPick: book.isWeeklyPick,
    isNewRelease: book.isNewRelease,
    confirmWeeklyPickReplace,
  });

  const handleSaveAuthor = async () => {
    if (!newAuthor.name.trim()) {
      showError("Yazar adı zorunludur.");
      return;
    }
    setSavingAuthor(true);
    try {
      const saved = await createCatalogAuthor({
        name: newAuthor.name.trim(),
        birthYear: newAuthor.birthYear ? Number(newAuthor.birthYear) : null,
        deathYear: newAuthor.deathYear ? Number(newAuthor.deathYear) : null,
        portrait: newAuthor.portrait.trim(),
        description: newAuthor.description.trim(),
      });
      setSelectedAuthor(saved);
      setNewAuthor(EMPTY_AUTHOR);
      loadAuthors();
      setStep(2);
    } catch (err) {
      showError(err.message || "Yazar kaydedilemedi.");
    } finally {
      setSavingAuthor(false);
    }
  };

  const handleContinueWithExisting = () => {
    if (!selectedAuthor) {
      showError("Lütfen bir yazar seçin.");
      return;
    }
    setStep(2);
  };

  const runDuplicateCheck = async () => {
    if (!selectedAuthor?.id || !book.title.trim()) {
      setDuplicates([]);
      return [];
    }
    setCheckingDup(true);
    try {
      const result = await checkCatalogDuplicates(
        buildPayload(false),
        isEdit ? editId : null
      );
      const matches = result?.matches || [];
      setDuplicates(matches);
      return matches;
    } catch {
      return [];
    } finally {
      setCheckingDup(false);
    }
  };

  const submitBook = async (confirmWeekly = false) => {
    if (!validateClient()) return;
    const matches = await runDuplicateCheck();
    if (matches.length > 0 && !isEdit) {
      showError("Benzer kayıtlar bulundu. Mevcut kaydı düzenleyin veya alanları değiştirin.");
      return;
    }
    if (matches.length > 0 && isEdit) {
      showError("Bu değişiklik başka bir kayıtla çakışıyor.");
      return;
    }

    setSavingBook(true);
    setWeeklyConflict(null);
    try {
      const payload = buildPayload(confirmWeekly);
      const saved = isEdit
        ? await updateCatalogBook(editId, payload)
        : await createCatalogBook(payload);
      setLastSavedBookId(saved?.id ?? null);
      setAudit({
        createdBy: saved?.createdBy,
        createdAt: saved?.createdAt,
        updatedBy: saved?.updatedBy,
        updatedAt: saved?.updatedAt,
      });
      if (!isEdit) {
        setBook(EMPTY_BOOK);
        setDuplicates([]);
        setIsbnPreview(null);
      }
      setDialog({
        open: true,
        title: isEdit ? "Güncellendi" : "Kaydedildi",
        message: isEdit
          ? `"${saved?.title}" güncellendi.`
          : `"${saved?.title}" katalogda yayınlandı.`,
      });
      if (isEdit && saved?.id) {
        // stay on edit form with fresh audit
      }
    } catch (err) {
      if (err.status === 409 && err.data?.code === "WEEKLY_PICK_CONFLICT") {
        setWeeklyConflict(err.data.current || null);
        return;
      }
      showError(err.message || "Kitap kaydedilemedi.");
    } finally {
      setSavingBook(false);
    }
  };

  const handleIsbnLookup = async () => {
    const isbn = book.isbn.trim();
    if (!isbn) {
      showError("Önce ISBN girin.");
      return;
    }
    setLookingUpIsbn(true);
    setIsbnPreview(null);
    try {
      const data = await lookupCatalogIsbn(isbn);
      if (!data?.found) {
        showError(data?.message || "ISBN bulunamadı.");
        return;
      }
      setIsbnPreview(data);
    } catch (err) {
      showError(err.message || "ISBN sorgusu başarısız.");
    } finally {
      setLookingUpIsbn(false);
    }
  };

  const applyIsbnPreview = () => {
    if (!isbnPreview) return;
    setBook((prev) => ({
      ...prev,
      title: prev.title || isbnPreview.title || "",
      originalTitle: prev.originalTitle || isbnPreview.originalTitle || "",
      year: prev.year || isbnPreview.year || "",
      pageCount: prev.pageCount || isbnPreview.pageCount || "",
      language: prev.language || isbnPreview.language || "",
      coverUrl: prev.coverUrl || isbnPreview.coverUrl || "",
      description: prev.description || isbnPreview.description || "",
      isbn: isbnPreview.isbn || prev.isbn,
      genres:
        prev.genres.length > 0
          ? prev.genres
          : parseGenres((isbnPreview.genreSuggestions || []).join(", ")),
    }));
    if (isbnPreview.matchedAuthorId) {
      const matched = authors.find((a) => a.id === isbnPreview.matchedAuthorId);
      if (matched) setSelectedAuthor(matched);
      else {
        setSelectedAuthor({
          id: isbnPreview.matchedAuthorId,
          name: isbnPreview.authorName || "",
        });
      }
    }
    setIsbnPreview(null);
  };

  const setBookField = (key) => (e) =>
    setBook((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleFlag = (key) => () =>
    setBook((prev) => ({ ...prev, [key]: !prev[key] }));

  const authorPreview = authorMode === "new" ? newAuthor : selectedAuthor;

  const bookMeta = useMemo(() => {
    const parts = [];
    if (book.year) parts.push(book.year);
    if (book.pageCount) parts.push(`${book.pageCount} sayfa`);
    if (book.language) parts.push(book.language);
    return parts.join(" · ");
  }, [book.year, book.pageCount, book.language]);

  if (!allowed) {
    return (
      <div className="catalog-editor">
        <p className="ce-denied">Bu sayfa yalnızca admin ve moderatörler içindir.</p>
      </div>
    );
  }

  if (loadingEdit) {
    return (
      <div className="catalog-editor">
        <p className="ce-denied">Kitap yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="catalog-editor">
      <header className="ce-header">
        <div>
          <h1 className="ce-title">
            {isEdit ? "Kitabı düzenle" : "Katalog Editörü"}
          </h1>
          <p className="ce-subtitle">
            {isEdit
              ? "Metadata güncellemesi — puanlar ve listeler korunur."
              : "Yazar ve kitapları doğrudan katalogda yayınla — onay gerekmez."}
          </p>
        </div>
        {!isEdit && (
          <ol className="ce-steps">
            <li className={step === 1 ? "is-active" : "is-done"}>
              <span className="ce-step-no">1</span> Yazar
            </li>
            <li className={step === 2 ? "is-active" : ""}>
              <span className="ce-step-no">2</span> Kitap
            </li>
          </ol>
        )}
        {isEdit && (
          <button
            type="button"
            className="ce-link-btn"
            onClick={() => navigate("/catalogEditor")}
          >
            ← Yeni kitap ekle
          </button>
        )}
      </header>

      {step === 1 && !isEdit && (
        <section className="ce-panel">
          <div className="ce-grid">
            <div className="ce-form">
              <div className="ce-segments">
                <button
                  type="button"
                  className={authorMode === "select" ? "is-active" : ""}
                  onClick={() => setAuthorMode("select")}
                >
                  Mevcut yazar
                </button>
                <button
                  type="button"
                  className={authorMode === "new" ? "is-active" : ""}
                  onClick={() => setAuthorMode("new")}
                >
                  Yeni yazar
                </button>
              </div>

              {authorMode === "select" ? (
                <>
                  <Autocomplete
                    options={authors}
                    value={selectedAuthor}
                    getOptionLabel={(o) => o?.name || ""}
                    isOptionEqualToValue={(o, v) => o.id === v?.id}
                    onChange={(e, v) => setSelectedAuthor(v)}
                    renderInput={(params) => (
                      <TextField {...params} label="Yazar ara" sx={inputSx} />
                    )}
                  />
                  <button
                    type="button"
                    className="ce-primary"
                    onClick={handleContinueWithExisting}
                  >
                    Devam et
                  </button>
                </>
              ) : (
                <>
                  <TextField
                    label="Ad Soyad *"
                    value={newAuthor.name}
                    onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                    sx={inputSx}
                    fullWidth
                  />
                  <div className="ce-row">
                    <TextField
                      label="Doğum yılı"
                      type="number"
                      value={newAuthor.birthYear}
                      onChange={(e) =>
                        setNewAuthor({ ...newAuthor, birthYear: e.target.value })
                      }
                      sx={inputSx}
                      fullWidth
                    />
                    <TextField
                      label="Ölüm yılı"
                      type="number"
                      value={newAuthor.deathYear}
                      onChange={(e) =>
                        setNewAuthor({ ...newAuthor, deathYear: e.target.value })
                      }
                      sx={inputSx}
                      fullWidth
                    />
                  </div>
                  <TextField
                    label="Portre URL"
                    value={newAuthor.portrait}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, portrait: e.target.value })
                    }
                    sx={inputSx}
                    fullWidth
                  />
                  <TextField
                    label="Açıklama"
                    value={newAuthor.description}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, description: e.target.value })
                    }
                    multiline
                    rows={4}
                    sx={inputSx}
                    fullWidth
                  />
                  <button
                    type="button"
                    className="ce-primary"
                    onClick={handleSaveAuthor}
                    disabled={savingAuthor}
                  >
                    {savingAuthor ? "Kaydediliyor…" : "Yazarı kaydet ve devam et"}
                  </button>
                </>
              )}
            </div>

            <aside className="ce-preview">
              <span className="ce-preview-label">Önizleme</span>
              <div className="ce-author-card">
                {authorPreview?.portrait ? (
                  <img src={authorPreview.portrait} alt={authorPreview?.name || ""} />
                ) : (
                  <div className="ce-portrait-fallback">
                    {(authorPreview?.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="ce-author-body">
                  <h3>{authorPreview?.name || "Yazar adı"}</h3>
                  <span className="ce-author-years">
                    {authorPreview?.birthYear || "—"}
                    {authorPreview?.deathYear ? ` – ${authorPreview.deathYear}` : ""}
                  </span>
                  <p>{authorPreview?.description || "Açıklama önizlemesi burada görünür."}</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="ce-panel">
          <div className="ce-author-chip">
            <span>
              Yazar: <strong>{selectedAuthor?.name || "—"}</strong>
            </span>
            {!isEdit && (
              <button type="button" onClick={() => setStep(1)}>
                Değiştir
              </button>
            )}
            {isEdit && (
              <Autocomplete
                options={authors}
                value={selectedAuthor}
                getOptionLabel={(o) => o?.name || ""}
                isOptionEqualToValue={(o, v) => o?.id === v?.id}
                onChange={(e, v) => setSelectedAuthor(v)}
                sx={{ minWidth: 220, flex: 1 }}
                renderInput={(params) => (
                  <TextField {...params} label="Yazar değiştir" size="small" sx={inputSx} />
                )}
              />
            )}
          </div>

          <div className="ce-grid">
            <div className="ce-form">
              <div className="ce-section">
                <h2 className="ce-section-title">Kimlik</h2>
                <TextField
                  label="Kitap adı *"
                  value={book.title}
                  onChange={setBookField("title")}
                  onBlur={runDuplicateCheck}
                  error={!!fieldErrors.title}
                  helperText={fieldErrors.title}
                  sx={inputSx}
                  fullWidth
                />
                <TextField
                  label="Orijinal başlık"
                  value={book.originalTitle}
                  onChange={setBookField("originalTitle")}
                  onBlur={runDuplicateCheck}
                  sx={inputSx}
                  fullWidth
                />
                <div className="ce-row">
                  <TextField
                    label="Yayın yılı"
                    type="number"
                    value={book.year}
                    onChange={setBookField("year")}
                    error={!!fieldErrors.year}
                    helperText={fieldErrors.year}
                    sx={inputSx}
                    fullWidth
                  />
                  <TextField
                    label="Sayfa sayısı"
                    type="number"
                    value={book.pageCount}
                    onChange={setBookField("pageCount")}
                    error={!!fieldErrors.pageCount}
                    helperText={fieldErrors.pageCount}
                    sx={inputSx}
                    fullWidth
                  />
                </div>
                <div className="ce-row">
                  <TextField
                    label="Dil (ör. tur, eng)"
                    value={book.language}
                    onChange={setBookField("language")}
                    sx={inputSx}
                    fullWidth
                  />
                  <div className="ce-isbn-row">
                    <TextField
                      label="ISBN"
                      value={book.isbn}
                      onChange={setBookField("isbn")}
                      onBlur={runDuplicateCheck}
                      error={!!fieldErrors.isbn}
                      helperText={fieldErrors.isbn}
                      sx={inputSx}
                      fullWidth
                    />
                    <button
                      type="button"
                      className="ce-secondary"
                      onClick={handleIsbnLookup}
                      disabled={lookingUpIsbn}
                    >
                      {lookingUpIsbn ? "…" : "ISBN bul"}
                    </button>
                  </div>
                </div>
              </div>

              {isbnPreview && (
                <div className="ce-isbn-preview">
                  <div className="ce-isbn-preview-head">
                    <strong>Open Library sonucu</strong>
                    <span>{isbnPreview.authorName || "Yazar eşleşmedi"}</span>
                  </div>
                  <p>
                    {isbnPreview.title}
                    {isbnPreview.year ? ` (${isbnPreview.year})` : ""}
                  </p>
                  <div className="ce-isbn-preview-actions">
                    <button type="button" className="ce-primary" onClick={applyIsbnPreview}>
                      Boş alanlara uygula
                    </button>
                    <button
                      type="button"
                      className="ce-link-btn"
                      onClick={() => setIsbnPreview(null)}
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              )}

              {(duplicates.length > 0 || checkingDup) && (
                <div className="ce-dup-panel" role="status">
                  <strong>
                    {checkingDup
                      ? "Yinelenen kayıt aranıyor…"
                      : `Olası yinelenenler (${duplicates.length})`}
                  </strong>
                  <ul>
                    {duplicates.map((m) => (
                      <li key={`${m.id}-${m.reason}`}>
                        <button
                          type="button"
                          className="ce-link-btn"
                          onClick={() => navigate(`/catalogEditor/books/${m.id}`)}
                        >
                          {m.title}
                        </button>
                        <span>
                          {m.authorName || "—"}
                          {m.year ? ` · ${m.year}` : ""}
                          {" · "}
                          {reasonLabel[m.reason] || m.reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ce-section">
                <h2 className="ce-section-title">Türler</h2>
                <Autocomplete
                  multiple
                  freeSolo
                  options={genreOptions}
                  value={book.genres}
                  onChange={(e, value) =>
                    setBook((prev) => ({
                      ...prev,
                      genres: value.map((v) => (typeof v === "string" ? v.trim() : v)).filter(Boolean),
                    }))
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        key={`${option}-${index}`}
                        size="small"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tür ekle (önerilir)"
                      placeholder="Kurgu, Gizem…"
                      sx={inputSx}
                    />
                  )}
                />
              </div>

              <div className="ce-section">
                <h2 className="ce-section-title">İçerik</h2>
                <TextField
                  label="Kapak URL"
                  value={book.coverUrl}
                  onChange={setBookField("coverUrl")}
                  sx={inputSx}
                  fullWidth
                />
                <TextField
                  label="Açıklama"
                  value={book.description}
                  onChange={setBookField("description")}
                  multiline
                  rows={4}
                  sx={inputSx}
                  fullWidth
                />
                <TextField
                  label="Editör notu (kullanıcıya görünür)"
                  value={book.editorNotes}
                  onChange={setBookField("editorNotes")}
                  multiline
                  rows={2}
                  sx={inputSx}
                  fullWidth
                />
                <TextField
                  label="Admin notu (iç)"
                  value={book.adminNotes}
                  onChange={setBookField("adminNotes")}
                  multiline
                  rows={2}
                  sx={inputSx}
                  fullWidth
                />
              </div>

              <div className="ce-section">
                <h2 className="ce-section-title">Vitrin</h2>
                <div className="ce-flags">
                  <label>
                    <input
                      type="checkbox"
                      checked={book.isEditorChoice}
                      onChange={toggleFlag("isEditorChoice")}
                    />
                    Editör seçimi
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={book.isWeeklyPick}
                      onChange={toggleFlag("isWeeklyPick")}
                    />
                    Haftanın kitabı
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={book.isNewRelease}
                      onChange={toggleFlag("isNewRelease")}
                    />
                    Yeni çıkan
                  </label>
                </div>

                {weeklyConflict && (
                  <div className="ce-weekly-confirm">
                    <p>
                      Şu an haftanın kitabı:{" "}
                      <strong>{weeklyConflict.title}</strong>
                      {weeklyConflict.authorName
                        ? ` (${weeklyConflict.authorName})`
                        : ""}
                      . Değiştirilsin mi?
                    </p>
                    <div className="ce-isbn-preview-actions">
                      <button
                        type="button"
                        className="ce-primary"
                        onClick={() => submitBook(true)}
                        disabled={savingBook}
                      >
                        Evet, değiştir
                      </button>
                      <button
                        type="button"
                        className="ce-link-btn"
                        onClick={() => {
                          setWeeklyConflict(null);
                          setBook((prev) => ({ ...prev, isWeeklyPick: false }));
                        }}
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {audit && (audit.updatedBy || audit.createdBy) && (
                <p className="ce-audit">
                  {audit.createdBy && (
                    <>
                      Oluşturan: {audit.createdBy}
                      {audit.createdAt ? ` · ${audit.createdAt}` : ""}
                      <br />
                    </>
                  )}
                  {audit.updatedBy && (
                    <>
                      Son düzenleyen: {audit.updatedBy}
                      {audit.updatedAt ? ` · ${audit.updatedAt}` : ""}
                    </>
                  )}
                </p>
              )}

              <button
                type="button"
                className="ce-primary"
                onClick={() => submitBook(false)}
                disabled={savingBook || duplicates.length > 0}
              >
                {savingBook
                  ? "Kaydediliyor…"
                  : isEdit
                    ? "Değişiklikleri kaydet"
                    : "Kitabı yayınla"}
              </button>

              {lastSavedBookId && (
                <button
                  type="button"
                  className="ce-link-btn"
                  onClick={() => navigate(`/book/${lastSavedBookId}`)}
                >
                  Kitap sayfasını aç →
                </button>
              )}
              {isEdit && (
                <button
                  type="button"
                  className="ce-link-btn"
                  onClick={() => navigate(`/book/${editId}`)}
                >
                  Kitap sayfasına dön →
                </button>
              )}
            </div>

            <aside className="ce-preview">
              <span className="ce-preview-label">Önizleme</span>
              <div className="ce-book-card">
                <div className="ce-book-cover">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title || ""} />
                  ) : (
                    <span>Kapak</span>
                  )}
                </div>
                <div className="ce-book-body">
                  <h3>{book.title || "Kitap adı"}</h3>
                  <span className="ce-book-author">{selectedAuthor?.name}</span>
                  {bookMeta && <span className="ce-book-meta">{bookMeta}</span>}
                  {book.genres.length > 0 && (
                    <div className="ce-book-genres">
                      {book.genres.map((g) => (
                        <span key={g}>{g}</span>
                      ))}
                    </div>
                  )}
                  {book.editorNotes && (
                    <p className="ce-editor-note">“{book.editorNotes}”</p>
                  )}
                  <p>{book.description || "Açıklama önizlemesi burada görünür."}</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {dialog.open && (
        <GenericMessageDialog
          open={dialog.open}
          onClose={() => setDialog({ ...dialog, open: false })}
          title={dialog.title}
          message={dialog.message}
        />
      )}
    </div>
  );
};

export default CatalogEditor;
