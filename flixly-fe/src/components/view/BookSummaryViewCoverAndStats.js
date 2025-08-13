import { useState } from "react";
import "./BookSummaryView.css";
import PhotoFrame from "./../frame/PhotoFrame.js";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";
import { Box, Typography } from "@mui/material";

const BookSummaryViewCoverAndStats = ({ book }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="coverAndStats">
      <PhotoFrame book={book} showTitle={false} showGhostMenu={false} />
      <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
        <FavoriteIcon sx={{ color: "crimson", fontSize: 18 }} />
        <Typography variant="body2">
          {book?.howManyPplLiked ?? 0} kişi beğendi
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, gap: 1 }}>
        <StarIcon sx={{ color: "#ffb400", fontSize: 18 }} />
        <Typography variant="body2">
          {book?.howManyPplFavourited ?? 0} kişi favorilerine ekledi
        </Typography>
      </Box>
    </div>
  );
};

export default BookSummaryViewCoverAndStats;
