import "font-awesome/css/font-awesome.min.css";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import SignInPanel from "./SignInPanel";
import CreateAccountModal from "./CreateAccountModal";
import LoggedUser from "./LoggedUser";

const NavigationBar = ({ handleDialog, handleToken, token, onLogout }) => {
  const navigate = useNavigate();

  const [showSignInPanel, setShowSignInPanel] = useState(false);
  const [showCreateAccountPanel, setShowCreateAccountPanel] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {}, [token]);

  const username = sessionStorage.getItem("username");

  return (
    <nav className="navbar">
      <div className="logo"></div>
      <div className="navbar-content">
        {token ? (
          <></>
        ) : (
          <>
            <p onClick={() => setShowSignInPanel(true)} className="nav-item">
              Giriş yap
            </p>
            <p
              onClick={() => setShowCreateAccountPanel(true)}
              className="nav-item"
            >
              Hesap oluştur
            </p>
          </>
        )}

        <p onClick={() => navigate("/")} className="nav-item">
          Ana Sayfa
        </p>

        <p onClick={() => navigate("/books")} className="nav-item">
          Kitaplar
        </p>
   <p className="nav-item search-wrapper">
  <input
    type="text"
    className={`search-input ${showSearch ? "visible" : ""}`}
    placeholder="Kitap ara..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && searchTerm.trim()) {
        navigate(`/search/${encodeURIComponent(searchTerm)}`);
        setShowSearch(false);
      }
    }}
  />
  <i
    className="fa-solid fa-magnifying-glass search-icon"
    onClick={() => setShowSearch(!showSearch)}
  ></i>
</p>
        <p onClick={() => handleDialog(true)} className="nav-item">
          <button className="nav-add-btn">+ LOG</button>
        </p>
        {token && <LoggedUser token={token} onLogout={onLogout} />}

        {showSignInPanel && (
          <SignInPanel
            isOpen={showSignInPanel}
            onClose={() => setShowSignInPanel(false)}
            handleToken={handleToken}
          />
        )}
        {showCreateAccountPanel && (
          <CreateAccountModal
            isOpen={showCreateAccountPanel}
            onClose={() => setShowCreateAccountPanel(false)}
          />
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
