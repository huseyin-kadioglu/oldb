import { PROFILE_TABS } from "./profileUtils";
import "./ProfileTabs.css";

const ProfileTabs = ({ active, onChange }) => (
  <nav className="profile-tabs" aria-label="Profil bölümleri">
    <div className="profile-tabs-scroller">
      {PROFILE_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`profile-tab ${active === tab.id ? "is-active" : ""}`}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </nav>
);

export default ProfileTabs;
