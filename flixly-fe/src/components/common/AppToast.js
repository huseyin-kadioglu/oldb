import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AppToast.css";

const AppToast = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer;
    const onToast = (e) => {
      const detail = e.detail || {};
      setToast(detail);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), detail.duration || 3200);
    };
    window.addEventListener("oldb:toast", onToast);
    return () => {
      window.removeEventListener("oldb:toast", onToast);
      clearTimeout(timer);
    };
  }, []);

  if (!toast?.message) return null;

  return (
    <div className="app-toast" role="status">
      <span className="app-toast-msg">{toast.message}</span>
      {toast.actionHref && toast.actionLabel && (
        <Link to={toast.actionHref} className="app-toast-action" onClick={() => setToast(null)}>
          {toast.actionLabel}
        </Link>
      )}
      <button type="button" className="app-toast-close" onClick={() => setToast(null)} aria-label="Kapat">
        ×
      </button>
    </div>
  );
};

export default AppToast;
