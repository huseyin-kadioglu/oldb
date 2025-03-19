import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import NavigationBar from './NavigationBar';
import './Content.css'


const Profile = () => {

    const navigate = useNavigate();
  
    return (
      <div className="container">
        <NavigationBar />

        <h1>Hakkında Sayfası</h1>
        <p onClick={() => navigate("/")} className="nav-item">
          Ana Sayfa'ya Git
        </p>
      </div>
    );
}; export default Profile;