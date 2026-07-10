import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Autocomplete,
  Paper,
} from "@mui/material";
import CoverImage from "../ui/CoverImage";

const BookFilter = ({ open, handleDialog, selectedBookHandler, data }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <>
      <Dialog
        open={open}
        onClose={() => handleDialog(false)}
        maxWidth="sm"
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
          }}
        >
          Kitap ara ve seç
          <Button
            onClick={() => handleDialog(false)}
            size="small"
            sx={{
              minWidth: "auto",
              color: "var(--color-text-secondary)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
            }}
          >
            ✕
          </Button>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "var(--color-background-secondary)", pt: 2.5, pb: 3 }}>
          <Autocomplete
            options={data ?? []}
            getOptionLabel={(option) => option?.title ?? ""}
            filterOptions={(options, state) =>
              options.filter((option) => {
                const q = state.inputValue.toLowerCase();
                return (
                  (option?.title ?? "").toLowerCase().includes(q) ||
                  (option?.authorName ?? "").toLowerCase().includes(q) ||
                  (option?.originalTitle ?? "").toLowerCase().includes(q)
                );
              })
            }
            onChange={(event, newValue) => {
              setSearchValue(newValue ? newValue.title : "");
              selectedBookHandler(newValue);
            }}
            PaperComponent={(props) => (
              <Paper
                {...props}
                sx={{
                  backgroundColor: "var(--color-background-card)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--line-color)",
                }}
                elevation={0}
              />
            )}
            ListboxProps={{
              sx: {
                maxHeight: 220,
                "& .MuiAutocomplete-option": {
                  color: "var(--color-text-secondary)",
                },
                "& .MuiAutocomplete-option[aria-selected='true']": {
                  backgroundColor: "rgba(245, 197, 24, 0.12)",
                },
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "var(--line-color)", borderRadius: 3 },
                "&::-webkit-scrollbar-track": { backgroundColor: "var(--color-background)" },
              },
            }}
            renderOption={(props, option) => (
              <li {...props} key={option?.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CoverImage
                  src={option?.coverUrl}
                  alt={option?.title}
                  style={{ width: 36, height: 54, borderRadius: 4, objectFit: "cover", flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: "var(--color-text)" }}>{option?.title}</div>
                  {option?.authorName && (
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      {option.authorName}
                    </div>
                  )}
                </div>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                required
                name="book"
                placeholder="Kitap adı yazın..."
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "var(--color-background-input)",
                    color: "var(--color-text)",
                    borderRadius: "var(--radius-sm)",
                    "& fieldset": { borderColor: "var(--line-color)" },
                    "&:hover fieldset": { borderColor: "var(--color-text-muted)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-primary-button)" },
                  },
                  "& .MuiInputLabel-root": { color: "var(--color-text-muted)" },
                }}
              />
            )}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
export default BookFilter;
