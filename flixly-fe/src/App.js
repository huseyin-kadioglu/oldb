import { Route, Routes, useLocation } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";

import "./App.css";
import { getBooks } from "./service/APIService";
import Content from "./components/content/Content";
import NavigationBar from "./components/navbar/NavigationBar";
import ProfilePage from "./components/profile/ProfilPage";
import Books from "./components/books/Books";
import BookFilter from "./components/common/BookFilter";
import SelectedBookDialog from "./components/common/SelectedBookDialog";
import Author from "./components/author/Author";
import BookSummaryView from "./components/view/BookSummaryView";
import BooksPublishYear from "./components/books/BooksPublishYear";
import Activies from "./components/content/Activities";
import AuthorContributeForm from "./components/author/AuthorContributeForm";
import AuthorApproval from "./components/pages/AuthorApproval";
import BookApproval from "./components/pages/BookApproval";
import ProfileApproval from "./components/pages/ProfileApproval";
import BookContributeForm from "./components/pages/BookContributeForm";
import SettingsView from "./components/profile/SettingsView";
import ProfileListPage from "./components/profile/ProfileListPage";
import SearchView from "./components/pages/SearchView";
import BadgesPage from "./components/pages/BadgesPage";
import BookOfTheMonth from "./components/pages/BookOfTheMonth";
import ErrorDialog from "./components/common/ErrorDialog";
import GenericMessageDialog from "./components/common/GenericMessageDialog";

const needsCatalogPath = (path) =>
  path.startsWith("/books") ||
  path.startsWith("/search") ||
  path.startsWith("/book/") ||
  path.startsWith("/profile/");

const App = () => {
  const location = useLocation();
  const [activityDialog, setActivityDialog] = useState(false);
  const [selectedBookDialog, setSelectedBookDialog] = useState(null);
  const [books, setBooks] = useState([]);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setToken(null);
  };

  const handleToken = (nextToken) => {
    setToken(nextToken);
    sessionStorage.setItem("token", nextToken);
  };

  const handleDialog = (state) => {
    setActivityDialog(state);
  };

  const selectedBookHandler = (data) => {
    setActivityDialog(false);
    setSelectedBookDialog(data);
  };

  const ensureBooks = useCallback(async () => {
    if (booksLoaded || booksLoading) return;
    setBooksLoading(true);
    try {
      const data = await getBooks();
      setBooks(data?.books || []);
      setBooksLoaded(true);
    } catch (err) {
      setError("Kitaplar yüklenirken bir hata oluştu.");
    } finally {
      setBooksLoading(false);
    }
  }, [booksLoaded, booksLoading]);

  useEffect(() => {
    if (needsCatalogPath(location.pathname)) {
      ensureBooks();
    }
  }, [location.pathname, ensureBooks]);

  useEffect(() => {
    if (activityDialog) {
      ensureBooks();
    }
  }, [activityDialog, ensureBooks]);

  return (
    <div className="App">
      <NavigationBar
        handleDialog={handleDialog}
        token={token}
        onLogout={handleLogout}
        handleToken={handleToken}
        setSuccessDialogOpen={setSuccessDialogOpen}
      />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Content token={token} />} />
          <Route path="/profile/:username" element={<ProfilePage books={books} />} />
          <Route path="/profile/:username/list/:listType" element={<ProfileListPage />} />
          <Route path="/book-of-the-month" element={<BookOfTheMonth />} />
          <Route path="/books" element={<Books books={books} />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/activities" element={<Activies />} />
          <Route path="/books/year/:publishYear" element={<BooksPublishYear />} />
          <Route path="/search/:searchTerm" element={<SearchView books={books} />} />
          <Route path="/book/:bookId" element={<BookSummaryView books={books} />} />
          <Route path="/author/:authorId" element={<Author />} />
          <Route path="/addAuthor" element={<AuthorContributeForm />} />
          <Route path="/bookContribute" element={<BookContributeForm />} />
          <Route path="/authorApproval" element={<AuthorApproval />} />
          <Route path="/bookApproval" element={<BookApproval />} />
          <Route path="/profileApproval" element={<ProfileApproval />} />
        </Routes>
      </div>

      {activityDialog && (
        <BookFilter
          open={activityDialog}
          handleDialog={handleDialog}
          selectedBookHandler={selectedBookHandler}
          data={books}
        />
      )}

      {selectedBookDialog && (
        <SelectedBookDialog
          open={selectedBookDialog}
          selectedBookHandler={selectedBookHandler}
          selectedBook={selectedBookDialog}
          data={books}
        />
      )}

      {error && (
        <ErrorDialog
          open={!!error}
          errorMessage={error}
          handleClose={() => setError(null)}
        />
      )}

      {successDialogOpen && (
        <GenericMessageDialog
          open={!!successDialogOpen}
          onClose={() => setSuccessDialogOpen(null)}
          title={
            typeof successDialogOpen === "object"
              ? successDialogOpen.title
              : "Aktivasyon Linki Gönderildi"
          }
          message={
            typeof successDialogOpen === "object"
              ? successDialogOpen.message
              : typeof successDialogOpen === "string"
                ? successDialogOpen
                : "Aktivasyon linki mail adresinize gönderilmiştir. Lütfen e-posta kutunuzu kontrol ederek hesabınızı aktifleştirin."
          }
        />
      )}
    </div>
  );
};

export default App;
