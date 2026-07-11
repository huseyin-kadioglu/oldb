import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import InitialAvatar from "../common/InitialAvatar";
import { UserDisplayName } from "../common/ProVerifiedBadge";
import { followUser, getFollowStats, unfollowUser, resolveMediaUrl } from "../../service/APIService";
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
    if (isOwnProfile && profileSummary.avatarUrl) {
      sessionStorage.setItem(
        "avatarUrl",
        resolveMediaUrl(profileSummary.avatarUrl) || profileSummary.avatarUrl
      );
    }
    if (isOwnProfile && profileSummary.contributionPoint != null) {
      sessionStorage.setItem("contributionPoint", String(profileSummary.contributionPoint));
    }
  }, [
    profileSummary?.username,
    profileSummary?.avatarUrl,
    profileSummary?.contributionPoint,
    isOwnProfile,
  ]);

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileSummary?.username}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: profileSummary?.profileName || "OLDB profil",
          url: profileUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      if (err?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* ignore */
      }
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

  const readingStreak = profileSummary?.readingStreak ?? 0;

  const stats = [
    { value: profileSummary?.bookRead ?? 0, label: "Kitap", hideZero: false },
    { value: profileSummary?.bookReadThisYear ?? 0, label: "Bu yıl", hideZero: false },
    {
      value: profileSummary?.totalPagesRead ?? 0,
      label: "Sayfa",
      hideZero: true,
    },
    { value: follow.followerCount ?? 0, label: "Takipçi", hideZero: false },
    { value: follow.followingCount ?? 0, label: "Takip", hideZero: true },
  ].filter((s) => !(s.hideZero && !s.value));

  return (
    <header className="profile-hero">
      <div className="profile-hero-bg" aria-hidden="true" />
      <div className="profile-hero-content">
        <div className="profile-hero-row">
          <div className="profile-hero-identity">
            <InitialAvatar
              name={profileSummary?.profileName}
              src={profileSummary?.avatarUrl}
              className="profile-avatar-circle"
            />
            <div className="profile-hero-info">
              <div className="profile-hero-name-row">
                <h1 className="profile-display-name">
                  <UserDisplayName
                    name={profileSummary?.profileName}
                    role={profileSummary?.role}
                    badgeSize="md"
                    as="span"
                  />
                </h1>
                {readingStreak > 0 && (
                  <span className="profile-streak-chip" title="Okuma serisi">
                    <LocalFireDepartmentIcon fontSize="inherit" />
                    {readingStreak}g
                  </span>
                )}
              </div>

              {profileSummary?.location && (
                <p className="profile-location">
                  <PlaceOutlinedIcon fontSize="inherit" />
                  {profileSummary.location}
                </p>
              )}

              {profileSummary?.bio && <p className="profile-bio">{profileSummary.bio}</p>}

              <div className="profile-hero-actions">
                {isOwnProfile ? (
                  <>
                    <button
                      type="button"
                      className="profile-btn profile-btn--primary"
                      onClick={() => navigate("/settings")}
                    >
                      <EditOutlinedIcon fontSize="small" />
                      Profili düzenle
                    </button>
                    <button type="button" className="profile-btn profile-btn--ghost" onClick={handleShare}>
                      <IosShareOutlinedIcon fontSize="small" />
                      {copied ? "Kopyalandı" : "Linki kopyala"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`profile-btn ${follow.following ? "profile-btn--ghost" : "profile-btn--primary"}`}
                      onClick={toggleFollow}
                    >
                      {follow.following ? (
                        <HowToRegIcon fontSize="small" />
                      ) : (
                        <PersonAddAlt1Icon fontSize="small" />
                      )}
                      {follow.following ? "Takibi bırak" : "Takip et"}
                    </button>
                    <button type="button" className="profile-btn profile-btn--ghost" onClick={handleShare}>
                      <IosShareOutlinedIcon fontSize="small" />
                      {copied ? "Kopyalandı" : "Profili paylaş"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="profile-stats-grid" role="list">
            {stats.map(({ value, label }) => (
              <div
                className={`profile-stat ${value === 0 ? "is-zero" : ""}`}
                key={label}
                role="listitem"
              >
                <span className="profile-stat-value">
                  {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
                </span>
                <span className="profile-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfileSummary;
