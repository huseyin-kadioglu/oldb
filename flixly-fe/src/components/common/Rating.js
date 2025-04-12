import { Rating, Typography } from "@mui/material";

const RatingUtil = ({ rating, setRating }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        marginTop: "10px",
      }}
    >
      <Typography sx={{ minWidth: 50 }} component="legend">
        Kitap Puanı:
      </Typography>
      <Rating
        name="simple-controlled"
        value={rating}
        onChange={(event, newValue) => {
          setRating(newValue);
        }}
      />
    </div>
  );
};
export default RatingUtil;
