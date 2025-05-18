import React, { useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
} from "@mui/material";
import { createAccount } from "../../service/APIService";

const CreateAccountModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  console.log("CreateAccountModal");

  const handleCreateAccount = () => {
    try {
      createAccount({
        email: email,
        password: password,
        fullName: username,
        username: username,
      });

      onClose();
    } catch (error) {
      alert(error.message); // Hata mesajını gösteriyoruz
    }
  };
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Giriş Yap</DialogTitle>
      <DialogContent>
        <TextField
          label="Kullanıcı Adı"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Adınız Soyadınız"
          fullWidth
          margin="normal"
          value={fullName}
          onChange={(e) => setFullname(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Şifre"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.target.checked)}
              color="primary"
            />
          }
          label="Gizlilik Politikasını Okudum"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="outlined">
          Kapat
        </Button>
        <Button
          onClick={handleCreateAccount}
          color="success"
          variant="contained"
        >
          Hesap Oluştur
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAccountModal;
