import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";

const AddActivity = ({ open, handleDialog, selectedBookHandler, data }) => {
  const [searchValue, setSearchValue] = useState("");

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
              handleDialog(false);
            },
          },
          sx: {
            backgroundColor: "#f9f9f9", // Açık gri örneği (dilersen hex, rgb, theme kullanabilirsin)
          },
        }}
      >
        <DialogTitle
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid lightgray",
            backgroundColor: "#f9f9f9", // Açık gri örneği (dilersen hex, rgb, theme kullanabilirsin)
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
            options={data}
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
              selectedBookHandler(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                required
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
export default AddActivity;
