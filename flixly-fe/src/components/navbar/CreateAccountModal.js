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
  Divider,
} from "@mui/material";
import { createAccount } from "../../service/APIService";

const CreateAccountModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState(false);

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
      alert(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ backgroundColor: "var(--color-background)", color: "#fff", p: 2 }}>
        <DialogTitle>
          <Typography
            variant="h6"
            sx={{ color: "var(--color-primary-button)", fontWeight: "bold", textAlign: "center" }}
          >
            Hesap Oluştur
          </Typography>
        </DialogTitle>

        <Divider sx={{ backgroundColor: "#444", mb: 2 }} />

        <DialogContent>
          <TextField
            label="Kullanıcı Adı"
            fullWidth
            margin="dense"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            InputLabelProps={{ style: { color: "#ccc" } }}
            InputProps={{
              style: {
                color: "#fff",
                backgroundColor: "#2b3138",
                borderRadius: 4,
              },
            }}
          />
          <TextField
            label="Adınız Soyadınız"
            fullWidth
            margin="dense"
            value={fullName}
            onChange={(e) => setFullname(e.target.value)}
            variant="outlined"
            InputLabelProps={{ style: { color: "#ccc" } }}
            InputProps={{
              style: {
                color: "#fff",
                backgroundColor: "#2b3138",
                borderRadius: 4,
              },
            }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            InputLabelProps={{ style: { color: "#ccc" } }}
            InputProps={{
              style: {
                color: "#fff",
                backgroundColor: "#2b3138",
                borderRadius: 4,
              },
            }}
          />
          <TextField
            label="Şifre"
            type="password"
            fullWidth
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            InputLabelProps={{ style: { color: "#ccc" } }}
            InputProps={{
              style: {
                color: "#fff",
                backgroundColor: "#2b3138",
                borderRadius: 4,
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.checked)}
                sx={{
                  color: "var(--color-primary-button)",
                  "&.Mui-checked": {
                    color: "var(--color-primary-button)",
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: "#ccc", fontSize: 14 }}>
                Gizlilik Politikasını okudum
              </Typography>
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: "var(--color-primary-button)",
              color: "var(--color-primary-button)",
              "&:hover": {
                backgroundColor: "var(--color-primary-button)",
                color: "var(--color-background)",
              },
              textTransform: "none",
            }}
          >
            Kapat
          </Button>
          <Button
            onClick={handleCreateAccount}
            variant="contained"
            disabled={!privacyPolicy}
            sx={{
              backgroundColor: "var(--color-primary-button)",
              color: "var(--color-background)",
              "&:hover": {
                backgroundColor: "#e0ac00",
              },
              textTransform: "none",
            }}
          >
            Hesap Oluştur
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateAccountModal;
