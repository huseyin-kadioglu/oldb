import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookLogActivity from "../BookLogActivity";
import { createUserActivity } from "../../service/APIService";
import COPY from "../../copy";

/** Persist exclusive log + optional independent library/shopping flags */
export const persistBookLogPayload = async (payload) => {
  const { alsoLibrary, alsoShopping, ...activity } = payload || {};
  await createUserActivity(activity);

  if (alsoLibrary) {
    await createUserActivity({
      bookId: activity.bookId,
      authorId: activity.authorId,
      status: "LIBRARY",
      actionType: "LIBRARY",
      libraryFormat: activity.libraryFormat || "PHYSICAL",
    });
  }
  if (alsoShopping) {
    await createUserActivity({
      bookId: activity.bookId,
      authorId: activity.authorId,
      status: "SHOPPING",
      actionType: "SHOPPING",
    });
  }
};

const SelectedBookDialog = ({
  open,
  selectedBook,
  selectedBookHandler,
  onSubmitCallback,
  initialExclusive = null,
  initialLibrary = false,
  initialShopping = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      if (onSubmitCallback) {
        await onSubmitCallback(payload);
      } else {
        await persistBookLogPayload(payload);
      }
      selectedBookHandler(null);
    } catch (err) {
      setError(COPY.save.errorGeneric);
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
        <Box sx={{ flex: 1, textAlign: "center" }}>{COPY.save.dialogRootTitle}</Box>
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
        <BookLogActivity
          selectedBook={selectedBook}
          onSubmit={handleSubmit}
          initialExclusive={initialExclusive}
          initialLibrary={initialLibrary}
          initialShopping={initialShopping}
        />
        {loading && (
          <p style={{ color: "var(--color-text-muted)", marginTop: "1rem", fontSize: "0.9rem" }}>
            {COPY.save.submitting}
          </p>
        )}
        {error && (
          <p style={{ color: "#e57373", marginTop: "1rem", fontSize: "0.9rem" }}>{error}</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectedBookDialog;
