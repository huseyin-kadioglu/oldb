import React, { useState } from "react";
import { Menu, MenuItem, Divider } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import TimelineIcon from "@mui/icons-material/Timeline";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./NavigationBar.css";
import { useNavigate } from "react-router-dom";
import LoggedUserMenuItem from "./LoggedUserItem";
import InitialAvatar from "../common/InitialAvatar";
import { UserDisplayName } from "../common/ProVerifiedBadge";
import { isAdminRole, isStaffRole } from "../../service/APIService";

const LoggedUser = ({ onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const role = sessionStorage.getItem("userRole");
  const username = sessionStorage.getItem("username");
  const avatarUrl = sessionStorage.getItem("avatarUrl");
  const showAdminPanel = isAdminRole(role);
  const showModTools = isStaffRole(role);

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
    { key: "bookApproval", url: "/bookApproval", label: "Kitap Onayla" },
    { key: "authorApproval", url: "/authorApproval", label: "Yazar Onayla" },
    { key: "profileApproval", url: "/profileApproval", label: "Kullanıcıları Yönet" },
  ];

  return (
    <>
      <button type="button" className="logged-user" onClick={handleOpen} aria-haspopup="menu">
        <InitialAvatar name={username} src={avatarUrl} navbarImg />
        <UserDisplayName
          name={(username || "").toUpperCase()}
          role={role}
          badgeSize="sm"
          className="navbar-username"
        />
        <KeyboardArrowDownIcon className="navbar-user-chevron" fontSize="small" />
      </button>

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
          onClose={handleClose}
        />
        <MenuItem
          onClick={() => { handleClose(); navigate("/activities"); }}
          sx={{ fontSize: "13px", "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" } }}
        >
          <TimelineIcon sx={{ fontSize: 18, mr: 1, color: "var(--color-text-muted)" }} />
          Aktiviteler
        </MenuItem>
        <LoggedUserMenuItem
          navigateUrl="/settings"
          value="Ayarlar"
          onClose={handleClose}
        />
        <LoggedUserMenuItem
          navigateUrl="/bookContribute"
          value="Kitap Ekle/Düzenle"
          onClose={handleClose}
        />
        <LoggedUserMenuItem
          navigateUrl="/addAuthor"
          value="Yazar Ekle/Düzenle"
          onClose={handleClose}
        />

        {showModTools && (
          <>
            <Divider sx={{ my: 0.5, bgcolor: "rgba(255,255,255,0.1)" }} />
            <MenuItem disabled sx={{ fontSize: "11px", color: "var(--color-text-muted)", py: 0.5 }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 14, mr: 1 }} />
              {showAdminPanel ? "Admin Paneli" : "Moderasyon"}
            </MenuItem>
            {adminMenuItems
              .filter((item) => showAdminPanel || item.key !== "profileApproval")
              .map((item) => (
              <LoggedUserMenuItem
                key={item.key}
                navigateUrl={item.url}
                value={item.label}
                onClose={handleClose}
              />
            ))}
          </>
        )}

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
