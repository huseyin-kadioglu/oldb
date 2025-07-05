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

const App = () => {
  const [activityDialog, setActivityDialog] = useState(false);
  const [selectedBookDialog, setSelectedBookDialog] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

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

  // İlk açılışta token'ı çek
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const onLogout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
  };

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
        handleToken={handleToken}
        onLogout={onLogout}
      />
      <Routes>
        <Route path="/*" element={<Content books={books} token={token} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/:username" element={<ProfilePage />} />
        <Route path="/books" element={<Books books={books} />} />
        <Route path="/activities" element={<Activies />} />
        <Route path="/books/year/:publishYear" element={<BooksPublishYear />} />
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
    </div>
  );
};

export default App;
