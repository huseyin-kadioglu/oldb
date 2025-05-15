import { Typography, Rating, Box } from "@mui/material";

const RatingUtil = ({ rating, setRating }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        my: 2,
        p: 1.5,
        border: "1px solid #ddd",
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
        transition: "background-color 0.3s",
        "&:hover": {
          backgroundColor: "#f0f0f0",
        },
      }}
    >
      <Typography sx={{ minWidth: 90, fontWeight: 500 }}>
        Kitap Puanı
      </Typography>
      <Rating
        name="half-rating"
        value={rating}
        precision={0.5}
        size="large"
        onChange={(event, newValue) => setRating(newValue)}
        sx={{
          "& .MuiRating-iconFilled": {
            color: "#ffb400",
          },
          "& .MuiRating-iconHover": {
            color: "#ffa726",
          },
        }}
      />
    </Box>
  );
};

export default RatingUtil;
