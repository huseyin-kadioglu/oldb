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

const SelectedBookDialog = ({
  open,
  selectedBook,
  selectedBookHandler,
  createBookActivity,
}) => {
  const [payload, setPayload] = useState({});

  return (
    <>
      <Dialog
        open={open}
        onClose={() => selectedBookHandler(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          },
          paper: {
            component: "form",
            onSubmit: (event, value) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const selectedBook = formJson.book;
              createBookActivity(payload);
              selectedBookHandler(false);
            },
          },
        }}
      >
        <DialogTitle
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid lightgray",
          }}
        >
          <Button
            onClick={() => console.log("BACK!")}
            style={{ minWidth: "auto" }}
          >
            <ArrowBackIcon />
          </Button>
          Add to your books
          <Button
            onClick={() => selectedBookHandler(false)}
            style={{ minWidth: "auto" }}
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
      </Dialog>
    </>
  );
};
export default SelectedBookDialog;
