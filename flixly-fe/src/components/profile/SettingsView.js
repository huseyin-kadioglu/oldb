import React, { useState } from "react";
import "./SettingsView.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ErrorDialog from "../common/ErrorDialog";
import GenericMessageDialog from "./../common/GenericMessageDialog";

import {
  getProfileSummary,
  updateProfile,
  changePassword,
  logout,
} from "../../service/APIService";

const SettingsView = () => {
  const [message, setMessage] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    username: "",
    email: "",
    location: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatarUrl: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const data = await getProfileSummary();
      setForm((prev) => ({
        ...prev,
        username: data.profileName ?? "",
        email: data.username ?? "",
        bio: data.bio ?? "",
        location: data.location ?? "",
      }));
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username: form.username,
      location: form.location,
      bio: form.bio,
    };
    try {
      await updateProfile(payload);
      setMessage("Profil güncellendi.");
      setTimeout(() => setMessage(null), 2500);
    } catch {
      setMessage("Profil güncellenemedi.");
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const handleChangePassword = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Tüm alanları doldurun.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccessDialogOpen("Şifre başarıyla değiştirildi. Tekrar giriş yapmalısınız.");
      setTimeout(() => {
        logout();
        navigate("/");
      }, 1500);
    } catch {
      setError("Mevcut şifre yanlış.");
    }
  };

  const handleAvatarSubmit = async () => {
    if (!form.avatarUrl.trim()) {
      setError("Lütfen bir fotoğraf URL'si girin.");
      return;
    }
    try {
      await updateProfile({ avatarUrl: form.avatarUrl });
      setMessage("Profil fotoğrafı güncellendi. Admin onayı bekleniyor.");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setError("Fotoğraf isteği gönderilemedi.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const tabs = [
    { id: "profile", label: "Profil" },
    { id: "auth", label: "Şifre" },
    { id: "avatar", label: "Avatar" },
  ];

  return (
    <>
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="settings-title">Hesap Ayarları</h1>
          <p className="settings-subtitle">Profil bilgilerini ve hesap güvenliğini yönet</p>
        </div>

        <div className="settings-body">
          <nav className="settings-tabs">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                className={`settings-tab-btn ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {message && <div className="settings-banner settings-banner--info">{message}</div>}

            {activeTab === "profile" && (
              <form onSubmit={handleSubmit}>
                <div className="settings-section-title">Profil Bilgileri</div>

                <div className="settings-field">
                  <label>Kullanıcı adı</label>
                  <input name="username" value={form.username} readOnly className="settings-input settings-input--readonly" />
                  <span className="settings-hint">Kullanıcı adı değiştirilemez.</span>
                </div>

                <div className="settings-field">
                  <label>E-posta</label>
                  <input name="email" value={form.email} readOnly className="settings-input settings-input--readonly" />
                </div>

                <div className="settings-field">
                  <label>Konum</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="settings-input"
                    placeholder="Şehir, Ülke"
                  />
                </div>

                <div className="settings-field">
                  <label>Biyografi</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    className="settings-input settings-textarea"
                    placeholder="Kendinizden bahsedin..."
                    rows="4"
                  />
                </div>

                <button type="submit" className="settings-save-btn">
                  Değişiklikleri Kaydet
                </button>
              </form>
            )}

            {activeTab === "auth" && (
              <div>
                <div className="settings-section-title">Şifre Değiştir</div>

                <div className="settings-field">
                  <label>Mevcut Şifre</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="settings-input"
                    placeholder="••••••••"
                  />
                </div>

                <div className="settings-field">
                  <label>Yeni Şifre</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="settings-input"
                    placeholder="En az 8 karakter"
                  />
                </div>

                <div className="settings-field">
                  <label>Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="settings-input"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="button"
                  className="settings-save-btn"
                  onClick={handleChangePassword}
                >
                  Şifreyi Değiştir
                </button>
              </div>
            )}

            {activeTab === "avatar" && (
              <div>
                <div className="settings-section-title">Profil Fotoğrafı</div>
                <p className="settings-hint settings-hint--block">
                  Profil fotoğrafınızı güncellemek için bir görsel URL'si girin.
                  Değişiklikler admin onayından sonra aktif olur.
                </p>

                <div className="settings-field">
                  <label>Fotoğraf URL'si</label>
                  <input
                    type="url"
                    name="avatarUrl"
                    value={form.avatarUrl}
                    onChange={handleChange}
                    className="settings-input"
                    placeholder="https://örnek.com/foto.jpg"
                  />
                </div>

                {form.avatarUrl && (
                  <div className="settings-avatar-preview">
                    <img src={form.avatarUrl} alt="Önizleme" />
                  </div>
                )}

                <button
                  type="button"
                  className="settings-save-btn"
                  onClick={handleAvatarSubmit}
                >
                  Onaya Gönder
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <ErrorDialog
          open={!!error}
          errorMessage={error}
          handleClose={() => setError(null)}
        />
      )}

      {successDialogOpen && (
        <GenericMessageDialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          title="Şifre Değiştirildi"
          message="Şifre başarıyla değiştirildi. Tekrar giriş yapmalısınız."
        />
      )}
    </>
  );
};

export default SettingsView;
