import { MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LoggedUserMenuItem = ({ navigateUrl, value, onClose }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClose) onClose();
    navigate(navigateUrl);
  };

  return (
    <MenuItem sx={{ gap: 1 }} onClick={handleClick}>
      {value}
    </MenuItem>
  );
};
export default LoggedUserMenuItem;
