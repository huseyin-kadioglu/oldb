import { Button, TextField } from "@mui/material";
import "./BookLogActivity.css";
import CoverImage from "./ui/CoverImage";
import { useState } from "react";
import RatingUtil from "./common/Rating";
import MinimalDatePicker from "./common/MinimalDatePicker";
import StatusSelector from "./common/StatusSelector";
import COPY from "../copy";

/** Map UI exclusive key → backend status + currentPage */
export const mapExclusiveToPayload = (exclusiveKey) => {
  switch (exclusiveKey) {
    case "READ":
      return { status: "READ", currentPage: null };
    case "WANT":
      return { status: "READLIST", currentPage: 0 };
    case "READING":
      return { status: "READLIST", currentPage: 1 };
    case "DROPPED":
      return { status: "DROPPED", currentPage: null };
    default:
      return null;
  }
};

const BookLogActivity = ({
  selectedBook,
  onSubmit,
  initialExclusive = null,
  initialLibrary = false,
  initialShopping = false,
}) => {
  const [exclusiveKey, setExclusiveKey] = useState(initialExclusive);
  const [libraryChecked, setLibraryChecked] = useState(!!initialLibrary);
  const [shoppingChecked, setShoppingChecked] = useState(!!initialShopping);
  const [libraryFormat, setLibraryFormat] = useState("PHYSICAL");
  const [rating, setRating] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [readDate, setReadDate] = useState(null);
  const [comment, setComment] = useState("");

  const isRead = exclusiveKey === "READ";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exclusiveKey) {
      alert(COPY.save.needStatus);
      return;
    }

    const mapped = mapExclusiveToPayload(exclusiveKey);
    if (!mapped) {
      alert(COPY.save.needStatus);
      return;
    }

    if (isRead && startDate && readDate && readDate.isBefore(startDate, "day")) {
      alert("Bitiş tarihi başlangıçtan önce olamaz.");
      return;
    }

    onSubmit({
      bookId: selectedBook?.id,
      authorId: selectedBook?.authorId,
      status: mapped.status,
      currentPage: mapped.currentPage,
      rating,
      startDate: isRead && startDate ? startDate.format("YYYY-MM-DD") : null,
      readDate: isRead && readDate ? readDate.format("YYYY-MM-DD") : null,
      comment,
      actionType: mapped.status,
      libraryFormat: libraryChecked ? libraryFormat : null,
      alsoLibrary: libraryChecked,
      alsoShopping: shoppingChecked,
    });
  };

  return (
    <form className="log-activity" onSubmit={handleSubmit}>
      <div className="log-book-header">
        <CoverImage
          src={selectedBook?.coverUrl}
          alt={selectedBook?.title}
          className="log-book-cover"
        />
        <div className="log-book-meta">
          <h3 className="log-book-title">{selectedBook?.title}</h3>
          <p className="log-book-author">{selectedBook?.authorName || "—"}</p>
          {selectedBook?.originalTitle && (
            <p className="log-book-original">{selectedBook.originalTitle}</p>
          )}
        </div>
      </div>

      <StatusSelector
        value={exclusiveKey}
        onChange={setExclusiveKey}
        libraryChecked={libraryChecked}
        onLibraryChange={setLibraryChecked}
        shoppingChecked={shoppingChecked}
        onShoppingChange={setShoppingChecked}
        libraryFormat={libraryFormat}
        onLibraryFormatChange={setLibraryFormat}
      />

      {isRead && (
        <div className="log-dates">
          <MinimalDatePicker
            label={COPY.fields.startDateOptional}
            value={startDate}
            onChange={setStartDate}
            maxDate={readDate || undefined}
          />
          <MinimalDatePicker
            label={COPY.fields.readDateOptional}
            value={readDate}
            onChange={setReadDate}
            minDate={startDate || undefined}
          />
          <p className="log-dates-hint">
            İkisi de doluysa okuma temposuna (sayfa/gün) yansır. Boş bırakırsan rafta kalır,
            tempo hesabına girmez.
          </p>
        </div>
      )}

      <div className="log-field">
        <p className="log-field-label">{COPY.fields.noteOptional}</p>
        <TextField
          multiline
          minRows={3}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Not veya kısa yorum ekleyebilirsiniz."
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "var(--color-background-input)",
              color: "var(--color-text)",
              borderRadius: "var(--radius-md)",
              "& fieldset": { borderColor: "var(--color-border-subtle)" },
              "&:hover fieldset": { borderColor: "var(--color-text-muted)" },
              "&.Mui-focused fieldset": { borderColor: "var(--color-primary-button)" },
            },
          }}
        />
      </div>

      <div className="log-field">
        <p className="log-field-label">{COPY.fields.rating}</p>
        <RatingUtil rating={rating} setRating={setRating} />
      </div>

      <div className="log-footer">
        <Button type="submit" fullWidth variant="contained" className="log-submit-btn">
          {COPY.save.submit}
        </Button>
      </div>
    </form>
  );
};

export default BookLogActivity;
