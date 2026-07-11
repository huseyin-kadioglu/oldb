import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ErrorDialog from "../common/ErrorDialog";
import GenericMessageDialog from "../common/GenericMessageDialog";
import {
  getProfileSummary,
  updateProfile,
  uploadAvatar,
  changePassword,
  logout,
  resolveMediaUrl,
} from "../../service/APIService";
import "./SettingsView.css";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

const SettingsView = () => {
  const [message, setMessage] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    location: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const profileUsername = sessionStorage.getItem("username");

  const goToProfile = () => {
    if (profileUsername) {
      navigate(`/profile/${profileUsername}`);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfileSummary();
        setForm((prev) => ({
          ...prev,
          username: data.profileName ?? data.username ?? "",
          email: data.email ?? sessionStorage.getItem("emailAddress") ?? "",
          bio: data.bio ?? "",
          location: data.location ?? "",
        }));
        if (data.role) sessionStorage.setItem("userRole", data.role);
        setCurrentAvatarUrl(resolveMediaUrl(data.avatarUrl) || null);
        setPendingAvatarUrl(resolveMediaUrl(data.pendingAvatarUrl) || null);
        if (data.avatarUrl) sessionStorage.setItem("avatarUrl", resolveMediaUrl(data.avatarUrl));
        if (data.contributionPoint != null) {
          sessionStorage.setItem("contributionPoint", String(data.contributionPoint));
        }
      } catch {
        setError("Profil bilgileri yüklenemedi.");
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        username: form.username,
        location: form.location,
        bio: form.bio,
      });
      setMessage("Profil güncellendi.");
      setTimeout(() => setMessage(null), 2500);
    } catch {
      setMessage("Profil güncellenemedi.");
      setTimeout(() => setMessage(null), 2500);
    } finally {
      setSaving(false);
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
      setSuccessDialogOpen(true);
      setTimeout(() => {
        logout();
        navigate("/");
      }, 1500);
    } catch {
      setError("Mevcut şifre yanlış.");
    }
  };

  const handleAvatarSubmit = async () => {
    if (!selectedFile) {
      setError("Lütfen bir fotoğraf dosyası seçin.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const data = await uploadAvatar(selectedFile);
      setPendingAvatarUrl(resolveMediaUrl(data.pendingAvatarUrl) || null);
      if (data.avatarUrl) {
        setCurrentAvatarUrl(resolveMediaUrl(data.avatarUrl));
      }
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
      setPreviewObjectUrl(null);
      setSelectedFile(null);
      setMessage("Fotoğraf onaya gönderildi. Admin onayından sonra profilinde görünür.");
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setError(err.message || "Fotoğraf isteği gönderilemedi.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Yalnızca görsel dosyaları yükleyebilirsin.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Dosya çok büyük. Lütfen 2MB altı bir görsel seç.");
      return;
    }
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
    }
    setSelectedFile(file);
    setPreviewObjectUrl(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: PersonOutlineIcon },
    { id: "auth", label: "Şifre", icon: LockOutlinedIcon },
  ];

  const previewSrc = previewObjectUrl || pendingAvatarUrl || currentAvatarUrl;

  return (
    <>
      <div className="settings-page">
        <div className="settings-panel">
          <header className="settings-panel-header">
            <div>
              <h1 className="settings-title">Profili Düzenle</h1>
              <p className="settings-subtitle">
                Profil bilgilerini ve hesap güvenliğini yönet
              </p>
            </div>
            <button
              type="button"
              className="settings-close-btn"
              onClick={goToProfile}
              aria-label="Profile dön"
              title="Profile dön"
            >
              <CloseIcon fontSize="small" />
            </button>
          </header>

          <div className="settings-body">
            <nav className="settings-tabs" aria-label="Ayar sekmeleri">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`settings-tab-btn ${activeTab === id ? "active" : ""}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon className="settings-tab-icon" fontSize="small" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="settings-content">
              {message && (
                <div className="settings-banner settings-banner--info">{message}</div>
              )}

              {activeTab === "profile" && (
                <form onSubmit={handleSubmit}>
                  <div className="settings-section-title">Profil Fotoğrafı</div>

                  <p className="settings-hint settings-hint--block">
                    Herkes fotoğraf yükleyebilir. Değişiklik admin onayından sonra profilinde görünür.
                  </p>

                  {pendingAvatarUrl && (
                    <div className="settings-banner settings-banner--info">
                      Onay bekleyen bir fotoğrafın var.
                    </div>
                  )}

                  <div className="settings-avatar-panel">
                    <div className="settings-avatar-preview">
                      {previewSrc ? (
                        <img src={previewSrc} alt="Önizleme" />
                      ) : (
                        <div className="settings-avatar-placeholder">Foto yok</div>
                      )}
                    </div>

                    <div className="settings-avatar-fields">
                      <div className="settings-field">
                        <label htmlFor="settings-avatar-file">Dosya seç (PNG, JPG, WEBP — max 2MB)</label>
                        <input
                          id="settings-avatar-file"
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          disabled={uploadingAvatar}
                          onChange={handleFilePick}
                          className="settings-input"
                        />
                        {selectedFile && (
                          <span className="settings-hint">{selectedFile.name} — önizleme hazır.</span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="settings-save-btn settings-save-btn--secondary"
                        onClick={handleAvatarSubmit}
                        disabled={!selectedFile || uploadingAvatar}
                      >
                        {uploadingAvatar ? "Yükleniyor…" : "Fotoğrafı Onaya Gönder"}
                      </button>
                    </div>
                  </div>

                  <div className="settings-section-title settings-section-title--spaced">Profil Bilgileri</div>

                  <div className="settings-field">
                    <label htmlFor="settings-username">Kullanıcı adı</label>
                    <input
                      id="settings-username"
                      name="username"
                      value={form.username}
                      readOnly
                      className="settings-input settings-input--readonly"
                    />
                    <span className="settings-hint">Kullanıcı adı değiştirilemez.</span>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-email">E-posta</label>
                    <input
                      id="settings-email"
                      name="email"
                      value={form.email}
                      readOnly
                      className="settings-input settings-input--readonly"
                    />
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-location">Konum</label>
                    <input
                      id="settings-location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="settings-input"
                      placeholder="Şehir, Ülke"
                    />
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-bio">Biyografi</label>
                    <textarea
                      id="settings-bio"
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      className="settings-input settings-textarea"
                      placeholder="Kendinizden bahsedin..."
                      rows={4}
                    />
                  </div>

                  <button type="submit" className="settings-save-btn" disabled={saving}>
                    {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
                  </button>
                </form>
              )}

              {activeTab === "auth" && (
                <div>
                  <div className="settings-section-title">Şifre Değiştir</div>

                  <div className="settings-field">
                    <label htmlFor="settings-current-password">Mevcut Şifre</label>
                    <input
                      id="settings-current-password"
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      className="settings-input"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-new-password">Yeni Şifre</label>
                    <input
                      id="settings-new-password"
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      className="settings-input"
                      placeholder="En az 8 karakter"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-confirm-password">Yeni Şifre (Tekrar)</label>
                    <input
                      id="settings-confirm-password"
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="settings-input"
                      placeholder="••••••••"
                      autoComplete="new-password"
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
            </div>
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
          open={!!successDialogOpen}
          onClose={() => setSuccessDialogOpen(null)}
          title="Şifre Değiştirildi"
          message="Şifre başarıyla değiştirildi. Tekrar giriş yapmalısınız."
        />
      )}
    </>
  );
};

export default SettingsView;
