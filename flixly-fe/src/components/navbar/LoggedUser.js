import React, { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import TimelineIcon from "@mui/icons-material/Timeline";
import "./NavigationBar.css";
import { useNavigate } from "react-router-dom";
import LoggedUserMenuItem from "./LoggedUserItem";
import InitialAvatar from "../common/InitialAvatar";

const LoggedUser = ({ onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const role = sessionStorage.getItem("userRole");
  const username = sessionStorage.getItem("username");

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const adminMenuItems = [
    {
      key: "profileApproval",
      url: "/profileApproval",
      label: "Kullanıcıları Yönet",
    },
    {
      key: "authorApproval",
      url: "/authorApproval",
      label: "Yazar Onay Ekranı",
    },
    {
      key: "bookApproval",
      url: "/bookApproval",
      label: "Kitap Onay Ekranı",
    },
  ];

  return (
    <>
      <div className="logged-user" onClick={handleOpen}>
        <InitialAvatar name={username} navbarImg={true} />
        <div className="navbar-user-info">
          <span className="username">{username}</span>
          <span className="user-badge">{role}</span>
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            bgcolor: "var(--color-background-card)",
            color: "var(--color-text)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--line-color)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            minWidth: 200,
            py: 0.5,
            "& .MuiMenuItem-root": {
              fontSize: "13px",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
            },
          },
        }}
      >
        <LoggedUserMenuItem
          navigateUrl={`/profile/${username}`}
          value="Profilim"
        />
        <MenuItem
          onClick={() => { handleClose(); navigate("/activities"); }}
          sx={{ fontSize: "13px", "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" } }}
        >
          <TimelineIcon sx={{ fontSize: 18, mr: 1, color: "var(--color-text-muted)" }} />
          Aktiviteler
        </MenuItem>
        <LoggedUserMenuItem
          navigateUrl="/bookContribute"
          value="Kitap Ekle/Düzenle"
        />
        <LoggedUserMenuItem
          navigateUrl="/addAuthor"
          value="Yazar Ekle/Düzenle"
        />

        {role === "ADMIN" &&
          adminMenuItems.map((item) => (
            <LoggedUserMenuItem
              key={item.key}
              navigateUrl={item.url}
              value={item.label}
            />
          ))}

        <MenuItem
          onClick={handleLogout}
          sx={{ gap: 1, color: "var(--color-primary-button)" }}
        >
          <LogoutIcon fontSize="small" />
          Çıkış Yap
        </MenuItem>
      </Menu>
    </>
  );
};

export default LoggedUser;
