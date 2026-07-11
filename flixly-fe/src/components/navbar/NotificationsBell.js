import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import {
  formatNotificationText,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markNotificationsRead,
} from "../../service/APIService";
import CoverImage from "../ui/CoverImage";
import "./NotificationsBell.css";

const relativeTime = (raw) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}sa`;
  const days = Math.floor(hours / 24);
  if (days < 60) return `${days}g`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

const NotificationsBell = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshUnread = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnread(Number(count) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications(30);
      setItems(Array.isArray(data) ? data : []);
      await refreshUnread();
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [refreshUnread]);

  useEffect(() => {
    refreshUnread();
    const id = setInterval(refreshUnread, 60000);
    return () => clearInterval(id);
  }, [refreshUnread]);

  useEffect(() => {
    if (open) loadList();
  }, [open, loadList]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleOpen = () => setOpen((v) => !v);

  const handleMarkAll = async () => {
    try {
      await markNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  };

  const handleItemClick = async (n) => {
    if (!n.read) {
      try {
        await markNotificationRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
        setUnread((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    if (n.linkPath) navigate(n.linkPath);
  };

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        type="button"
        className="navbar-icon-btn notif-bell-btn"
        onClick={handleOpen}
        aria-label="Bildirimler"
        aria-expanded={open}
      >
        <NotificationsNoneOutlinedIcon />
        {unread > 0 && (
          <span className="notif-badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="menu">
          <div className="notif-panel-head">
            <strong>Bildirimler</strong>
            {unread > 0 && (
              <button type="button" className="notif-mark-all" onClick={handleMarkAll}>
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div className="notif-panel-list">
            {loading && <p className="notif-empty">Yükleniyor…</p>}
            {!loading && items.length === 0 && (
              <p className="notif-empty">Henüz bildirim yok.</p>
            )}
            {!loading &&
              items.map((n) => {
                const text = formatNotificationText(n);
                return (
                  <button
                    type="button"
                    key={n.id}
                    className={`notif-item ${n.read ? "" : "unread"}`}
                    onClick={() => handleItemClick(n)}
                  >
                    <CoverImage
                      src={n.actorAvatarUrl}
                      alt={n.actorUsername}
                      className="notif-avatar"
                      variant="avatar"
                    />
                    <div className="notif-item-body">
                      <p className="notif-text">
                        {text.emphasis ? <strong>{text.emphasis}</strong> : null}
                        {text.rest}
                      </p>
                      <span className="notif-time">{relativeTime(n.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
