import * as React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Box } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export default function MinimalDatePicker({ readDate, setReadDate }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 2 }}>
        <DatePicker
          value={readDate ? dayjs(readDate) : null}
          onChange={(newValue) => setReadDate(newValue)}
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              variant: "filled",
              InputProps: {
                disableUnderline: true,
              },
              sx: {
                width: 180,
                fontFamily: `"Georgia", serif`,
                fontSize: 14,
                borderRadius: 2,
                backgroundColor: "#3b4552",

                "& .MuiFilledInput-root": {
                  backgroundColor: "#3b4552",
                  borderRadius: 8,
                  overflow: "hidden",
                },

                "& .MuiFilledInput-root.Mui-focused": {
                  backgroundColor: "#3b4552",
                },

                "& .MuiFilledInput-root::before": {
                  borderBottom: "none",
                },

                "& .MuiFilledInput-root::after": {
                  borderBottom: "none",
                },

                "& .MuiInputBase-input": {
                  color: "var(--color-secondary-text)",
                  padding: "10px 12px",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--color-primary-button)",
                },
              },
            },
            popper: {
              sx: {
                "& .MuiPaper-root": {
                  backgroundColor: "var(--color-input-background)",
                  color: "var(--color-text)",
                  borderRadius: 8,
                },
                "& .MuiPickersDay-root": {
                  color: "var(--color-secondary-text)",
                  "&.Mui-selected": {
                    backgroundColor: "var(--color-primary-button)",
                    color: "#000",
                    fontWeight: 600,
                  },
                  "&:hover": {
                    backgroundColor: "#444",
                  },
                },
              },
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
