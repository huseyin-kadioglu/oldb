import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookLogActivity from "../BookLogActivity";
import { createUserActivity } from "../../service/APIService";

const SelectedBookDialog = ({ open, selectedBook, selectedBookHandler }) => {
  const [payload, setPayload] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBookActivity = async (value) => {
    console.trace("createBookActivity çağrıldı");
    try {
      setLoading(true);
      await createUserActivity(value);
    } catch (err) {
      setError("Aktivite yaratılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={!!open}
      onClose={() => selectedBookHandler(null)}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            createBookActivity(payload);
            selectedBookHandler(null);
          },
          sx: {
            backgroundColor: "var(--color-background-secondary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--line-color)",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--line-color)",
          backgroundColor: "var(--color-background-secondary)",
          color: "var(--color-text)",
          fontWeight: 600,
          fontSize: "1rem",
          py: 1.5,
        }}
      >
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => selectedBookHandler(null)}
          sx={{
            minWidth: "auto",
            color: "var(--color-text-secondary)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
          }}
        >
          Geri
        </Button>
        <Box sx={{ flex: 1, textAlign: "center" }}>Kitap için aktivite ekle</Box>
        <Button
          size="small"
          onClick={() => selectedBookHandler(null)}
          sx={{
            minWidth: "auto",
            color: "var(--color-text-secondary)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
          }}
        >
          ✕
        </Button>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor: "var(--color-background-secondary)",
          color: "var(--color-text-secondary)",
          pt: 2,
          pb: 3,
        }}
      >
        <BookLogActivity selectedBook={selectedBook} setPayload={setPayload} />
        {error && (
          <p style={{ color: "#e57373", marginTop: "1rem", fontSize: "0.9rem" }}>{error}</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectedBookDialog;
