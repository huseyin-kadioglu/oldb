import React, { useState } from "react";
import "./SettingsView.css";

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    username: "huseyin",
    email: "huseyin@example.com",
    location: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    avatar: null,
    notifications: true,
    theme: "dark",
  });

  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, avatar: files[0] });
      alert("Profil fotoğrafı yükleme isteği gönderildi. Onay sonrası değişecektir.");
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted", form);
    alert("Changes saved!");
  };

  return (
    <div className="edit-profile-container">
      {/* Tab Navigation */}
      <div className="tabs">
        {["profile", "auth", "avatar", "data"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <form className="edit-profile-form" onSubmit={handleSubmit}>
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="tab-content">
            <div className="form-row">
              <label>Username</label>
              {isEditingUsername ? (
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={() => setIsEditingUsername(false)}
                  autoFocus
                />
              ) : (
                <div className="editable-field">
                  <span>{form.username}</span>
                  <button
                    type="button"
                    className="edit-icon"
                    onClick={() => setIsEditingUsername(true)}
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            <div className="form-row">
              <label>Email</label>
              <input name="email" value={form.email} readOnly />
            </div>

            <div className="form-row">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>

            <div className="form-row">
              <label>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>
        )}

        {/* Auth Tab */}
        {activeTab === "auth" && (
          <div className="tab-content">
            <div className="form-row">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Avatar Tab */}
        {activeTab === "avatar" && (
          <div className="tab-content">
            <div className="form-row">
              <label>Profile Picture</label>
              <input type="file" name="avatar" onChange={handleChange} />
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === "data" && (
          <div className="tab-content">
            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="notifications"
                  checked={form.notifications}
                  onChange={handleChange}
                />
                Receive email notifications
              </label>
            </div>

            <div className="form-row">
              <label>Theme</label>
              <select name="theme" value={form.theme} onChange={handleChange}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        )}

        <button type="submit" className="save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default SettingsView;
