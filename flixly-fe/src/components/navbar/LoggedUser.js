import React, { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import "./NavigationBar.css";
import Image from "../frame/Image";

const LoggedUser = ({ token, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout(); // Token temizleme, yönlendirme vs.
  };

  return (
    <>
      {token && (
        <div className="logged-user" onClick={handleOpen}>
          <Image className="navbar-img" />
          <div className="user-info">
            <span className="username">Hüseyin</span>
            <span className="user-badge">Premium</span>
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
            bgcolor: "#1e242b",
            color: "#fff",
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
            minWidth: 160,
            transition: "all 0.3s ease",
          },
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ gap: 1, color: "#fbc401" }}>
          <LogoutIcon fontSize="small" />
          Çıkış Yap
        </MenuItem>
      </Menu>
    </>
  );
};

export default LoggedUser;
