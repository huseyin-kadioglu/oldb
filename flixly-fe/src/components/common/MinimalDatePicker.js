import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const inputSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--color-background-input)",
    color: "var(--color-text)",
    borderRadius: "var(--radius-md)",
    "& fieldset": { borderColor: "var(--color-border-subtle)" },
    "&:hover fieldset": { borderColor: "var(--color-text-muted)" },
    "&.Mui-focused fieldset": { borderColor: "var(--color-primary-button)" },
  },
  "& .MuiInputBase-input": {
    color: "var(--color-text)",
    padding: "12px 14px",
  },
  "& .MuiInputLabel-root": { color: "var(--color-text-muted)" },
  "& .MuiSvgIcon-root": { color: "var(--color-primary-button)" },
};

const popperSx = {
  "& .MuiPaper-root": {
    backgroundColor: "var(--color-background-card)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "var(--radius-md)",
  },
  "& .MuiPickersDay-root": {
    color: "var(--color-text-secondary)",
    "&.Mui-selected": {
      backgroundColor: "var(--color-primary-button) !important",
      color: "#0a0a0f",
      fontWeight: 600,
    },
    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
  },
  "& .MuiPickersCalendarHeader-label": { color: "var(--color-text)" },
  "& .MuiDayCalendar-weekDayLabel": { color: "var(--color-text-muted)" },
};

export default function MinimalDatePicker({ readDate, setReadDate }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="log-field">
        <p className="log-field-label">Okuma tarihi</p>
        <DatePicker
          value={readDate ? dayjs(readDate) : null}
          onChange={(newValue) => setReadDate(newValue)}
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              variant: "outlined",
              fullWidth: true,
              placeholder: "gg.aa.yyyy",
              sx: inputSx,
            },
            popper: { sx: popperSx },
            desktopPaper: { sx: { backgroundColor: "var(--color-background-card)" } },
            mobilePaper: { sx: { backgroundColor: "var(--color-background-card)" } },
          }}
        />
      </div>
    </LocalizationProvider>
  );
}
