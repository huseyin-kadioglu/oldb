import { useState } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
} from "@mui/material";

const BooksFilterPanel = ({ allCountries, onFilterChange }) => {
  const [nobelOnly, setNobelOnly] = useState(false);
  const [country, setCountry] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [minRating, setMinRating] = useState(0);

  const emitChange = (next) => {
    onFilterChange({
      nobelOnly,
      country,
      yearFrom: yearFrom ? Number(yearFrom) : null,
      yearTo: yearTo ? Number(yearTo) : null,
      minRating,
      ...next,
    });
  };

  return (
    <Box
      className="books-filter-panel"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        mb: 2,
        p: 2,
        borderRadius: 1,
        border: "1px solid var(--line-color)",
        backgroundColor: "var(--color-background-secondary)",
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={nobelOnly}
            onChange={(e) => {
              setNobelOnly(e.target.checked);
              emitChange({ nobelOnly: e.target.checked });
            }}
          />
        }
        label="Nobel ödüllü"
      />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Ülke</InputLabel>
        <Select
          value={country}
          label="Ülke"
          onChange={(e) => {
            setCountry(e.target.value);
            emitChange({ country: e.target.value });
          }}
        >
          <MenuItem value="">Tümü</MenuItem>
          {allCountries.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        label="Yıl (min)"
        type="number"
        value={yearFrom}
        onChange={(e) => {
          setYearFrom(e.target.value);
          emitChange({ yearFrom: e.target.value ? Number(e.target.value) : null });
        }}
        sx={{ width: 120 }}
      />

      <TextField
        size="small"
        label="Yıl (max)"
        type="number"
        value={yearTo}
        onChange={(e) => {
          setYearTo(e.target.value);
          emitChange({ yearTo: e.target.value ? Number(e.target.value) : null });
        }}
        sx={{ width: 120 }}
      />

      <Box sx={{ minWidth: 180, px: 1 }}>
        <InputLabel shrink>Min. puan: {minRating}</InputLabel>
        <Slider
          value={minRating}
          min={0}
          max={5}
          step={0.5}
          onChange={(_, value) => {
            setMinRating(value);
            emitChange({ minRating: value });
          }}
        />
      </Box>
    </Box>
  );
};

export default BooksFilterPanel;
