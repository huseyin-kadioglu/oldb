import {
  Box,
  Button,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import { useEffect, useState } from "react";
import { createBookContribution, getAuthors } from "../../service/APIService";

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

const BookContributeForm = () => {
  const [form, setForm] = useState({
    title: "",
    originalTitle: "",
    authorId: "",
    publicationYear: "",
    description: "",
    pageCount: "",
    publisher: "",
    coverUrl: "",
  });

  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    getAuthors().then(setAuthors);
  }, []);

  const handleChange = (key) => (e) =>
    setForm({ ...form, [key]: e.target.value });

  const clearForm = () => {
    setForm({
      title: "",
      originalTitle: "",
      authorId: "",
      publicationYear: "",
      description: "",
      pageCount: "",
      publisher: "",
      coverUrl: "",
    });
  };

  const handleSubmit = () => {
    if (!form.title || !form.authorId) {
      alert("Kitap adı ve yazar zorunludur.");
      return;
    }
    createBookContribution(form);
    clearForm();
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6 }}>
      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
          Yeni Kitap Girişi
        </Typography>
        <Typography sx={{ color: "#9aa8b6", mt: 0.5 }}>
          Kütüphaneye katkı yaparak contribution puanı kazan
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
          <Autocomplete
            options={authors}
            getOptionLabel={(o) => o.name || ""}
            onChange={(e, v) =>
              setForm({ ...form, authorId: v ? v.id : "" })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Yazar *"
                variant="outlined"
                sx={inputSx}
              />
            )}
          />

          <TextField
            label="Kitap Adı *"
            value={form.title}
            onChange={handleChange("title")}
            variant="outlined"
            sx={inputSx}
          />

          <TextField
            label="Orijinal Başlık"
            value={form.originalTitle}
            onChange={handleChange("originalTitle")}
            variant="outlined"
            sx={inputSx}
          />

          <Box display="flex" gap={2}>
            <TextField
              label="Yayın Yılı"
              type="number"
              value={form.publicationYear}
              onChange={handleChange("publicationYear")}
              variant="outlined"
              sx={inputSx}
              fullWidth
            />
            <TextField
              label="Sayfa Sayısı"
              type="number"
              value={form.pageCount}
              onChange={handleChange("pageCount")}
              variant="outlined"
              sx={inputSx}
              fullWidth
            />
          </Box>

          <TextField
            label="Yayıncı"
            value={form.publisher}
            onChange={handleChange("publisher")}
            variant="outlined"
            sx={inputSx}
          />

          <TextField
            label="Açıklama"
            value={form.description}
            onChange={handleChange("description")}
            multiline
            rows={4}
            variant="outlined"
            sx={inputSx}
          />
        </Box>

        {/* SAĞ */}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Kapak Görseli URL"
            value={form.coverUrl}
            onChange={handleChange("coverUrl")}
            variant="outlined"
            sx={inputSx}
          />

          <Box
            sx={{
              mt: 1,
              height: 240,
              border: "1px dashed rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7785",
            }}
          >
            {form.coverUrl ? (
              <img
                src={form.coverUrl}
                alt="Kapak"
                style={{ maxHeight: "100%", maxWidth: "100%" }}
              />
            ) : (
              "Kapak önizleme"
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

export default BookContributeForm;
