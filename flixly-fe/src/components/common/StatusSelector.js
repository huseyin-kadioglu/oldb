import { Box, IconButton, Tooltip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import COPY from "../../copy";

/** Frontend exclusive keys — map to backend in BookLogActivity */
export const EXCLUSIVE_STATUSES = [
  { value: "READ", icon: <TaskAltIcon />, label: COPY.status.read },
  { value: "WANT", icon: <AccessTimeIcon />, label: COPY.status.want },
  { value: "READING", icon: <MenuBookIcon />, label: COPY.status.reading },
  { value: "DROPPED", icon: <DoNotDisturbAltIcon />, label: COPY.status.dropped },
];

const StatusSelector = ({
  value,
  onChange,
  libraryChecked = false,
  onLibraryChange,
  shoppingChecked = false,
  onShoppingChange,
  libraryFormat,
  onLibraryFormatChange,
}) => {
  return (
    <Box>
      <p className="log-field-label">{COPY.status.label} *</p>
      <Box display="flex" flexWrap="wrap" gap={1.5}>
        {EXCLUSIVE_STATUSES.map((option) => (
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

      <p className="log-field-label" style={{ marginTop: 16 }}>
        {COPY.other.title}
      </p>
      <Box display="flex" flexWrap="wrap" gap={1.5}>
        <Tooltip title={COPY.other.library} arrow placement="top">
          <Box className="status-option-wrap">
            <IconButton
              onClick={() => onLibraryChange?.(!libraryChecked)}
              className={`status-icon-btn ${libraryChecked ? "selected" : ""}`}
              aria-label={COPY.other.library}
              aria-pressed={libraryChecked}
            >
              <LibraryBooksIcon />
            </IconButton>
            <span className="status-option-label">{COPY.other.library}</span>
          </Box>
        </Tooltip>
        <Tooltip title={COPY.other.shopping} arrow placement="top">
          <Box className="status-option-wrap">
            <IconButton
              onClick={() => onShoppingChange?.(!shoppingChecked)}
              className={`status-icon-btn ${shoppingChecked ? "selected" : ""}`}
              aria-label={COPY.other.shopping}
              aria-pressed={shoppingChecked}
            >
              <ShoppingCartIcon />
            </IconButton>
            <span className="status-option-label">{COPY.other.shopping}</span>
          </Box>
        </Tooltip>
      </Box>

      {libraryChecked && (
        <Box mt={2}>
          <p className="log-field-label">{COPY.fields.libraryFormat}</p>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={libraryFormat || "PHYSICAL"}
            onChange={(_, v) => v && onLibraryFormatChange?.(v)}
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
              <MenuBookOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} /> {COPY.fields.formatPhysical}
            </ToggleButton>
            <ToggleButton value="PDF">
              <PictureAsPdfIcon sx={{ fontSize: 16, mr: 0.5 }} /> {COPY.fields.formatDigital}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
    </Box>
  );
};

export default StatusSelector;
