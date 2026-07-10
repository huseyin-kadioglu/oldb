import { Link } from "react-router-dom";
import "./folios-ui.css";

const SectionHeader = ({ title, icon, to, linkLabel = "Tümünü gör" }) => (
  <div className="folios-section-header">
    <h2 className="folios-section-title">
      {icon && <span className="folios-section-icon">{icon}</span>}
      {title}
    </h2>
    {to && (
      <Link to={to} className="folios-see-all">
        {linkLabel} →
      </Link>
    )}
  </div>
);

export default SectionHeader;
