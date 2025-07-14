import React, { useState } from "react";
import "./EditProfile.css";

const EditProfile = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    notifications: true,
    theme: "dark",
    avatar: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, avatar: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted", form);
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>First Name</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Last Name</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Current Password</label>
          <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>New Password</label>
          <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Avatar</label>
          <input type="file" name="avatar" onChange={handleChange} />
        </div>

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

        <button type="submit" className="save-button">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
