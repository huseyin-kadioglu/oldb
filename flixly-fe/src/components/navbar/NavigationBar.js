import "font-awesome/css/font-awesome.min.css";
import AddIcon from "@mui/icons-material/Add";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";

const NavigationBar = ({ handleDialog }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo">
        <p>LEONARDO</p>
      </div>

      <div className="navbar-content">
        <p onClick={() => navigate("/")} className="nav-item">
          Ana Sayfa
        </p>
        <p onClick={() => navigate("/profile")} className="nav-item">
          Profil
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
      </div>
    </nav>
  );
};

export default NavigationBar;
