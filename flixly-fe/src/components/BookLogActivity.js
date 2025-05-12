import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import "./BookLogActivity.css";
import PhotoFrame from "./frame/PhotoFrame";
import { useState } from "react";
import RatingUtil from "./common/Rating";

import DatePickerUtil from "./common/DatePickerUtil";
import { createUserActivity } from "../service/APIService";
import MinimalMuiDatePicker from "./common/MinimalDatePicker";
import MinimalDatePicker from "./common/MinimalDatePicker";

const BookLogActivity = ({ selectedBook, setPayload }) => {
  const [statusList, setStatusList] = useState([
    "READ",
    "READLIST",
    "FAVOURITE",
    "DROPPED",
    "HATE",
  ]);

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
    };
    setPayload(result);

    createUserActivity(result);
  };

  return (
    <div className="log-activity" sx={{ m: 2, minWidth: 120 }}>
      <div className="summary">
        <PhotoFrame book={selectedBook} className={"small-pic"} />
      </div>
      <FormControl className="add">
        <InputLabel id="demo-simple-select-helper-label">Status</InputLabel>
        <Select
          sx={{ marginTop: "20px" }}
          value={activityStatus}
          label="Library"
          onChange={(e) => setActivityStatus(e.target.value)}
        >
          {statusList.map((lib) => (
            <MenuItem key={lib} value={lib}>
              {lib}
            </MenuItem>
          ))}
        </Select>

        <MinimalDatePicker readDate={readDate} setReadDate={setReadDate} />

        <TextField
          id="outlined-multiline-flexible"
          label="Açıklama"
          multiline
          minRows={4}
          onChange={(e) => setComment(e.target.value)}
        />

        <RatingUtil rating={rating} setRating={setRating}></RatingUtil>

        <div className="footer" style={{ marginTop: "auto" }}>
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
  );
};
export default BookLogActivity;
