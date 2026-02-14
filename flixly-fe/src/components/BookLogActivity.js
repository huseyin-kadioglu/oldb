import {
  Box,
  Typography,
  Tooltip,
  Grid,
  Paper,
  Button,
  FormControl,
  TextField,
} from "@mui/material";
import "./BookLogActivity.css";
import PhotoFrame from "./frame/PhotoFrame";
import { useState } from "react";
import RatingUtil from "./common/Rating";
import MinimalDatePicker from "./common/MinimalDatePicker";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import BlockIcon from "@mui/icons-material/Block";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StarIcon from "@mui/icons-material/Star";
import StatusSelector from "./common/StatusSelector";

const BookLogActivity = ({ selectedBook, setPayload }) => {
  const [activityStatus, setActivityStatus] = useState(null);
  const [rating, setRating] = useState(null);
  const [readDate, setReadDate] = useState(null);
  const [comment, setComment] = useState("");

  const clearForm = () => {
    setActivityStatus(null);
    setRating(null);
    setReadDate(null);
    setComment("");
  };

  const preparePayload = () => {
    if (!activityStatus) {
      alert("Lütfen bir durum seçiniz.");
      return;
    }

    const result = {
      bookId: selectedBook?.id,
      authorId: selectedBook?.authorId,
      status: activityStatus,
      rating,
      readDate,
      comment,
      actionType: activityStatus,
    };

    setPayload(result);
    clearForm();
  };

  return (
    <div className="log-activity">
      <div className="summary">
        <PhotoFrame
          book={selectedBook}
          showGhostMenu={false}
          justShowCover={true}
          showTitle={false}
        />
      </div>
      <div>
        <FormControl className="add">
          <div className="status-box">
            <StatusSelector
              value={activityStatus}
              onChange={setActivityStatus}
            />
          </div>
          <MinimalDatePicker readDate={readDate} setReadDate={setReadDate} />
          <TextField
            label="Açıklama (isteğe bağlı)"
            multiline
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Not veya kısa yorum ekleyebilirsiniz."
            InputLabelProps={{ sx: { color: "var(--color-text-muted)" } }}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "var(--color-background-input)",
                color: "var(--color-text)",
                borderRadius: "var(--radius-sm)",
                "& fieldset": { borderColor: "var(--line-color)" },
                "&:hover fieldset": { borderColor: "var(--color-text-muted)" },
                "&.Mui-focused fieldset": { borderColor: "var(--color-primary-button)" },
              },
            }}
          />

          <RatingUtil rating={rating} setRating={setRating} />
          <div className="footer">
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={preparePayload}
              sx={{
                backgroundColor: "var(--color-primary-button)",
                color: "#000",
                "&:hover": {
                  backgroundColor: "var(--color-button-hover)",
                },
              }}
            >
              Kütüphaneye Ekle
            </Button>
          </div>
        </FormControl>
      </div>
    </div>
  );
};

export default BookLogActivity;
