import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import InitialAvatar from "../common/InitialAvatar";
import { followUser, getFollowStats, unfollowUser } from "../../service/APIService";
import "./Profile.css";

const ProfileSummary = ({ profileSummary, isOwnProfile }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [follow, setFollow] = useState({ following: false, followerCount: 0, followingCount: 0 });
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!profileSummary?.username) return;
    getFollowStats(profileSummary.username)
      .then(setFollow)
      .catch(() => {});
  }, [profileSummary?.username]);

  const handleCopyProfileLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileSummary?.username}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Link kopyalanamadı", err);
    }
  };

  const toggleFollow = async () => {
    if (!token) {
      alert("Takip etmek için giriş yapın.");
      return;
    }
    try {
      const data = follow.following
        ? await unfollowUser(profileSummary.username)
        : await followUser(profileSummary.username);
      setFollow(data);
    } catch (err) {
      alert(err?.response?.data?.message || "Takip işlemi başarısız.");
    }
  };

  const stats = [
    { value: profileSummary?.bookRead ?? 0, label: "Kitap" },
    { value: profileSummary?.bookReadThisYear ?? 0, label: "Bu yıl" },
    {
      value: profileSummary?.totalPagesRead ?? profileSummary?.totalPagesReadThisYear ?? 0,
      label: "Sayfa",
    },
    { value: follow.followerCount ?? 0, label: "Takipçi" },
    { value: follow.followingCount ?? 0, label: "Takip" },
    { value: profileSummary?.favoriteBooks?.length ?? 0, label: "Favori" },
  ];

  return (
    <header className="profile-hero">
      <div className="profile-hero-bg" aria-hidden="true" />
      <div className="profile-hero-content">
        <div className="profile-hero-row">
          <div className="profile-hero-identity">
            <InitialAvatar name={profileSummary?.profileName} className="profile-avatar-circle" />
            <div className="profile-hero-info">
              <h1 className="profile-display-name">{profileSummary?.profileName}</h1>
              <div className="profile-hero-actions">
                {isOwnProfile ? (
                  <button type="button" className="profile-edit-btn" onClick={() => navigate("/settings")}>
                    <EditOutlinedIcon fontSize="small" />
                    Profili düzenle
                  </button>
                ) : (
                  <button type="button" className="profile-edit-btn" onClick={toggleFollow}>
                    {follow.following ? <HowToRegIcon fontSize="small" /> : <PersonAddAlt1Icon fontSize="small" />}
                    {follow.following ? "Takip ediliyor" : "Takip et"}
                  </button>
                )}
                <button type="button" className="profile-link-btn" onClick={handleCopyProfileLink}>
                  {copied ? "Kopyalandı ✓" : "Linki kopyala"}
                </button>
              </div>
              <div className="profile-meta-row">
                {profileSummary?.location && (
                  <span className="profile-meta-item">
                    <PlaceOutlinedIcon fontSize="inherit" />
                    {profileSummary.location}
                  </span>
                )}
              </div>
              {profileSummary?.bio && (
                <p className="profile-bio">{profileSummary.bio}</p>
              )}
            </div>
          </div>

          <div className="profile-stats-inline">
            {stats.map(({ value, label }, index) => (
              <div className="profile-stat-inline" key={label}>
                {index > 0 && <span className="profile-stat-divider" aria-hidden="true" />}
                <div className="profile-stat-inline-body">
                  <span className="profile-stat-value">
                    {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
                  </span>
                  <span className="profile-stat-label">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfileSummary;
