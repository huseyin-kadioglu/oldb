import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Content from "./components/content/Content";
import Profile from "./components/profile/Profile";
import NavigationBar from "./components/navbar/NavigationBar";
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
