import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import './NavigationBar.css';
import 'font-awesome/css/font-awesome.min.css';


const NavigationBar = ({}) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo">
      <img 
        src="/logo192.png"  
        alt="xxx"
        className="logo"
        onClick={() => navigate("/")} // Clickable logo
      />
      </div>

     <div className="navbar-content">
     <p onClick={() => navigate("/")} className="nav-item">Ana Sayfa</p>
      <p onClick={() => navigate("/profile")} className="nav-item">Profil</p>
      <p onClick={() => navigate("/books")} className="nav-item">Kitaplar</p>
      <p onClick={() => console.log("search books")} className="nav-item"><i className="fa-solid fa-magnifying-glass"></i></p>
      <p onClick={() => console.log("+LOG")} className="nav-item"><i class="fa-solid fa-pen-nib"></i></p>

     </div>
    </nav>
  );
};

export default NavigationBar;