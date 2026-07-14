import { getTypeMeta } from "./showcaseConstants";
import { VITRINE_COPY } from "./showcaseConstants";

/**
 * Shared premium card chrome for every vitrine type.
 */
const VitrineShell = ({
  type,
  title,
  description,
  showActions,
  busy,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  children,
  className = "",
}) => {
  const meta = getTypeMeta(type);

  return (
    <article className={`ps-vitrine-card ${className}`.trim()}>
      <header className="ps-vitrine-card-head">
        <div className="ps-vitrine-card-labels">
          <span className="ps-type-label">
            <span aria-hidden="true">{meta.icon}</span>
            {meta.label}
          </span>
          {title && <h3 className="ps-vitrine-title">{title}</h3>}
          {description ? <p className="ps-vitrine-desc">{description}</p> : null}
        </div>
        {showActions && (
          <div className="ps-manage-actions" role="toolbar" aria-label="Vitrin yönetimi">
            <button
              type="button"
              className="ps-manage-btn"
              onClick={onMoveUp}
              disabled={busy || !canMoveUp}
              title={VITRINE_COPY.moveUp}
            >
              ↑
            </button>
            <button
              type="button"
              className="ps-manage-btn"
              onClick={onMoveDown}
              disabled={busy || !canMoveDown}
              title={VITRINE_COPY.moveDown}
            >
              ↓
            </button>
            <button type="button" className="ps-manage-btn" onClick={onEdit} disabled={busy}>
              {VITRINE_COPY.edit}
            </button>
            <button
              type="button"
              className="ps-manage-btn ps-manage-btn--danger"
              onClick={onDelete}
              disabled={busy}
            >
              {VITRINE_COPY.delete}
            </button>
          </div>
        )}
      </header>
      <div className="ps-vitrine-card-body">{children}</div>
    </article>
  );
};

export default VitrineShell;
