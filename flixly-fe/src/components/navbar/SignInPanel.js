import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { loginAccount } from "../../service/APIService";

const SignInPanel = ({ onClose, handleToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      let response = await loginAccount({
        email: email,
        password: password,
      });

      handleToken(response.token);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  const inputStyles = {
    backgroundColor: "#1e242b",
    input: { color: "#fbc401" },
    label: { color: "#fbc401" },
    "& .MuiOutlinedInput-root": {
      border: "none",
      borderBottom: "2px solid #fbc401",
      borderRadius: 0,
      boxShadow: "0 2px 4px rgba(251, 196, 1, 0.4)",
      transition: "box-shadow 0.3s ease",
    },
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
        sx={{ ...inputStyles, mr: 1.25 }}
        size="small"
        label="E-posta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        sx={{ ...inputStyles, mr: 1.25 }}
        size="small"
        label="Şifre"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        sx={{ mr: 1.25 }}
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
