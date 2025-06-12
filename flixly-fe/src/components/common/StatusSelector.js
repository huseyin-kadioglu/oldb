import { Box, IconButton, Tooltip } from "@mui/material";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";

const statusOptions = [
  { value: "READ", icon: <MenuBookIcon />, label: "Okundu" },
  { value: "READLIST", icon: <BookmarkAddedIcon />, label: "Okuma Listesi" },
  { value: "FAVOURITE", icon: <FavoriteIcon />, label: "Favori" },
  { value: "DROPPED", icon: <DoNotDisturbAltIcon />, label: "Bırakıldı" },
  { value: "HATE", icon: <ThumbDownIcon />, label: "Beğenilmedi" },
];
const StatusSelector = ({ value, onChange }) => {
  return (
    <Box display="flex" gap={2} p={2} borderRadius={2}>
      {statusOptions.map((option) => (
        <Tooltip key={option.value} title={option.label} arrow placement="top">
          <IconButton
            onClick={() => onChange(option.value)}
            sx={{
              color: value === option.value ? "#fbc401" : "#888",
              backgroundColor:
                value === option.value ? "#2a2a2a" : "transparent",
              boxShadow: value === option.value ? "0 0 8px #fbc40188" : "none",
              transition: "all 0.3s",
              "&:hover": {
                color: "#fbc401",
                backgroundColor: "#2a2a2a",
              },
            }}
          >
            {option.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

export default StatusSelector;
