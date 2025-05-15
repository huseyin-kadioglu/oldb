import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoFrame from "../frame/PhotoFrame";
import BookLogActivity from "../BookLogActivity";
import { AccountCircle } from "@mui/icons-material";
import { createUserActivity } from "../../service/APIService";

const SelectedBookDialog = ({ open, selectedBook, selectedBookHandler }) => {
  const [payload, setPayload] = useState({});
  const [loading, setLoading] = useState(true);
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
    <>
      <Dialog
        open={open}
        onClose={() => selectedBookHandler(false)}
        maxWidth="sm"
        fullWidth
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createBookActivity(payload);
            selectedBookHandler(false);
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ddd",
              backgroundColor: "#f0f0f0",
              color: "#333",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            <Button
              onClick={() => selectedBookHandler(false)}
              style={{ minWidth: "auto" }}
            >
              <ArrowBackIcon />
            </Button>
            Kitap için aktivite ekle
            <Button
              onClick={() => selectedBookHandler(false)}
              sx={{
                minWidth: "auto",
                color: "#555",
                fontWeight: "bold",
                fontSize: "1.2rem",
                "&:hover": {
                  color: "#000",
                },
              }}
            >
              ✖
            </Button>
          </DialogTitle>

          <DialogContent>
            <BookLogActivity
              selectedBook={selectedBook}
              setPayload={setPayload}
            />
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};
export default SelectedBookDialog;
