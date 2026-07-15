import { useLayoutEffect, useRef, useState } from "react";
import "./ExpandableText.css";

/**
 * Letterboxd-style clamp: ~lineCount satır, soft expand/collapse.
 * Kitap özeti ile aynı davranış modeli.
 */
const ExpandableText = ({
  text,
  lineCount = 6,
  className = "",
  moreLabel = "Devamını oku →",
  lessLabel = "Daha az göster",
}) => {
  const innerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [heights, setHeights] = useState({ full: 0, collapsed: 0 });

  useLayoutEffect(() => {
    setOpen(false);
    const el = innerRef.current;
    if (!el || !text) {
      setHeights({ full: 0, collapsed: 0 });
      return;
    }
    const full = el.scrollHeight;
    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 22;
    const collapsed = Math.round(lineHeight * lineCount);
    setHeights({ full, collapsed });
  }, [text, lineCount]);

  if (!text) return null;

  const needsClamp = heights.full > heights.collapsed + 8;
  const maxHeight = !needsClamp
    ? "none"
    : open
      ? `${Math.max(heights.full, heights.collapsed) + 8}px`
      : `${heights.collapsed || 132}px`;

  return (
    <div className={`expandable-text ${className}`.trim()}>
      <div
        className={`expandable-text__collapse ${open || !needsClamp ? "is-open" : ""}`}
        style={{ maxHeight }}
      >
        <div ref={innerRef} className="expandable-text__inner">
          <p className="expandable-text__body">{text}</p>
        </div>
      </div>
      {needsClamp && (
        <button
          type="button"
          className="expandable-text__more"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
