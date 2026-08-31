import { Box, IconButton, Tooltip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

import COPY from "../../copy";

export const ACTIVITY_STATUSES = [
  { value: "READ", icon: <MenuBookIcon />, label: COPY.status.read },
  { value: "READLIST", icon: <BookmarkAddedIcon />, label: COPY.status.want },
  { value: "LIBRARY", icon: <LibraryBooksIcon />, label: COPY.other.library },
  { value: "SHOPPING", icon: <ShoppingCartIcon />, label: COPY.other.shopping },
  { value: "DROPPED", icon: <DoNotDisturbAltIcon />, label: COPY.status.dropped },
];

const StatusSelector = ({ value, onChange, libraryFormat, onLibraryFormatChange }) => {
  return (
    <Box>
      <p className="log-field-label">Durum *</p>
      <Box display="flex" flexWrap="wrap" gap={1.5}>
        {ACTIVITY_STATUSES.map((option) => (
          <Tooltip key={option.value} title={option.label} arrow placement="top">
            <Box className="status-option-wrap">
              <IconButton
                onClick={() => onChange(option.value)}
                className={`status-icon-btn ${value === option.value ? "selected" : ""}`}
                aria-label={option.label}
              >
                {option.icon}
              </IconButton>
              <span className="status-option-label">{option.label}</span>
            </Box>
          </Tooltip>
        ))}
      </Box>

      {value === "LIBRARY" && (
        <Box mt={2}>
          <p className="log-field-label">Kütüphane türü — sahip olduğun format</p>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={libraryFormat || "PHYSICAL"}
            onChange={(_, v) => v && onLibraryFormatChange(v)}
            sx={{
              "& .MuiToggleButton-root": {
                color: "var(--color-text-muted)",
                borderColor: "var(--color-border-subtle)",
                textTransform: "none",
                fontSize: "0.8rem",
                "&.Mui-selected": {
                  color: "var(--color-primary-button)",
                  backgroundColor: "rgba(212, 175, 55, 0.12)",
                  borderColor: "rgba(212, 175, 55, 0.4)",
                },
              },
            }}
          >
            <ToggleButton value="PHYSICAL">
              <MenuBookOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} /> Fiziksel
            </ToggleButton>
            <ToggleButton value="PDF">
              <PictureAsPdfIcon sx={{ fontSize: 16, mr: 0.5 }} /> PDF / Dijital
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
    </Box>
  );
};

export default StatusSelector;
