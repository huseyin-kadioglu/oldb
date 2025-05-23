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
                fontWeight: 400,
                fontSize: 14,
                borderRadius: 2,
                backgroundColor: "#3b4552",
                color: "#ddd",
                input: {
                  color: "#ddd",
                  padding: "10px 12px",
                },
                "& .MuiSvgIcon-root": {
                  color: "#fbc401",
                },
                "& .MuiFilledInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#3b4552",
                },
              },
            },
            popper: {
              sx: {
                "& .MuiPaper-root": {
                  backgroundColor: "#2f2f2f",
                  color: "#fff",
                  borderRadius: 2,
                },
                "& .MuiPickersDay-root": {
                  color: "#ddd",
                  "&.Mui-selected": {
                    backgroundColor: "#fbc401",
                    color: "#000",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#e6b800",
                    },
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
