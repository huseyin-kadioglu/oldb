import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Content from "./components/content/Content";
import NavigationBar from "./components/navbar/NavigationBar";
import Profile from "./components/profile/Profile";
const App = () => {
  return (
    <div className="App">
      <Router>
        <NavigationBar /> {/* Navbar her zaman burada olacak */}
        <Routes>
          <Route path="/" element={<Content />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
