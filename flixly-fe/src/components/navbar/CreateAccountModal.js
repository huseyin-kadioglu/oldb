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
import { createAccount, extractApiErrorMessage } from "../../service/APIService";
import GenericMessageDialog from "../common/GenericMessageDialog";

const CreateAccountModal = ({ isOpen, onClose, setSuccessDialogOpen }) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername("");
    setFullname("");
    setEmail("");
    setPassword("");
    setPrivacyPolicy(false);
  };

  const handleCreateAccount = async () => {
    if (loading) return;
    if (!username.trim() || !email.trim() || !password) {
      setFeedbackDialog({
        title: "Eksik Bilgi",
        message: "Kullanıcı adı, e-posta ve şifre zorunludur.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createAccount({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        username: username.trim(),
      });

      const isResent = result?.status === "ACTIVATION_RESENT";
      const title = isResent
        ? "Aktivasyon Maili Tekrar Gönderildi"
        : "Aktivasyon Linki Gönderildi";
      const message =
        result?.message ||
        (isResent
          ? `Aktivasyon linki ${email.trim()} adresine tekrar gönderilmiştir. Lütfen e-posta kutunuzu kontrol edin.`
          : `Aktivasyon linki ${email.trim()} adresine gönderilmiştir. Lütfen e-posta kutunuzu kontrol ederek hesabınızı aktifleştirin.`);

      // Parent App dialog — modal unmount olsa bile görünür
      if (typeof setSuccessDialogOpen === "function") {
        setSuccessDialogOpen({ title, message });
      }

      resetForm();
      onClose();
    } catch (error) {
      const code = error.response?.data?.code;
      let title = "Kayıt Başarısız";

      if (code === "EMAIL_ALREADY_ACTIVE") {
        title = "E-posta Zaten Kayıtlı";
      } else if (code === "USERNAME_TAKEN") {
        title = "Kullanıcı Adı Kullanımda";
      }

      setFeedbackDialog({
        title,
        message: extractApiErrorMessage(error, "Hesap oluşturulamadı."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
        <Box
          sx={{
            backgroundColor: "var(--color-background)",
            color: "var(--color-text)",
            p: 2,
          }}
        >
          <DialogTitle>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "var(--color-primary-button)",
                fontWeight: "bold",
                textAlign: "center",
              }}
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
                  color: "var(--color-text)",
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
                  color: "var(--color-text)",
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
                  color: "var(--color-text)",
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
                  color: "var(--color-text)",
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
              disabled={!privacyPolicy || loading}
              sx={{
                backgroundColor: "var(--color-primary-button)",
                color: "var(--color-background)",
                "&:hover": {
                  backgroundColor: "#e0ac00",
                },
                textTransform: "none",
              }}
            >
              {loading ? "Gönderiliyor…" : "Hesap Oluştur"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {feedbackDialog && (
        <GenericMessageDialog
          open={!!feedbackDialog}
          onClose={() => setFeedbackDialog(null)}
          title={feedbackDialog.title}
          message={feedbackDialog.message}
        />
      )}
    </>
  );
};

export default CreateAccountModal;
