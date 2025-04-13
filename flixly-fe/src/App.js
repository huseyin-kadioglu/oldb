import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";

import "./App.css";
import { getBooks, createUserActivity } from "./service/APIService";
import Content from "./components/content/Content";
import NavigationBar from "./components/navbar/NavigationBar";
import Profile from "./components/profile/Profile";
import Books from "./components/books/Books";
import AddActivity from "./components/common/AddActivity";
import SelectedBookDialog from "./components/common/SelectedBookDialog";
import Author from "./components/Author";
import BookSummaryView from "./components/view/BookSummaryView";

const App = () => {
  const [activityDialog, setActivityDialog] = useState(false);
  const [selectedBookDialog, setSelectedBookDialog] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const data = await getBooks(); // Servis çağrısı
      setBooks(data);
    } catch (err) {
      setError("Kitaplar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const createBookActivity = (value) => {
    try {
      console.log(
        "CREATING USER ACTIVITY. INTEGRATION COMPLETED. BACKEND IN PROGRESS."
      );
      console.log(value);
      // TODO: BOOK_ID, USER_ID bilgisinin gönderilmesi gerekiyor. BOOK_ID'den zaten yazara erişebilir.
      //createUserActivity(value);
    } catch (err) {
      setError("Aktivite yaratılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <NavigationBar handleDialog={handleDialog} />
      <Routes>
        <Route path="/*" element={<Content />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/books" element={<Books />} />
        <Route path="/book/:bookId" element={<BookSummaryView />} />
        <Route path="/author/:authorId" element={<Author />} />
      </Routes>

      {activityDialog && (
        <AddActivity
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
          createBookActivity={createBookActivity}
        />
      )}
    </div>
  );
};

export default App;
