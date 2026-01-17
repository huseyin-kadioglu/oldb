import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";

import "./App.css";
import { getBooks } from "./service/APIService";
import Content from "./components/content/Content";
import NavigationBar from "./components/navbar/NavigationBar";
import Profile from "./components/profile/Profile";
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
import SearchView from "./components/pages/SearchView";
import ErrorDialog from "./components/common/ErrorDialog";
import GenericMessageDialog from "./components/common/GenericMessageDialog";

const App = () => {
  const [activityDialog, setActivityDialog] = useState(false);
  const [selectedBookDialog, setSelectedBookDialog] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(null);

  const [token, setToken] = useState(sessionStorage.getItem("token"));

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();

    // axios kullanıyorsan
    // delete axios.defaults.headers.common["Authorization"];

    setToken(null); // 🔥 EN ÖNEMLİ SATIR
  };

  const handleToken = (token) => {
    setToken(token);
    sessionStorage.setItem("token", token);
  };

  const handleDialog = (state) => {
    setActivityDialog(state);
  };

  const selectedBookHandler = (data) => {
    setActivityDialog(false);
    setSelectedBookDialog(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      console.log("App.js | Books are fetched", data);
      setBooks(data?.books);
    } catch (err) {
      setError("Kitaplar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">

      <NavigationBar
        handleDialog={handleDialog}
        token={token}
        onLogout={handleLogout}
        handleToken={handleToken}
        setSuccessDialogOpen={setSuccessDialogOpen}
      />

      <Routes>
        <Route path="/*" element={<Content books={books} token={token} />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/:username" element={<ProfilePage />} />
        <Route path="/books" element={<Books books={books} />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/activities" element={<Activies />} />
        <Route path="/books/year/:publishYear" element={<BooksPublishYear />} />
        <Route
          path="/search/:searchTerm"
          element={<SearchView books={books} />}
        />
        <Route
          path="/book/:bookId"
          element={<BookSummaryView books={books} />}
        />
        <Route path="/author/:authorId" element={<Author />} />
        <Route path="/addAuthor" element={<AuthorContributeForm />} />
        <Route path="/bookContribute" element={<BookContributeForm />} />
        <Route path="/authorApproval" element={<AuthorApproval />} />
        <Route path="/bookApproval" element={<BookApproval />} />
        <Route path="/profileApproval" element={<ProfileApproval />} />
      </Routes>

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
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          title="Aktivasyon Maili Gönderildi"
          message="Lütfen e-posta kutunuzu kontrol ederek hesabınızı aktifleştirin."
        />
      )}
    </div>
  );
};

export default App;
