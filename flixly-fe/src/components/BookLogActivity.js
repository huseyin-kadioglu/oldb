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
            label="Açıklama"
            multiline
            minRows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{
              style: {
                color: "#fff",
                backgroundColor: "transparent",
                fontFamily: "'Comic Neue', cursive, sans-serif",
                fontWeight: 400,
                fontSize: "1rem",
                borderRadius: 6,
                border: "1px solid rgba(255, 255, 255, 0.3)", // hafif beyaz sınır
                padding: "10px", // iç boşluk ekleyebiliriz, bazen lazım oluyor
              },
            }}
            sx={{ mt: 2 }}
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
