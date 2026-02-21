import "./Content.css";
import PublicContentPage from "./PublicContentPage";
import FrameBlock from "../common/FrameBlock";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Content = ({ books, token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = sessionStorage.getItem("username");

  // Filter books by editorial flags
  const editorChoice = books?.filter((b) => b.isEditorChoice) || [];
  const weeklyPick = books?.filter((b) => b.isWeeklyPick) || [];
  const newReleases = books?.filter((b) => b.isNewRelease) || [];

  return (
    <div className="page-layout">
      <main className="page-main">
        <div className="container">
          {!token && <PublicContentPage />}
          {newReleases.length > 0 && (
            <FrameBlock books={newReleases.slice(0, 30)} title="Yeni Çıkanlar" />
          )}
          {editorChoice.length > 0 && (
            <FrameBlock books={editorChoice.slice(0, 30)} title="Editörün Seçimi" />
          )}
          {weeklyPick.length > 0 && (
            <FrameBlock books={weeklyPick.slice(0, 30)} title="Haftanın Kitabı" />
          )}
          <FrameBlock books={(books ?? []).slice(0, 50)} title="Popular Books" />
        </div>
      </main>
      <aside className="page-sidebar">
        {editorChoice.length > 0 && (
          <div className="sidebar-block">
            <h3 className="sidebar-title">Editörün Seçimi</h3>
            <p className="sidebar-text">{editorChoice.length} kitap seçildi</p>
          </div>
        )}
        {weeklyPick.length > 0 && (
          <div className="sidebar-block">
            <h3 className="sidebar-title">Haftanın Kitabı</h3>
            <p className="sidebar-text">{weeklyPick.length} kitap seçildi</p>
          </div>
        )}
        {newReleases.length > 0 && (
          <div className="sidebar-block">
            <h3 className="sidebar-title">Yeni Çıkanlar</h3>
            <p className="sidebar-text">{newReleases.length} yeni kitap</p>
          </div>
        )}
      </aside>
    </div>
  );
};
export default Content;
