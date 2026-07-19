import { useEffect, useMemo, useRef, useState } from "react";
import { getReadCheckins } from "../../service/APIService";
import "./ReadingHeatmap.css";

const RANGES = [
  { id: "week", label: "Hafta" },
  { id: "month", label: "Ay" },
  { id: "year", label: "Yıl" },
];

const DAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const DAY_MIN = ["P", "S", "Ç", "P", "C", "C", "P"];

const dateToIso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseIso = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/** Monday-based weekday index 0=Mon … 6=Sun */
const mondayIndex = (date) => (date.getDay() + 6) % 7;

const formatDayTitle = (iso, active) => {
  const d = parseIso(iso);
  const label = d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return active ? `${label} — Okuma yapıldı` : `${label} — Kayıt yok`;
};

const buildWeekCells = (fromIso, toIso, activeSet) => {
  const from = parseIso(fromIso);
  const to = parseIso(toIso);
  const cells = [];
  for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
    const iso = dateToIso(d);
    cells.push({
      iso,
      active: activeSet.has(iso),
      label: DAY_SHORT[mondayIndex(d)],
    });
  }
  return cells;
};

const buildMonthWeeks = (fromIso, toIso, activeSet) => {
  const from = parseIso(fromIso);
  const to = parseIso(toIso);
  const start = addDays(from, -mondayIndex(from));
  const endPad = 6 - mondayIndex(to);
  const end = addDays(to, endPad);
  const weeks = [];
  let week = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const iso = dateToIso(d);
    const inRange = d >= from && d <= to;
    week.push({
      iso,
      active: inRange && activeSet.has(iso),
      muted: !inRange,
    });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  return weeks;
};

const buildYearColumns = (fromIso, toIso, activeSet) => {
  const from = parseIso(fromIso);
  const to = parseIso(toIso);
  const columns = [];
  for (let weekStart = new Date(from); weekStart <= to; weekStart = addDays(weekStart, 7)) {
    const col = [];
    for (let i = 0; i < 7; i += 1) {
      const d = addDays(weekStart, i);
      const iso = dateToIso(d);
      const inRange = d >= from && d <= to;
      col.push({
        iso,
        active: inRange && activeSet.has(iso),
        muted: !inRange,
        weekday: i,
      });
    }
    columns.push(col);
  }
  return columns;
};

const Cell = ({ iso, active, muted, size = "md" }) => (
  <div
    className={`rh-cell rh-cell--${size}${active ? " is-active" : ""}${muted ? " is-muted" : ""}`}
    title={muted ? undefined : formatDayTitle(iso, active)}
    aria-label={muted ? undefined : formatDayTitle(iso, active)}
  />
);

const ReadingHeatmap = ({ username }) => {
  const [range, setRange] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const yearScrollRef = useRef(null);

  useEffect(() => {
    if (!username) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getReadCheckins(username, range, { signal: controller.signal })
      .then((payload) => {
        if (!controller.signal.aborted) setData(payload);
      })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        if (!controller.signal.aborted) {
          setError("Okuma serisi yüklenemedi.");
          setData(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [username, range]);

  const activeSet = useMemo(() => new Set(data?.dates || []), [data]);

  const weekCells = useMemo(() => {
    if (!data?.from || !data?.to || range !== "week") return [];
    return buildWeekCells(data.from, data.to, activeSet);
  }, [data, range, activeSet]);

  const monthWeeks = useMemo(() => {
    if (!data?.from || !data?.to || range !== "month") return [];
    return buildMonthWeeks(data.from, data.to, activeSet);
  }, [data, range, activeSet]);

  const yearColumns = useMemo(() => {
    if (!data?.from || !data?.to || range !== "year") return [];
    return buildYearColumns(data.from, data.to, activeSet);
  }, [data, range, activeSet]);

  // In the narrow sidebar the year strip overflows; show the latest weeks first.
  useEffect(() => {
    if (range !== "year" || loading) return;
    const el = yearScrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [range, loading, data]);

  const streak = data?.readingStreak ?? 0;
  const total = data?.totalDays ?? 0;

  return (
    <div className="sidebar-block sidebar-block--soft rh">
      <div className="sidebar-title-row rh-title-row">
        <h3 className="sidebar-title">Okuma serisi</h3>
        {streak > 0 && <span className="rh-streak">{streak} gün</span>}
      </div>

      <div className="rh-segments" role="tablist" aria-label="Zaman aralığı">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={range === r.id}
            className={`rh-seg${range === r.id ? " is-active" : ""}`}
            onClick={() => setRange(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rh-skel" aria-busy="true">
          {Array.from({ length: range === "week" ? 7 : 35 }).map((_, i) => (
            <div key={i} className="rh-skel-cell" />
          ))}
        </div>
      )}

      {error && !loading && <p className="rh-empty">{error}</p>}

      {!loading && !error && data && total === 0 && (
        <p className="rh-empty">Henüz günlük okuma kaydı yok.</p>
      )}

      {!loading && !error && data && (
        <>
          {range === "week" && (
            <div className="rh-week">
              {weekCells.map((c) => (
                <div key={c.iso} className="rh-week-item">
                  <Cell iso={c.iso} active={c.active} size="fluid" />
                  <span className="rh-week-label">{c.label}</span>
                </div>
              ))}
            </div>
          )}

          {range === "month" && (
            <div className="rh-month">
              <div className="rh-month-labels">
                {DAY_MIN.map((d, i) => (
                  <span key={`${d}-${i}`}>{d}</span>
                ))}
              </div>
              {monthWeeks.map((week, wi) => (
                <div key={wi} className="rh-month-row">
                  {week.map((c) => (
                    <Cell key={c.iso} iso={c.iso} active={c.active} muted={c.muted} size="fluid" />
                  ))}
                </div>
              ))}
            </div>
          )}

          {range === "year" && (
            <div className="rh-year-wrap" ref={yearScrollRef}>
              <div className="rh-year">
                {yearColumns.map((col, ci) => (
                  <div key={ci} className="rh-year-col">
                    {col.map((cell) => (
                      <Cell
                        key={`${ci}-${cell.weekday}-${cell.iso}`}
                        iso={cell.iso}
                        active={cell.active}
                        muted={cell.muted}
                        size="sm"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {total > 0 && <p className="rh-summary">Bu aralıkta {total} gün okuma yapıldı.</p>}
        </>
      )}
    </div>
  );
};

export default ReadingHeatmap;
