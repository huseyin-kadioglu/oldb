import React, { useState } from "react";
import { IconButton, Box } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import StarIcon from "@mui/icons-material/Star";
import BlockIcon from "@mui/icons-material/Block";
import FavoriteIcon from "@mui/icons-material/Favorite";

const statusOptions = [
  { value: "READ", icon: <MenuBookIcon /> },
  { value: "READLIST", icon: <PlaylistAddIcon /> },
  { value: "FAVOURITE", icon: <StarIcon /> },
  { value: "DROPPED", icon: <BlockIcon /> },
  { value: "HATE", icon: <FavoriteIcon /> },
];

const StatusSelector = ({ value, onChange }) => {
  return (
    <Box display="flex" gap={2} p={2} borderRadius={2}>
      {statusOptions.map((option) => (
        <IconButton
          key={option.value}
          onClick={() => onChange(option.value)}
          sx={{
            color: value === option.value ? "#fbc401" : "#888",
            backgroundColor: value === option.value ? "#2a2a2a" : "transparent",
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
      ))}
    </Box>
  );
};

export default StatusSelector;
