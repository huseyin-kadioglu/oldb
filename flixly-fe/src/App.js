import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Content from './components/content/Content';
import Profile from './components/Profile';
const App = () => {
 
return( <div className="App">
    <Router>
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
</div>
);
    
}

export default App;
