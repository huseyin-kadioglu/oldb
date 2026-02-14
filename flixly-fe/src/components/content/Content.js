import "./Content.css";
import PublicContentPage from "./PublicContentPage";
import FrameBlock from "../common/FrameBlock";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Content = ({ books, token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = sessionStorage.getItem("username");

  return (
    <div className="page-layout">
      <main className="page-main">
        <div className="container">
          {!token && <PublicContentPage />}
          <FrameBlock books={(books ?? []).slice(0, 50)} title="Popular Books" />
        </div>
      </main>
      <aside className="page-sidebar">
        <div className="sidebar-block">
          <h3 className="sidebar-title">Editörün Seçimi</h3>
          <p className="sidebar-text">Bu hafta editörlerimizin öne çıkardığı kitaplar burada.</p>
        </div>
        <div className="sidebar-block">
          <h3 className="sidebar-title">Haftanın Kitabı</h3>
          <p className="sidebar-text">Her hafta bir kitap öne çıkarılıyor.</p>
        </div>
        <div className="sidebar-block">
          <h3 className="sidebar-title">Kullanıcılara Notlar</h3>
          <p className="sidebar-text">Duyurular ve ipuçları için bu alanı takip edin.</p>
        </div>
      </aside>
    </div>
  );
};
export default Content;
