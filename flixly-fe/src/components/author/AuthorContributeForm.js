import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { createAuthorContribution } from "../../service/APIService";

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
      alert("Lütfen ad ve soyad giriniz.");
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
      console.error("Yazar gönderilemedi:", err);
      alert("Yazar gönderilirken bir hata oluştu.");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 480,
        mx: "auto",
        my: 5,
        p: 3,
        backgroundColor: "#2a2f38",
        borderRadius: 2,
        fontFamily: "'Graphik-Light-Web', sans-serif",
        boxShadow: "0 0 12px rgba(0, 0, 0, 0.6)",
      }}
    >
      <Typography
        variant="h6"
        align="center"
        gutterBottom
        sx={{ color: "var(--color-primary-button)", mb: 3, fontWeight: 700 }}
      >
        Yeni Yazar Ekle
      </Typography>

      <TextField
        label="Ad *"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        fullWidth
        size="small"
        margin="normal"
        variant="filled"
        InputProps={{
          sx: {
            backgroundColor: "var(--color-background)",
            color: "#eee",
            borderRadius: 1,
          },
        }}
        InputLabelProps={{
          sx: { color: "#aaa", fontWeight: 500 },
        }}
      />

      <TextField
        label="Soyad *"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        fullWidth
        size="small"
        margin="normal"
        variant="filled"
        InputProps={{
          sx: {
            backgroundColor: "var(--color-background)",
            color: "#eee",
            borderRadius: 1,
          },
        }}
        InputLabelProps={{ sx: { color: "#aaa", fontWeight: 500 } }}
      />

      <TextField
        label="Doğum Yılı"
        type="number"
        value={birthYear}
        onChange={(e) => setBirthYear(e.target.value)}
        fullWidth
        size="small"
        margin="normal"
        variant="filled"
        InputProps={{
          sx: {
            backgroundColor: "var(--color-background)",
            color: "#eee",
            borderRadius: 1,
          },
        }}
        InputLabelProps={{ sx: { color: "#aaa", fontWeight: 500 } }}
      />

      <TextField
        label="Ölüm Yılı"
        type="number"
        value={deathYear}
        onChange={(e) => setDeathYear(e.target.value)}
        fullWidth
        size="small"
        margin="normal"
        variant="filled"
        InputProps={{
          sx: {
            backgroundColor: "var(--color-background)",
            color: "#eee",
            borderRadius: 1,
          },
        }}
        InputLabelProps={{ sx: { color: "#aaa", fontWeight: 500 } }}
      />

      <TextField
        label="Portre Görseli URL"
        value={portrait}
        onChange={(e) => setPortrait(e.target.value)}
        fullWidth
        size="small"
        margin="normal"
        variant="filled"
        InputProps={{
          sx: {
            backgroundColor: "var(--color-background)",
            color: "#eee",
            borderRadius: 1,
          },
        }}
        InputLabelProps={{ sx: { color: "#aaa", fontWeight: 500 } }}
      />

      {portrait && (
        <Box mt={2} display="flex" justifyContent="center">
          <img
            src={portrait}
            alt="Portre"
            style={{ maxWidth: "100px", maxHeight: "140px", borderRadius: "4px" }}
          />
        </Box>
      )}

      <TextField
        label="Açıklama"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={3}
        fullWidth
        margin="normal"
        variant="filled"
        InputProps={{
          sx: {
            backgroundColor: "var(--color-background)",
            color: "#eee",
            borderRadius: 1,
          },
        }}
        InputLabelProps={{ sx: { color: "#aaa", fontWeight: 500 } }}
      />

      <Box mt={3} display="flex" justifyContent="space-between" gap={2}>
        <Button
          onClick={clearForm}
          variant="outlined"
          sx={{
            color: "var(--color-primary-button)",
            borderColor: "var(--color-primary-button)",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            flex: 1,
            "&:hover": {
              backgroundColor: "rgba(251, 196, 1, 0.15)",
              borderColor: "var(--color-primary-button)",
            },
          }}
        >
          Temizle
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "var(--color-primary-button)",
            color: "var(--color-background)",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            flex: 1,
            "&:hover": {
              bgcolor: "#d4af37",
            },
          }}
        >
          Ekle
        </Button>
      </Box>
    </Box>
  );
};

export default AuthorContributeForm;
