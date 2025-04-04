import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";

const SelectedBookDialog = ({ open, book, selectedBookHandler }) => {
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
          > BACK </Button>
          Add to your books
          <Button
            onClick={() => selectedBookHandler(false)}
            style={{ minWidth: "auto" }}
          >
            ✖
          </Button>
        </DialogTitle>
        <DialogContent>
          <p> Seçilen film</p>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default SelectedBookDialog;
