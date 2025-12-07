import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material"; // Kapat butonu için ikon
import { loginAccount } from "../../service/APIService";

const SignInPanel = ({ onClose, handleToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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


  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "60px", // Navbar yüksekliği
        display: "flex",
        // Letterboxd'a yakın daha koyu, az belirgin arkaplan
        bgcolor: "#1c2128",
        alignItems: "center",
        boxShadow: 3,
        zIndex: 1300,
        paddingLeft: "20px",
        paddingRight: "10px", // Kapat butonu sağa yaslanacak
        gap: "10px", // Elemanlar arası boşluk
      }}
    >
      {/* TextField'ları daha az yer kaplayacak şekilde "small" yerine "medium"
        size'ı kullanıp padding'i kendim ayarladım.
      */}
      <TextField
        sx={{ ...inputStyles, width: "160px" }} // Genişliği belirledim
        size="small"
        label="E-posta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        sx={{ ...inputStyles, width: "120px" }} // Daha küçük genişlik
        size="small"
        label="Şifre"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Minimalist Giriş Butonu */}
      <Button
        variant="contained"
        // Ana Letterboxd yeşilini kullanmak için 'primary' yerine sx içinde rengi belirledim
        sx={{
            bgcolor: "var(--color-primary-button)", // Letterboxd'un yeşiline yakın bir ana renk
            color: "black", // Koyu buton üzerinde siyah yazı
            "&:hover": {
                bgcolor: "#fbc401", // Hafif bir hover rengi
            },
            boxShadow: "none", // Minimalizm için gölgeyi kaldırdım
            textTransform: "uppercase", // Metni büyük harf yap
            fontWeight: "bold",
            padding: "6px 16px" // Buton boyutunu küçült
        }}
        onClick={handleLogin}
      >
        Giriş Yap
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