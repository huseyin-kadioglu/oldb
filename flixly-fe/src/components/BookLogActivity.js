import {
  Box,
  Typography,
  Tooltip,
  Grid,
  Paper,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from "@mui/material";
import "./BookLogActivity.css";
import PhotoFrame from "./frame/PhotoFrame";
import { useState } from "react";
import RatingUtil from "./common/Rating";

import DatePickerUtil from "./common/DatePickerUtil";
import { createUserActivity } from "../service/APIService";
import MinimalMuiDatePicker from "./common/MinimalDatePicker";
import MinimalDatePicker from "./common/MinimalDatePicker";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import BlockIcon from "@mui/icons-material/Block";

const BookLogActivity = ({ selectedBook, setPayload }) => {
  const statusOptions = [
    { value: "READ", label: "Okudum", icon: <MenuBookIcon /> },
    { value: "READLIST", label: "Listeme Ekle", icon: <PlaylistAddIcon /> },
    { value: "FAVOURITE", label: "Favori", icon: <FavoriteIcon /> },
    { value: "DROPPED", label: "Yarım Bıraktım", icon: <BlockIcon /> },
    { value: "HATE", label: "Beğenmedim", icon: <ThumbDownIcon /> },
  ];

  const [activityStatus, setActivityStatus] = useState(null);
  const [rating, setRating] = useState(null);
  const [readDate, setReadDate] = useState(null);
  const [comment, setComment] = useState(null);

  const preparePayload = () => {
    const result = {
      bookId: selectedBook?.id,
      authorId: selectedBook?.authorId,
      status: activityStatus,
      rating: rating,
      readDate: readDate,
      comment: comment,
      actionType: activityStatus,
    };
    setPayload(result);
  };

  return (
    <div className="log-activity" sx={{ m: 2, minWidth: 120 }}>
      <div className="summary">
        <PhotoFrame
          book={selectedBook}
          className={"small-pic"}
          showGhostMenu={false}
        />
      </div>
      <div>
        <FormControl className="add">
          <Box className="status-box">
            <Grid container spacing={1}>
              {statusOptions.map((option) => (
                <Grid item xs={3} sm={3} md={3} key={option.value}>
                  <Tooltip title={option.label}>
                    <Paper
                      elevation={activityStatus === option.value ? 4 : 1}
                      className={`status-option ${
                        activityStatus && activityStatus !== option.value
                          ? "disabled"
                          : ""
                      } ${activityStatus === option.value ? "selected" : ""}`}
                      onClick={() =>
                        activityStatus === option.value
                          ? setActivityStatus(null)
                          : setActivityStatus(option.value)
                      }
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        {option.icon}
                        <Typography variant="body2" mt={1}>
                          {option.label}
                        </Typography>
                      </Box>
                    </Paper>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Box>

          <MinimalDatePicker readDate={readDate} setReadDate={setReadDate} />

          <TextField
            id="outlined-multiline-flexible"
            label="Açıklama"
            multiline
            minRows={4}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />

          <RatingUtil rating={rating} setRating={setRating}></RatingUtil>

          <div className="footer">
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="success"
              onClick={preparePayload}
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
