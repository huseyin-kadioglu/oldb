import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { createAuthorContribution } from "../../service/APIService";

const inputSx = {
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255,255,255,0.02)",
    color: "#e6edf3",
  },
  "& label": {
    color: "#9aa8b6",
  },
  "& label.Mui-focused": {
    color: "var(--color-primary-button)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.18)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.35)",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-primary-button)",
  },
};

const AuthorContributeForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [portrait, setPortrait] = useState("");
  const [description, setDescription] = useState("");

  const clearForm = () => {
    setFirstName("");
    setLastName("");
    setBirthYear("");
    setDeathYear("");
    setPortrait("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName) {
      alert("Ad ve soyad zorunludur.");
      return;
    }

    const payload = {
      name: `${firstName} ${lastName}`,
      birthYear,
      deathYear,
      portrait,
      description,
    };

    try {
      await createAuthorContribution(payload);
      clearForm();
      alert("Yazar başarıyla gönderildi.");
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu.");
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6 }}>
      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
          Yeni Yazar Girişi
        </Typography>
        <Typography sx={{ color: "#9aa8b6", mt: 0.5 }}>
          Kütüphaneye yeni bir yazar ekleyerek katkı sağla
        </Typography>
      </Box>

      {/* FORM */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 4,
        }}
      >
        {/* SOL */}
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Box display="flex" gap={2}>
            <TextField
              label="Ad *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              variant="outlined"
              sx={inputSx}
              fullWidth
            />
            <TextField
              label="Soyad *"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              variant="outlined"
              sx={inputSx}
              fullWidth
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              label="Doğum Yılı"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              variant="outlined"
              sx={inputSx}
              fullWidth
            />
            <TextField
              label="Ölüm Yılı"
              type="number"
              value={deathYear}
              onChange={(e) => setDeathYear(e.target.value)}
              variant="outlined"
              sx={inputSx}
              fullWidth
            />
          </Box>

          <TextField
            label="Açıklama"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            sx={inputSx}
          />
        </Box>

        {/* SAĞ */}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Portre Görseli URL"
            value={portrait}
            onChange={(e) => setPortrait(e.target.value)}
            variant="outlined"
            sx={inputSx}
          />

          <Box
            sx={{
              mt: 1,
              height: 260,
              border: "1px dashed rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7785",
            }}
          >
            {portrait ? (
              <img
                src={portrait}
                alt="Portre"
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              "Portre önizleme"
            )}
          </Box>
        </Box>
      </Box>

      {/* FOOTER */}
      <Box
        mt={5}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button
          onClick={clearForm}
          sx={{
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "#c7d1db",
            px: 3,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.12)",
            },
          }}
        >
          Temizle
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            px: 5,
            fontWeight: 700,
            bgcolor: "var(--color-primary-button)",
            color: "#000",
            "&:hover": {
              bgcolor: "var(--color-button-hover)",
            },
          }}
        >
          Katkı Sağla
        </Button>
      </Box>
    </Box>
  );
};

export default AuthorContributeForm;
