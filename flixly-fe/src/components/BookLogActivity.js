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

const BookLogActivity = ({ selectedBook, setPayload }) => {
  const [usersLibrary, setUsersLibrary] = useState([
    "Read",
    "Favori Listem",
    "Readlist",
  ]);

  console.log("BookLogActivity. selectedBook", selectedBook);

  const [library, setLibrary] = useState(null);
  const [rating, setRating] = useState(null);
  const [readDate, setReadDate] = useState(null);
  const [description, setDescription] = useState(null);

  const preparePayload = () => {
    const result = {
      bookId: selectedBook?.id,
      authorId: selectedBook?.authorId,
      library: library,
      rating: rating,
      readDate: readDate,
      description: description,
    };
    setPayload(result);

    createUserActivity(result);
  };

  return (
    <div className="log-activity" sx={{ m: 2, minWidth: 120 }}>
      <div className="summary">
        <PhotoFrame
          book={selectedBook}
          className={"small-pic"}
        />
      </div>
      <FormControl className="add">
        <InputLabel id="demo-simple-select-helper-label">Library</InputLabel>
        <Select
          value={library}
          label="Library"
          onChange={(e) => setLibrary(e.target.value)}
        >
          {usersLibrary.map((lib) => (
            <MenuItem key={lib} value={lib}>
              {lib}
            </MenuItem>
          ))}
        </Select>

        <DatePickerUtil readDate={readDate} setReadDate={setReadDate} />

        <TextField
          id="outlined-multiline-flexible"
          label="Açıklama"
          multiline
          maxRows={4}
          onChange={(e) => setDescription(e.target.value)}
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
