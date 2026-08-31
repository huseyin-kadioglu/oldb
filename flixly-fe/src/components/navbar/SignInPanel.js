import React, { useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, TextField, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { extractApiErrorMessage, loginAccount } from "../../service/APIService";
import COPY from "../../copy";
import { showToast } from "../../utils/uiEvents";
import { getRememberMePreference } from "../../utils/authSession";

const SignInPanel = ({ onClose, handleToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(getRememberMePreference);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Minimalist TextField Stili
  // Letterboxd'un koyu temasına uygun, minimal, sadece arkaplanla ayrılan bir stil.
  const inputStyles = {
    // Koyu arkaplan üzerinde hafifçe farklı bir arkaplan rengi
    backgroundColor: "#22272e",
    borderRadius: "4px",

    // Gerekli minimal renk ayarları
    input: {
        color: "white",
        padding: "8px 12px", // Giriş alanının iç boşluğunu küçülttüm
    },
    label: {
        color: "#a0a0a0", // Soluk gri etiket
        transform: 'translate(12px, 9px) scale(1)' // Etiketi küçültülmüş padding'e göre ayarlama
    },
    // Etiket odaklandığında/içi dolduğunda stil ayarı
    "& .MuiInputLabel-shrink": {
        transform: 'translate(12px, -6px) scale(0.75)',
    },

    // Varsayılan Material UI border ve outline'ları kaldırıldı
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
          borderColor: "transparent", // Çerçeveyi kaldır
      },
      "&:hover fieldset": {
          borderColor: "#505050", // Hafif bir hover efekti
      },
      "&.Mui-focused fieldset": {
          borderColor: "var(--color-primary-button)", // Odaklanınca ana renk
          borderWidth: "1px",
      },
      padding: 0, // Dış boşluğu sıfırla
    },
  };

  const handleLogin = async () => {
    if (loading) return;
    setError("");
    if (!email.trim() || !password) {
      setError("E-posta ve şifre gerekli.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginAccount({
        email: email.trim(),
        password,
        rememberMe,
      });

      handleToken(response.token);
      showToast(COPY.toast.loginOk);
      onClose();
    } catch (err) {
      setError(extractApiErrorMessage(err, "E-posta veya şifre hatalı."));
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "auto",
        minHeight: "60px",
        display: "flex",
        flexWrap: "wrap",
        bgcolor: "#1c2128",
        alignItems: "center",
        boxShadow: 3,
        zIndex: 1300,
        paddingLeft: "20px",
        paddingRight: "10px",
        paddingTop: "8px",
        paddingBottom: "8px",
        gap: "10px",
      }}
    >
      {/* TextField'ları daha az yer kaplayacak şekilde "small" yerine "medium"
        size'ı kullanıp padding'i kendim ayarladım.
      */}
      <TextField
        sx={{ ...inputStyles, width: "160px" }}
        size="small"
        label="E-posta"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />
      <TextField
        sx={{ ...inputStyles, width: "120px" }}
        size="small"
        label="Şifre"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (error) setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      {error && (
        <Typography
          sx={{
            color: "#e57373",
            fontSize: "0.75rem",
            maxWidth: 180,
            lineHeight: 1.3,
            whiteSpace: "normal",
          }}
        >
          {error}
        </Typography>
      )}

      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            sx={{
              color: "#a0a0a0",
              p: 0.5,
              "&.Mui-checked": { color: "var(--color-primary-button)" },
            }}
          />
        }
        label={COPY.auth.rememberMe}
        sx={{
          mr: 0,
          color: "#a0a0a0",
          "& .MuiFormControlLabel-label": { fontSize: "0.75rem", whiteSpace: "nowrap" },
        }}
      />

      <Button
        variant="contained"
        disabled={loading}
        sx={{
            bgcolor: "var(--color-primary-button)",
            color: "black",
            "&:hover": {
                bgcolor: "#fbc401",
            },
            boxShadow: "none",
            textTransform: "uppercase",
            fontWeight: "bold",
            padding: "6px 16px",
        }}
        onClick={handleLogin}
      >
        {loading ? "…" : "Giriş Yap"}
      </Button>

      {/* Minimal Kapat Butonu (Sadece İkon) */}
      <Button
        color="inherit"
        onClick={onClose}
        sx={{
            minWidth: "40px", // İkon için küçük bir alan
            color: "#a0a0a0",
            "&:hover": {
                bgcolor: "transparent",
                color: "white"
            }
        }}
      >
        <CloseIcon />
      </Button>
    </Box>
  );
};

export default SignInPanel;