import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from "@mui/material";

const GenericMessageDialog = ({ open, onClose, title, message }) => {
  console.log("GenericMessageDialog");
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ backgroundColor: "var(--color-background)", p: 2 }}>
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "var(--color-primary-button)",
          }}
        >
          {title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "var(--color-text)", textAlign: "center" }}>
            {message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: "var(--color-primary-button)",
              color: "var(--color-background)",
              "&:hover": { backgroundColor: "#e0ac00" },
              textTransform: "none",
            }}
          >
            Tamam
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default GenericMessageDialog;
