import * as React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, Box, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export default function MinimalDatePicker({ readDate, setReadDate }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", alignItems: "center", margin: "10px 0 10px 0" }}>
        <DatePicker
          value={readDate}
          onChange={(newValue) => setReadDate(newValue)}
          format="DD MMM YYYY"
          slotProps={{
            textField: {
              variant: "filled",
              InputProps: {
                disableUnderline: true,
                sx: {
                  fontSize: 14,
                  //bgcolor: "#3b4b5c",
                  //color: "white",
                  borderRadius: 1,
                  paddingX: 1,
                  paddingY: 0.5,
                  "& input": { padding: 0 },
                },
              },
              sx: {
                width: "auto",
                "& .MuiInputBase-root": {
                  paddingRight: "0 !important",
                },
              },
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
