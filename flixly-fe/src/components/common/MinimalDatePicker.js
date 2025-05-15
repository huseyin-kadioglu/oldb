import * as React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, Box, Typography } from "@mui/material";
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
                sx: {
                  fontSize: 14,
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                  backgroundColor: "#f5f5f5",
                  "& input": {
                    padding: "8px 0", // biraz daha dikey boşluk
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#6b6b6b",
                    marginRight: "4px", // ikonun kutuya taşmasını engeller
                  },
                },
              },
              sx: {
                width: 180,
                "& .MuiInputBase-root": {
                  pr: "8px", // ikonun içeride düzgün görünmesini sağlar
                },
              },
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
