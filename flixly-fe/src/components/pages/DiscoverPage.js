import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PhotoFrame from "../frame/PhotoFrame";
import { getDiscoverBooks, getSearchSuggestions } from "../../service/APIService";
import "./DiscoverPage.css";

const DEFAULT_SORT = "mostRead";
const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: "mostRead", label: "En çok okunan" },
  { value: "highestRating", label: "En yüksek puan" },
  { value: "mostFavorited", label: "En çok favorilenen" },
  { value: "newest", label: "Yeni eklenen" },
  { value: "yearDesc", label: "Yayın tarihi: yeni → eski" },
  { value: "yearAsc", label: "Yayın tarihi: eski → yeni" },
  { value: "titleAsc", label: "A–Z" },
  { value: "titleDesc", label: "Z–A" },
];

const YEAR_PRESETS = [
  { key: "", label: "Tüm yıllar", yearFrom: "", yearTo: "" },
  { key: "1800s", label: "1800’ler", yearFrom: "1800", yearTo: "1899" },
  { key: "1900-1949", label: "1900–1949", yearFrom: "1900", yearTo: "1949" },
  { key: "1950-1999", label: "1950–1999", yearFrom: "1950", yearTo: "1999" },
  { key: "2000-2009", label: "2000–2009", yearFrom: "2000", yearTo: "2009" },
  { key: "2010-2019", label: "2010–2019", yearFrom: "2010", yearTo: "2019" },
  { key: "2020+", label: "2020+", yearFrom: "2020", yearTo: "" },
];

const PAGE_PRESETS = [
  { key: "", label: "Tüm sayfalar", minPages: "", maxPages: "" },
  { key: "0-150", label: "0–150", minPages: "0", maxPages: "150" },
  { key: "151-300", label: "151–300", minPages: "151", maxPages: "300" },
  { key: "301-500", label: "301–500", minPages: "301", maxPages: "500" },
  { key: "500+", label: "500+", minPages: "501", maxPages: "" },
];

const RATING_OPTIONS = [
  { value: "", label: "Hepsi" },
  { value: "3", label: "3+" },
  { value: "3.5", label: "3,5+" },
  { value: "4", label: "4+" },
  { value: "4.5", label: "4,5+" },
];

const LANG_LABELS = {
  tur: "Türkçe",
  eng: "İngilizce",
  fre: "Fransızca",
  ger: "Almanca",
  spa: "İspanyolca",
  ita: "İtalyanca",
  rus: "Rusça",
  ara: "Arapça",
  por: "Portekizce",
  jpn: "Japonca",
};

const parseBool = (v) => v === "true" || v === "1";

const readStateFromParams = (params) => ({
  q: params.get("q") || "",
  genre: params.get("genre") || "",
  author: params.get("author") || "",
  authorId: params.get("authorId") || "",
  minRating: params.get("minRating") || "",
  yearFrom: params.get("yearFrom") || "",
  yearTo: params.get("yearTo") || "",
  minPages: params.get("minPages") || "",
  maxPages: params.get("maxPages") || "",
  language: params.get("language") || "",
  editorChoice: parseBool(params.get("editorChoice")),
  weeklyPick: parseBool(params.get("weeklyPick")),
  newRelease: parseBool(params.get("newRelease")),
  sort: params.get("sort") || DEFAULT_SORT,
  page: Math.max(0, Number(params.get("page") || 0) || 0),
});

const buildParams = (state) => {
  const next = new URLSearchParams();
  if (state.q?.trim()) next.set("q", state.q.trim());
  if (state.genre) next.set("genre", state.genre);
  if (state.author?.trim()) next.set("author", state.author.trim());
  if (state.authorId) next.set("authorId", String(state.authorId));
  if (state.minRating && Number(state.minRating) > 0) next.set("minRating", String(state.minRating));
  if (state.yearFrom) next.set("yearFrom", String(state.yearFrom));
  if (state.yearTo) next.set("yearTo", String(state.yearTo));
  if (state.minPages) next.set("minPages", String(state.minPages));
  if (state.maxPages) next.set("maxPages", String(state.maxPages));
  if (state.language) next.set("language", state.language);
  if (state.editorChoice) next.set("editorChoice", "true");
  if (state.weeklyPick) next.set("weeklyPick", "true");
  if (state.newRelease) next.set("newRelease", "true");
  if (state.sort && state.sort !== DEFAULT_SORT) next.set("sort", state.sort);
  if (state.page > 0) next.set("page", String(state.page));
  return next;
};

const pageWindow = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = new Set([0, total - 1, current]);
  for (let i = current - 1; i <= current + 1; i += 1) {
    if (i >= 0 && i < total) pages.add(i);
  }
  return Array.from(pages).sort((a, b) => a - b);
};

const yearPresetKey = (from, to) => {
  const hit = YEAR_PRESETS.find((p) => p.yearFrom === String(from || "") && p.yearTo === String(to || ""));
  return hit?.key || (from || to ? "custom" : "");
};

const pagePresetKey = (min, max) => {
  const hit = PAGE_PRESETS.find((p) => p.minPages === String(min || "") && p.maxPages === String(max || ""));
  return hit?.key || (min || max ? "custom" : "");
};

const langLabel = (code) => LANG_LABELS[code] || code?.toUpperCase() || code;

const DiscoverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => readStateFromParams(searchParams), [searchParams]);

  const [draftQ, setDraftQ] = useState(state.q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [authorQuery, setAuthorQuery] = useState("");
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const toolbarRef = useRef(null);
  const catalogRef = useRef(null);
  const abortRef = useRef(null);
  const requestKeyRef = useRef("");
  const authorAbortRef = useRef(null);
  const qDebounceRef = useRef(null);

  useEffect(() => {
    setDraftQ(state.q);
  }, [state.q]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!toolbarRef.current?.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const updateState = useCallback(
    (patch, { resetPage = true } = {}) => {
      const nextState = {
        ...state,
        ...patch,
        page: resetPage && patch.page === undefined ? 0 : patch.page ?? state.page,
      };
      setSearchParams(buildParams(nextState), { replace: false });
    },
    [setSearchParams, state]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: false });
    setDraftQ("");
    setAuthorQuery("");
    setOpenMenu(null);
  }, [setSearchParams]);

  // Debounced search → URL
  useEffect(() => {
    if (draftQ.trim() === (state.q || "").trim()) return undefined;
    if (qDebounceRef.current) clearTimeout(qDebounceRef.current);
    qDebounceRef.current = setTimeout(() => {
      updateState({ q: draftQ.trim() });
    }, 350);
    return () => clearTimeout(qDebounceRef.current);
  }, [draftQ, state.q, updateState]);

  // Author suggestions
  useEffect(() => {
    if (openMenu !== "author") return undefined;
    const q = authorQuery.trim();
    if (authorAbortRef.current) authorAbortRef.current.abort();
    if (q.length < 2) {
      setAuthorSuggestions([]);
      setAuthorLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    authorAbortRef.current = controller;
    setAuthorLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await getSearchSuggestions(q, { signal: controller.signal });
        if (!controller.signal.aborted) setAuthorSuggestions(res?.authors || []);
      } catch (err) {
        if (err?.name !== "AbortError") setAuthorSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setAuthorLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [authorQuery, openMenu]);

  useEffect(() => {
    const key = searchParams.toString();
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    requestKeyRef.current = key;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await getDiscoverBooks(
          {
            q: state.q || undefined,
            genre: state.genre || undefined,
            author: state.authorId ? undefined : state.author || undefined,
            authorId: state.authorId || undefined,
            minRating: state.minRating || undefined,
            yearFrom: state.yearFrom || undefined,
            yearTo: state.yearTo || undefined,
            minPages: state.minPages || undefined,
            maxPages: state.maxPages || undefined,
            language: state.language || undefined,
            editorChoice: state.editorChoice || undefined,
            weeklyPick: state.weeklyPick || undefined,
            newRelease: state.newRelease || undefined,
            sort: state.sort || DEFAULT_SORT,
            page: state.page,
            size: PAGE_SIZE,
          },
          { signal: controller.signal }
        );
        if (requestKeyRef.current !== key || controller.signal.aborted) return;
        setData(payload);
      } catch (err) {
        if (err?.name === "AbortError") return;
        if (requestKeyRef.current !== key) return;
        setError("Kitaplar yüklenemedi.");
      } finally {
        if (requestKeyRef.current === key && !controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [searchParams, state, reloadToken]);

  const chips = useMemo(() => {
    const list = [];
    if (state.genre) list.push({ key: "genre", label: state.genre });
    if (state.authorId || state.author) {
      list.push({ key: "author", label: state.author || `Yazar #${state.authorId}` });
    }
    if (state.yearFrom || state.yearTo) {
      list.push({ key: "year", label: `${state.yearFrom || "…"}–${state.yearTo || "…"}` });
    }
    if (state.minRating) list.push({ key: "minRating", label: `${String(state.minRating).replace(".", ",")}+ puan` });
    if (state.minPages || state.maxPages) {
      list.push({ key: "pages", label: `${state.minPages || "0"}–${state.maxPages || "∞"} sayfa` });
    }
    if (state.language) list.push({ key: "language", label: langLabel(state.language) });
    if (state.editorChoice) list.push({ key: "editorChoice", label: "Editörün Seçimi" });
    if (state.weeklyPick) list.push({ key: "weeklyPick", label: "Haftanın Kitabı" });
    if (state.newRelease) list.push({ key: "newRelease", label: "Yeni Çıkanlar" });
    return list;
  }, [state]);

  const removeChip = (key) => {
    if (key === "year") updateState({ yearFrom: "", yearTo: "" });
    else if (key === "pages") updateState({ minPages: "", maxPages: "" });
    else if (key === "author") updateState({ author: "", authorId: "" });
    else if (key === "editorChoice" || key === "weeklyPick" || key === "newRelease") {
      updateState({ [key]: false });
    } else updateState({ [key]: "" });
  };

  const goPage = (page) => {
    updateState({ page }, { resetPage: false });
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const books = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const availableGenres = data?.availableGenres || [];
  const availableLanguages = data?.availableLanguages || [];
  const pages = pageWindow(state.page, totalPages);
  const yKey = yearPresetKey(state.yearFrom, state.yearTo);
  const pKey = pagePresetKey(state.minPages, state.maxPages);

  const resultLabel = state.q
    ? `“${state.q}” için ${totalElements.toLocaleString("tr-TR")} kitap bulundu`
    : `${totalElements.toLocaleString("tr-TR")} kitap bulundu`;

  const toggleMenu = (id) => setOpenMenu((cur) => (cur === id ? null : id));

  const filterPanel = (
    <div className="discover-filter-panels">
      <label className="discover-field">
        <span>Tür</span>
        <select value={state.genre} onChange={(e) => updateState({ genre: e.target.value })}>
          <option value="">Tümü</option>
          {availableGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>

      <label className="discover-field">
        <span>Yazar</span>
        <input
          type="text"
          value={authorQuery}
          placeholder={state.author || "Yazar ara…"}
          onChange={(e) => setAuthorQuery(e.target.value)}
        />
        {authorLoading && <span className="discover-hint">Aranıyor…</span>}
        {authorSuggestions.length > 0 && (
          <ul className="discover-suggest-list">
            {authorSuggestions.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    updateState({ authorId: String(a.id), author: a.name });
                    setAuthorQuery("");
                    setAuthorSuggestions([]);
                    setFiltersOpen(false);
                  }}
                >
                  {a.name}
                  {a.bookCount > 0 ? ` · ${a.bookCount} kitap` : ""}
                </button>
              </li>
            ))}
          </ul>
        )}
      </label>

      <label className="discover-field">
        <span>Yayın yılı</span>
        <select
          value={yKey === "custom" ? "" : yKey}
          onChange={(e) => {
            const preset = YEAR_PRESETS.find((p) => p.key === e.target.value) || YEAR_PRESETS[0];
            updateState({ yearFrom: preset.yearFrom, yearTo: preset.yearTo });
          }}
        >
          {YEAR_PRESETS.map((p) => (
            <option key={p.key || "all"} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="discover-field">
        <span>Minimum puan</span>
        <select value={state.minRating} onChange={(e) => updateState({ minRating: e.target.value })}>
          {RATING_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="discover-field">
        <span>Sayfa</span>
        <select
          value={pKey === "custom" ? "" : pKey}
          onChange={(e) => {
            const preset = PAGE_PRESETS.find((p) => p.key === e.target.value) || PAGE_PRESETS[0];
            updateState({ minPages: preset.minPages, maxPages: preset.maxPages });
          }}
        >
          {PAGE_PRESETS.map((p) => (
            <option key={p.key || "all"} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      {availableLanguages.length > 0 && (
        <label className="discover-field">
          <span>Dil</span>
          <select value={state.language} onChange={(e) => updateState({ language: e.target.value })}>
            <option value="">Tümü</option>
            {availableLanguages.map((code) => (
              <option key={code} value={code}>
                {langLabel(code)}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="discover-checks">
        <label className="discover-check">
          <input
            type="checkbox"
            checked={state.editorChoice}
            onChange={(e) => updateState({ editorChoice: e.target.checked })}
          />
          Editörün Seçimi
        </label>
        <label className="discover-check">
          <input
            type="checkbox"
            checked={state.weeklyPick}
            onChange={(e) => updateState({ weeklyPick: e.target.checked })}
          />
          Haftanın Kitabı
        </label>
        <label className="discover-check">
          <input
            type="checkbox"
            checked={state.newRelease}
            onChange={(e) => updateState({ newRelease: e.target.checked })}
          />
          Yeni Çıkanlar
        </label>
      </div>

      <button type="button" className="discover-clear-btn" onClick={clearFilters}>
        Filtreleri temizle
      </button>
    </div>
  );

  const menuBtn = (id, label, active) => (
    <button
      type="button"
      className={`discover-tool-btn ${active || openMenu === id ? "is-active" : ""}`}
      onClick={() => toggleMenu(id)}
      aria-expanded={openMenu === id}
    >
      {label} <span aria-hidden="true">▾</span>
    </button>
  );

  return (
    <div className="discover-page">
      <header className="discover-header">
        <h1>Keşfet</h1>
        <p>Kitapları ara, filtrele ve kataloğu keşfet.</p>
      </header>

      <div className="discover-toolbar" ref={toolbarRef}>
        <form
          className="discover-search"
          onSubmit={(e) => {
            e.preventDefault();
            updateState({ q: draftQ.trim() });
          }}
        >
          <input
            type="search"
            value={draftQ}
            placeholder="Kitap veya yazar ara"
            aria-label="Kitap veya yazar ara"
            onChange={(e) => setDraftQ(e.target.value)}
          />
        </form>

        <div className="discover-tools-desktop">
          <div className="discover-tool-wrap">
            {menuBtn("genre", state.genre || "Tür", !!state.genre)}
            {openMenu === "genre" && (
              <div className="discover-menu">
                <button type="button" className={!state.genre ? "is-selected" : ""} onClick={() => { updateState({ genre: "" }); setOpenMenu(null); }}>
                  Tümü
                </button>
                {availableGenres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={state.genre === g ? "is-selected" : ""}
                    onClick={() => { updateState({ genre: g }); setOpenMenu(null); }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="discover-tool-wrap">
            {menuBtn("author", state.author || "Yazar", !!(state.author || state.authorId))}
            {openMenu === "author" && (
              <div className="discover-menu discover-menu--author">
                <input
                  type="text"
                  autoFocus
                  value={authorQuery}
                  placeholder="Yazar ara…"
                  onChange={(e) => setAuthorQuery(e.target.value)}
                />
                {authorLoading && <p className="discover-hint">Aranıyor…</p>}
                {authorSuggestions.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      updateState({ authorId: String(a.id), author: a.name });
                      setAuthorQuery("");
                      setAuthorSuggestions([]);
                      setOpenMenu(null);
                    }}
                  >
                    {a.name}
                  </button>
                ))}
                {(state.author || state.authorId) && (
                  <button
                    type="button"
                    className="discover-menu-clear"
                    onClick={() => {
                      updateState({ author: "", authorId: "" });
                      setOpenMenu(null);
                    }}
                  >
                    Yazarı temizle
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="discover-tool-wrap">
            {menuBtn("year", yKey && yKey !== "custom" ? YEAR_PRESETS.find((p) => p.key === yKey)?.label : state.yearFrom || state.yearTo ? `${state.yearFrom || "…"}–${state.yearTo || "…"}` : "Yıl", !!(state.yearFrom || state.yearTo))}
            {openMenu === "year" && (
              <div className="discover-menu">
                {YEAR_PRESETS.map((p) => (
                  <button
                    key={p.key || "all"}
                    type="button"
                    className={yKey === p.key ? "is-selected" : ""}
                    onClick={() => {
                      updateState({ yearFrom: p.yearFrom, yearTo: p.yearTo });
                      setOpenMenu(null);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="discover-tool-wrap">
            {menuBtn("rating", state.minRating ? `${String(state.minRating).replace(".", ",")}+` : "Puan", !!state.minRating)}
            {openMenu === "rating" && (
              <div className="discover-menu">
                {RATING_OPTIONS.map((o) => (
                  <button
                    key={o.value || "all"}
                    type="button"
                    className={state.minRating === o.value ? "is-selected" : ""}
                    onClick={() => {
                      updateState({ minRating: o.value });
                      setOpenMenu(null);
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="discover-tool-wrap">
            {menuBtn("pages", pKey && pKey !== "custom" ? PAGE_PRESETS.find((p) => p.key === pKey)?.label : state.minPages || state.maxPages ? "Sayfa" : "Sayfa", !!(state.minPages || state.maxPages))}
            {openMenu === "pages" && (
              <div className="discover-menu">
                {PAGE_PRESETS.map((p) => (
                  <button
                    key={p.key || "all"}
                    type="button"
                    className={pKey === p.key ? "is-selected" : ""}
                    onClick={() => {
                      updateState({ minPages: p.minPages, maxPages: p.maxPages });
                      setOpenMenu(null);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {availableLanguages.length > 0 && (
            <div className="discover-tool-wrap">
              {menuBtn("lang", state.language ? langLabel(state.language) : "Dil", !!state.language)}
              {openMenu === "lang" && (
                <div className="discover-menu">
                  <button type="button" className={!state.language ? "is-selected" : ""} onClick={() => { updateState({ language: "" }); setOpenMenu(null); }}>
                    Tümü
                  </button>
                  {availableLanguages.map((code) => (
                    <button
                      key={code}
                      type="button"
                      className={state.language === code ? "is-selected" : ""}
                      onClick={() => { updateState({ language: code }); setOpenMenu(null); }}
                    >
                      {langLabel(code)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="discover-tool-wrap">
            {menuBtn(
              "more",
              "Diğer",
              state.editorChoice || state.weeklyPick || state.newRelease
            )}
            {openMenu === "more" && (
              <div className="discover-menu discover-menu--checks">
                <label>
                  <input
                    type="checkbox"
                    checked={state.editorChoice}
                    onChange={(e) => updateState({ editorChoice: e.target.checked })}
                  />
                  Editörün Seçimi
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={state.weeklyPick}
                    onChange={(e) => updateState({ weeklyPick: e.target.checked })}
                  />
                  Haftanın Kitabı
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={state.newRelease}
                    onChange={(e) => updateState({ newRelease: e.target.checked })}
                  />
                  Yeni Çıkanlar
                </label>
              </div>
            )}
          </div>

          <div className="discover-tool-wrap">
            {menuBtn("sort", SORT_OPTIONS.find((o) => o.value === state.sort)?.label || "Sırala", state.sort !== DEFAULT_SORT)}
            {openMenu === "sort" && (
              <div className="discover-menu">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className={state.sort === o.value ? "is-selected" : ""}
                    onClick={() => {
                      updateState({ sort: o.value });
                      setOpenMenu(null);
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="discover-tools-mobile">
          <button type="button" className="discover-tool-btn" onClick={() => setFiltersOpen(true)}>
            Filtrele {chips.length > 0 ? `(${chips.length})` : ""}
          </button>
          <label className="discover-mobile-sort">
            <span className="sr-only">Sırala</span>
            <select value={state.sort} onChange={(e) => updateState({ sort: e.target.value })}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="discover-chips">
          {chips.map((chip) => (
            <button key={chip.key} type="button" className="discover-chip" onClick={() => removeChip(chip.key)}>
              {chip.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          <button type="button" className="discover-chips-clear" onClick={clearFilters}>
            Tümünü temizle
          </button>
        </div>
      )}

      <div className="discover-result-row" ref={catalogRef}>
        <p className="discover-count">{loading && !data ? "Yükleniyor…" : resultLabel}</p>
      </div>

      {error && (
        <div className="discover-state">
          <p>{error}</p>
          <button type="button" onClick={() => setReloadToken((n) => n + 1)}>
            Tekrar dene
          </button>
        </div>
      )}

      {!error && loading && books.length === 0 && (
        <div className="discover-grid" aria-busy="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="discover-skel" />
          ))}
        </div>
      )}

      {!error && !loading && books.length === 0 && (
        <div className="discover-state">
          <p>Bu filtrelerle kitap bulamadık.</p>
          <span>Filtreleri değiştir veya tümünü temizle.</span>
          <button type="button" onClick={clearFilters}>
            Filtreleri temizle
          </button>
        </div>
      )}

      {!error && books.length > 0 && (
        <>
          <div className={`discover-grid ${loading ? "is-loading" : ""}`}>
            {books.map((book) => (
              <PhotoFrame
                key={book.id}
                book={book}
                showTitle
                showMeta
                showAuthor
                showGhostMenu
                className="discover-cover"
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="discover-pagination" aria-label="Sayfalama">
              <button type="button" disabled={state.page <= 0} onClick={() => goPage(state.page - 1)}>
                Önceki
              </button>
              {pages.map((p, idx) => {
                const prev = pages[idx - 1];
                const showEllipsis = prev != null && p - prev > 1;
                return (
                  <span key={p} className="discover-page-group">
                    {showEllipsis && <span className="discover-ellipsis">…</span>}
                    <button
                      type="button"
                      className={p === state.page ? "active" : ""}
                      onClick={() => goPage(p)}
                      aria-current={p === state.page ? "page" : undefined}
                    >
                      {p + 1}
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                disabled={state.page >= totalPages - 1}
                onClick={() => goPage(state.page + 1)}
              >
                Sonraki
              </button>
            </nav>
          )}
        </>
      )}

      {filtersOpen && (
        <div className="discover-drawer" role="dialog" aria-modal="true" aria-label="Filtreler">
          <button
            type="button"
            className="discover-drawer-backdrop"
            aria-label="Kapat"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="discover-drawer-panel">
            <div className="discover-drawer-head">
              <h2>Filtreler</h2>
              <button type="button" onClick={() => setFiltersOpen(false)}>
                Kapat
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
