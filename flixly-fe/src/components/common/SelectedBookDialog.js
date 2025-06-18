import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
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
      open={open}
      onClose={() => selectedBookHandler(false)}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            createBookActivity(payload);
            selectedBookHandler(false);
          },
          sx: {
            backgroundColor: "var(--color-background)",
            color: "#7d7d7d",
            padding: 2,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #444",
          backgroundColor: "var(--color-background)",
          color: "#a1883e",
          fontWeight: "bold",
        }}
      >
        <Button
          onClick={() => selectedBookHandler(false)}
          sx={{
            minWidth: "auto",
            color: "#a1883e",
            fontSize: "1.2rem",
            "&:hover": {
              backgroundColor: "rgba(161,136,62,0.15)",
            },
          }}
        >
          <ArrowBackIcon />
        </Button>
        Kitap için aktivite ekle
        <Button
          onClick={() => selectedBookHandler(false)}
          sx={{
            minWidth: "auto",
            color: "#a1883e",
            fontSize: "1.2rem",
            "&:hover": {
              backgroundColor: "rgba(161,136,62,0.15)",
            },
          }}
        >
          ✖
        </Button>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor: "var(--color-background)",
          color: "#7d7d7d",
          pt: 2,
          pb: 3,
        }}
      >
        <BookLogActivity selectedBook={selectedBook} setPayload={setPayload} />
        {error && (
          <p style={{ color: "#ff6b6b", marginTop: "1rem" }}>{error}</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectedBookDialog;
