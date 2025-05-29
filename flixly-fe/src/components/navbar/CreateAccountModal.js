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
      <Box sx={{ backgroundColor: "#1e242b", color: "#fff", p: 2 }}>
        <DialogTitle>
          <Typography
            variant="h6"
            sx={{ color: "#fbc401", fontWeight: "bold", textAlign: "center" }}
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
                  color: "#fbc401",
                  "&.Mui-checked": {
                    color: "#fbc401",
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
              borderColor: "#fbc401",
              color: "#fbc401",
              "&:hover": {
                backgroundColor: "#fbc401",
                color: "#1e242b",
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
              backgroundColor: "#fbc401",
              color: "#1e242b",
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
