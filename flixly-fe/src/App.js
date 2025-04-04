import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";

import "./App.css";
import Content from "./components/content/Content";
import NavigationBar from "./components/navbar/NavigationBar";
import Profile from "./components/profile/Profile";
import Books from "./components/books/Books";
import DialogUtil from "./components/common/Dialog";
import SelectedBookDialog from "./components/common/SelectedBookDialog";

const App = () => {
  const [activityDialog, setActivityDialog] = useState(false);
  const [selectedBookDialog, setSelectedBookDialog] = useState(false);

  const handleDialog = (state) => {
    setActivityDialog(state);
  };

  const selectedBookHandler = (event) => {
    setActivityDialog(false);
    setSelectedBookDialog(event);
  };

  return (
    <div className="App">
      <Router>
        <NavigationBar handleDialog={handleDialog} />
        <Routes>
          <Route path="/" element={<Content />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/books" element={<Books />} />
        </Routes>
      </Router>
      {activityDialog && (
        <DialogUtil
          open={activityDialog}
          handleDialog={handleDialog}
          selectedBookHandler={selectedBookHandler}
        />
      )}

      {selectedBookDialog && (
        <SelectedBookDialog
          open={selectedBookDialog}
          selectedBookHandler={selectedBookHandler}
        />
      )}
    </div>
  );
};

export default App;
