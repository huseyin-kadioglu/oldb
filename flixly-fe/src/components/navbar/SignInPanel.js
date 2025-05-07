import React, { useState } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";
import { loginAccount } from "../../service/APIService";

const SignInPanel = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("handle login");
    try {
      loginAccount({
        email: email,
        password: password,
      });

      onClose();
    } catch (error) {
      alert(error.message); // Hata mesajını gösteriyoruz
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "60px", // navbar yüksekliği kadar
        display: "flex",
        bgcolor: "#14181c",
        alignItems: "center",
        boxShadow: 3,
        zIndex: 1300,
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      <TextField
        style={{ marginRight: "10px", backgroundColor: "#2c3440" }}
        size="small"
        label="E-posta"
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        style={{ marginRight: "10px", backgroundColor: "#2c3440" }}
        size="small"
        label="Şifre"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        style={{ marginRight: "10px" }}
        variant="contained"
        color="success"
        onClick={handleLogin}
      >
        Giriş Yap
      </Button>

      <Button variant="outlined" color="error" onClick={onClose}>
        Kapat
      </Button>
    </Box>
  );
};

export default SignInPanel;
