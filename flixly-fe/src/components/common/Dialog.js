import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";

const DialogUtil = ({ open, handleDialog, selectedBookHandler }) => {
  const [searchValue, setSearchValue] = useState("");

  const books = [
    { title: "The Great Gatsby" },
    { title: "Moby Dick" },
    { title: "1984" },
    { title: "To Kill a Mockingbird" },
    { title: "Pride and Prejudice" },
    { title: "The Catcher in the Rye" },
    { title: "The Hobbit" },
    // Diğer kitaplar burada
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={() => handleDialog(false)}
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
              handleDialog(false);
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
          Add to your books
          <Button
            onClick={() => handleDialog(false)}
            style={{ minWidth: "auto" }}
          >
            ✖
          </Button>
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            options={books}
            getOptionLabel={(option) => option.title}
            filterOptions={(options, state) =>
              options.filter((option) =>
                option.title
                  .toLowerCase()
                  .includes(state.inputValue.toLowerCase())
              )
            }
            onChange={(event, newValue) => {
              setSearchValue(newValue ? newValue.title : "");
              console.log("onChange");
              console.log(event);
              console.log(newValue);
              selectedBookHandler(event);
            }}
            //onSelect={(event, newValue) => selectedBookHandler(event)}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                required
                defaultValue="Search for book..."
                margin="dense"
                name="book"
                label="Search for books"
                type="text"
                variant="standard"
              />
            )}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
export default DialogUtil;
