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

const BookLogActivity = ({ selectedBook }) => {
  const [usersLibrary, setUsersLibrary] = useState([
    "library1",
    "lib2",
    "classics",
  ]);

  const [library, setLibrary] = useState();
  const [rating, setRating] = useState();

  const handleChange = (value) => {
    setLibrary(value);
  };

  return (
    <div className="log-activity" sx={{ m: 2, minWidth: 120 }}>
      <div className="summary">
        <PhotoFrame
          coverUrl={selectedBook.coverUrl}
          title={selectedBook.title}
          className={"small-pic"}
        />
      </div>
      <div className="add">
        <FormControl sx={{ m: 2, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-helper-label">Library</InputLabel>
          <Select value={library} label="Library" onChange={handleChange}>
            {usersLibrary.map((lib) => (
              <MenuItem key={lib} value={lib}>
                {lib}
              </MenuItem>
            ))}
          </Select>

          <RatingUtil rating={rating} setRating={setRating}></RatingUtil>
        </FormControl>

        <div className="footer" style={{ marginTop: "auto" }}>
          <Button fullWidth variant="contained" color="success">
            Kütüphaneye Ekle
          </Button>
        </div>
      </div>
    </div>
  );
};
export default BookLogActivity;
