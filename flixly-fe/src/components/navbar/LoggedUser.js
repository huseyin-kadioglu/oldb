import React, { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import "./NavigationBar.css";
import Image from "../frame/Image";
import { useNavigate } from "react-router-dom";
import LoggedUserMenuItem from "./LoggedUserItem";

const LoggedUser = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const role = sessionStorage.getItem("userRole");

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
      {token && (
        <div className="logged-user" onClick={handleOpen}>
          <Image className="navbar-img" />
          <div className="user-info">
            <span className="username">Hüseyin</span>
            <span className="user-badge">{role}</span>
          </div>
        </div>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            bgcolor: "var(--color-background)",
            color: "var(--color-text)",
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
            minWidth: 160,
            transition: "all 0.3s ease",
          },
        }}
      >
        <LoggedUserMenuItem
          navigateUrl="/bookContribute"
          value="Kitap Ekle/Düzenle"
        />
        <LoggedUserMenuItem
          navigateUrl="/addAuthor"
          value="Yazar Ekle/Düzenle"
        />

        {role === "admin" &&
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
