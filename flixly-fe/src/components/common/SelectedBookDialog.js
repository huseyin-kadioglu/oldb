import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoFrame from "../frame/PhotoFrame";

const SelectedBookDialog = ({ open, selectedBook, selectedBookHandler }) => {
  console.log(selectedBook);
  return (
    <>
      <Dialog
        open={open}
        onClose={() => selectedBookHandler(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const selectedBook = formJson.book;
              console.log("Selected Book:", selectedBook); // Seçilen kitabı burada işleyebilirsiniz
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
          <PhotoFrame
            coverUrl={selectedBook.coverUrl}
            title={selectedBook.title}
          ></PhotoFrame>
          <TextField>Add Review</TextField>
          <Button>SAVE</Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default SelectedBookDialog;
