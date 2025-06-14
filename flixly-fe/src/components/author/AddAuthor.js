import React, { useState } from "react";
import { Box, TextField, Button, Typography, Stack } from "@mui/material";

const AddAuthor = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    deathDate: "",
    bio: "",
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // FormData ile backend'e gönderilebilir
    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }

    console.log("Yazar verisi gönderiliyor...", formData);
    // fetch veya axios ile gönderilebilir
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 3,
        bgcolor: "#1e242b",
        borderRadius: 2,
        color: "#fff",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Yazar Ekle
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Adı"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          fullWidth
          InputLabelProps={{ style: { color: "#ccc" } }}
          sx={{ input: { color: "#fff" } }}
        />
        <TextField
          label="Soyadı"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          fullWidth
          InputLabelProps={{ style: { color: "#ccc" } }}
          sx={{ input: { color: "#fff" } }}
        />
        <TextField
          label="Doğum Tarihi"
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true, style: { color: "#ccc" } }}
          sx={{ input: { color: "#fff" } }}
        />
        <TextField
          label="Ölüm Tarihi"
          type="date"
          name="deathDate"
          value={formData.deathDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true, style: { color: "#ccc" } }}
          sx={{ input: { color: "#fff" } }}
        />
        <TextField
          label="Açıklama"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          InputLabelProps={{ style: { color: "#ccc" } }}
          sx={{ textarea: { color: "#fff" } }}
        />
        <Button variant="contained" component="label">
          Fotoğraf Yükle
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </Button>
        {photoPreview && (
          <Box
            component="img"
            src={photoPreview}
            alt="Önizleme"
            sx={{ width: 120, mt: 1, borderRadius: 2 }}
          />
        )}
        <Button type="submit" variant="contained" color="success">
          Yazar Ekle
        </Button>
      </Stack>
    </Box>
  );
};

export default AddAuthor;
