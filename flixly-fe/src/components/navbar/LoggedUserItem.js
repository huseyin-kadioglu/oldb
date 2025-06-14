import { MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LoggedUserMenuItem = ({ navigateUrl, value }) => {
  const navigate = useNavigate();

  return (
    <MenuItem sx={{ gap: 1 }} onClick={() => navigate(navigateUrl)}>
      {value}
    </MenuItem>
  );
};
export default LoggedUserMenuItem;
