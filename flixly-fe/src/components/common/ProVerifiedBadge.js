import VerifiedIcon from "@mui/icons-material/Verified";
import { isProPlanRole } from "../../service/APIService";
import "./ProVerifiedBadge.css";

/** PRO plan doğrulama rozeti — kullanıcı adının hemen yanında */
const ProVerifiedBadge = ({ role, className = "", size = "sm" }) => {
  if (!isProPlanRole(role)) return null;
  return (
    <VerifiedIcon
      className={`pro-verified-badge pro-verified-badge--${size} ${className}`.trim()}
      titleAccess="PRO üye"
      fontSize="inherit"
      aria-label="PRO üye"
    />
  );
};

/** İsim + isteğe bağlı PRO rozeti */
export const UserDisplayName = ({
  name,
  role,
  className = "",
  badgeSize = "sm",
  as: Tag = "span",
}) => (
  <Tag className={`user-display-name ${className}`.trim()}>
    <span className="user-display-name-text">{name}</span>
    <ProVerifiedBadge role={role} size={badgeSize} />
  </Tag>
);

export default ProVerifiedBadge;
