import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import "./NavigationBar.css";
import SignInPanel from "./SignInPanel";
import CreateAccountModal from "./CreateAccountModal";
import LoggedUser from "./LoggedUser";
import NotificationsBell from "./NotificationsBell";
import NavbarSearch from "./NavbarSearch";
import COPY from "../../copy";

const NAV_ITEMS = [
  { key: "home", label: "Ana Sayfa", path: "/", icon: HomeOutlinedIcon },
  { key: "discover", label: "Keşfet", path: "/discover", icon: ExploreOutlinedIcon },
  { key: "activity", label: COPY.nav.activity, path: "/activities", icon: BoltOutlinedIcon },
  { key: "profile", label: "Profil", path: null, icon: PersonOutlineIcon },
  { key: "badges", label: "Rozetler", path: "/badges", icon: EmojiEventsOutlinedIcon },
];

const NavigationBar = ({
  handleDialog,
  handleToken,
  token,
  onLogout,
  setSuccessDialogOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = sessionStorage.getItem("username");

  const [showSignInPanel, setShowSignInPanel] = useState(false);
  const [showCreateAccountPanel, setShowCreateAccountPanel] = useState(false);

  useEffect(() => {
    if (location.pathname === "/signup") {
      setShowCreateAccountPanel(true);
    }
    if (location.pathname === "/signin") {
      setShowSignInPanel(true);
    }
  }, [location.pathname]);

  const handleCloseCreateAccount = () => {
    setShowCreateAccountPanel(false);
    if (location.pathname === "/signup") {
      navigate("/");
    }
  };

  const handleCloseSignIn = () => {
    setShowSignInPanel(false);
    if (location.pathname === "/signin") {
      navigate("/");
    }
  };

  const isActive = (item) => {
    if (item.key === "home") {
      return location.pathname === "/";
    }
    if (item.key === "discover") {
      return location.pathname.startsWith("/discover");
    }
    if (item.key === "profile") {
      return location.pathname.startsWith("/profile");
    }
    if (item.key === "badges") {
      return location.pathname.startsWith("/badges");
    }
    if (item.key === "activity") {
      return location.pathname.startsWith("/activities");
    }
    return false;
  };

  const handleNavClick = (item) => {
    if (item.key === "profile") {
      if (token && username) {
        navigate(`/profile/${username}`);
      } else {
        setShowSignInPanel(true);
      }
      return;
    }
    navigate(item.path);
  };

  return (
    <>
      <nav className="navbar" aria-label="Ana navigasyon">
        <div className="navbar-inner">
          <div className="navbar-zone navbar-zone-logo">
            <button
              type="button"
              className="navbar-logo"
              onClick={() => navigate("/")}
              aria-label="OLDB — Online Library Database"
              title="Online Library Database"
            >
              <MenuBookOutlinedIcon className="navbar-logo-icon" />
              <span className="navbar-logo-text">OLDB</span>
            </button>
          </div>

          <div className="navbar-zone navbar-zone-center">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`navbar-link ${active ? "active" : ""}`}
                  onClick={() => handleNavClick(item)}
                >
                  <Icon className="navbar-link-icon" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="navbar-zone navbar-zone-actions">
            <NavbarSearch />

            {!token ? (
              <div className="navbar-auth-guest">
                <button
                  type="button"
                  className="navbar-text-btn"
                  onClick={() => setShowSignInPanel(true)}
                >
                  Giriş
                </button>
                <button
                  type="button"
                  className="navbar-cta-btn"
                  onClick={() => setShowCreateAccountPanel(true)}
                >
                  Kaydol
                </button>
              </div>
            ) : (
              <div className="navbar-auth-user">
                <NotificationsBell />
                <LoggedUser onLogout={onLogout} />
                <button
                  type="button"
                  className="navbar-log-btn"
                  onClick={() => handleDialog(true)}
                  aria-label={COPY.nav.saveBookAria}
                >
                  {COPY.nav.saveBook}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="navbar-spacer" aria-hidden="true" />

      {showSignInPanel && (
        <SignInPanel
          isOpen={showSignInPanel}
          onClose={handleCloseSignIn}
          handleToken={handleToken}
        />
      )}
      {showCreateAccountPanel && (
        <CreateAccountModal
          isOpen={showCreateAccountPanel}
          onClose={handleCloseCreateAccount}
          setSuccessDialogOpen={setSuccessDialogOpen}
        />
      )}
    </>
  );
};

export default NavigationBar;
