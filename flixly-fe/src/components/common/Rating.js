import { Typography, Rating, Box } from "@mui/material";

const RatingUtil = ({ rating, setRating }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        my: 2,
        p: 2,
        border: "1px solid #444",
        borderRadius: 3,
        backgroundColor: "#2a2a2a",
        transition: "background-color 0.3s",
        "&:hover": {
          backgroundColor: "var(----color-input-background)",
        },
      }}
    >
      <Typography
        sx={{
          minWidth: 110,
          fontWeight: 600,
          color: "var(--color-primary-button)",
          userSelect: "none",
        }}
      >
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
            color: "var(--color-primary-button)",
          },
          "& .MuiRating-iconHover": {
            color: "#ffcb42",
          },
          "& .MuiRating-iconEmpty": {
            color: "#555",
          },
        }}
      />
    </Box>
  );
};

export default RatingUtil;
