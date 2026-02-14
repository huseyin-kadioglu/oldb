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
              color: value === option.value ? "var(--color-primary-button)" : "var(--color-text-muted)",
              backgroundColor: value === option.value ? "rgba(245, 197, 24, 0.12)" : "transparent",
              border: value === option.value ? "1px solid var(--color-primary-button)" : "1px solid transparent",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "var(--color-primary-button)",
                backgroundColor: "var(--color-background-card)",
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
