import "font-awesome/css/font-awesome.min.css";
import AddIcon from "@mui/icons-material/Add";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import SignInPanel from "./SignInPanel";
import CreateAccountModal from "./CreateAccountModal";
import Image from "../frame/Image";

const NavigationBar = ({ handleDialog, handleToken, token }) => {
  const navigate = useNavigate();

  const [showSignInPanel, setShowSignInPanel] = useState(false);
  const [showCreateAccountPanel, setShowCreateAccountPanel] = useState(false);

  useEffect(() => {}, [token]);

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/logo.png" alt="Readin Logo" className="logo-img" />
      </div>
      <div className="navbar-content">
        {token ? (
          <>
            <p onClick={() => navigate("/profile")} className="nav-item">
              faux
            </p>
          </>
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
        <p onClick={() => console.log("search books")} className="nav-item">
          <i className="fa-solid fa-magnifying-glass"></i>
        </p>
        <p onClick={() => handleDialog(true)} className="nav-item">
          <AddIcon></AddIcon>
        </p>
        {token && (
          <div className="logged-user">
            <Image className="navbar-img" />
            <div className="user-info">
              <span className="username">Hüseyin</span>
              <span className="user-badge">Premium</span>
            </div>
          </div>
        )}

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
