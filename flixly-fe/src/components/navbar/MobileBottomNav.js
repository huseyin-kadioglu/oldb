import { useNavigate, useLocation } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import "./MobileBottomNav.css";

const TABS = [
  { key: "home", label: "Ana Sayfa", path: "/", icon: HomeOutlinedIcon },
  { key: "discover", label: "Keşfet", path: "/discover", icon: ExploreOutlinedIcon },
  { key: "log", label: "Kaydet", path: null, icon: AddRoundedIcon, fab: true },
  { key: "activity", label: "Aktivite", path: "/activities", icon: BoltOutlinedIcon },
  { key: "profile", label: "Profil", path: null, icon: PersonOutlineIcon },
];

const MobileBottomNav = ({ token, onOpenLog, onOpenSignIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = sessionStorage.getItem("username");

  const isActive = (item) => {
    if (item.key === "home") return location.pathname === "/";
    if (item.key === "discover") return location.pathname.startsWith("/discover");
    if (item.key === "activity") return location.pathname.startsWith("/activities");
    if (item.key === "profile") return location.pathname.startsWith("/profile");
    return false;
  };

  const handleClick = (item) => {
    if (item.key === "log") {
      if (token) onOpenLog?.();
      else onOpenSignIn?.();
      return;
    }
    if (item.key === "profile") {
      if (token && username) navigate(`/profile/${username}`);
      else onOpenSignIn?.();
      return;
    }
    navigate(item.path);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobil navigasyon">
      <div className="mobile-bottom-nav-inner">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.key}
              type="button"
              className={`mobile-bottom-nav-item${item.fab ? " is-fab" : ""}${active ? " is-active" : ""}`}
              onClick={() => handleClick(item)}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
            >
              <span className="mobile-bottom-nav-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="mobile-bottom-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
