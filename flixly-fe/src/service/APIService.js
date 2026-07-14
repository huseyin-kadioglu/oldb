import axios from "axios";

const BASE_URL = "http://localhost:8080/"; // Backend URL

/** Relative /uploads/... yollarını absolute URL'e çevirir */
export const resolveMediaUrl = (url) => {
  if (!url) return null;
  const value = String(url).trim();
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }
  if (value.startsWith("/")) {
    return `${BASE_URL.replace(/\/$/, "")}${value}`;
  }
  return value;
};

const BOOKS_API = BASE_URL + "books/"; // Backend URL
const BOOKS_BY_YEAR_API = BASE_URL + "books/publishYear/"; // Backend URL
const AUTHOR_API = BASE_URL + "authors/"; // Backend URL
const PROFILE_API = BASE_URL + "profile/"; // Backend URL
const BOOK_APPROVAL_API = BASE_URL + "book-approvals";
const AUTHOR_APPROVAL_API = BASE_URL + "author-approvals";
const SIGNUP_API = BASE_URL + "api/auth/signup";
const LOGIN_API = BASE_URL + "api/auth/login";
const USER_ACTIVITY_API = BASE_URL + "userActivity/"; // Backend URL

  export const changePassword = async (payload) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}profile/change-password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Şifre değiştirilemedi");
    }

    return;
  } catch (error) {
    console.error("Şifre değiştirilirken hata:", error);
    throw error;
  }
};

export const logout = () => {
  // storage temizle
  sessionStorage.clear();
  localStorage.clear();

  // axios header temizle
  delete axios.defaults.headers.common["Authorization"];
};

// APPROVAL SERVICES
export const getAuthorApprovals = async () => {
  const token = sessionStorage.getItem("token");
  const response = await fetch("http://localhost:8080/author-approvals", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const approveAuthorApproval = async (author) => {
  // artık editable olduğu için parametreler de değişebilir.
  console.log("author params", author);
  // const token = sessionStorage.getItem("token");
  // await fetch(`http://localhost:8080/author-approvals/${author}/approve`, {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // });
};

export const approveBookApproval = async (book) => {
  console.log("book params", book);

  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:8080/book-approvals/approve",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(book), // burada book objesini gönderiyoruz
        mode: "cors",
      }
    );

    if (!response.ok) {
      throw new Error("Onaylama işlemi başarısız: " + response.statusText);
    }

    return await response.json(); // veya response.text() — backend ne döndürüyorsa
  } catch (error) {
    console.error("Kitap onaylanırken hata oluştu:", error);
    throw error;
  }
};

export const rejectAuthorApproval = async (id) => {
  const token = sessionStorage.getItem("token");
  await fetch(`http://localhost:8080/author-approvals/reject/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createBookContribution = async (data) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:8080/book-approvals", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("Hata oluştu: " + response.statusText);
    }

    // Response body'si boş olabilir, bu yüzden önce text olarak alıp kontrol ediyoruz
    const text = await response.text();
    return text ? JSON.parse(text) : null; // boşsa null döner
  } catch (error) {
    console.error("Kitap katkısı eklenirken hata oluştu:", error);
    throw error;
  }
};

export const createAuthorContribution = async (payload) => {
  const token = sessionStorage.getItem("token");

  const response = await fetch("http://localhost:8080/author-approvals", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Yazar eklenemedi.");
  }

  const text = await response.text(); // önce text al
  return text ? JSON.parse(text) : null; // içerik varsa parse et
};

export const rejectBookApproval = async (id) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:8080/book-approvals/reject/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
      }
    );

    if (!response.ok) {
      throw new Error("Reddetme işlemi başarısız: " + response.statusText);
    }
  } catch (error) {
    console.error("Kitap reddedilirken hata oluştu:", error);
    throw error;
  }
};

export const getBookApprovals = async () => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(BOOK_APPROVAL_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("Hata oluştu: " + response.statusText);
    }

    return response.json();
  } catch (error) {
    console.error("Kitap onayları alınırken hata oluştu:", error);
    throw error;
  }
};

// BOOK SERVICE
export const getFilteredBooks = async ({ nobelOnly, country, yearFrom, yearTo, minRating } = {}) => {
  const token = sessionStorage.getItem("token");
  const params = new URLSearchParams();
  if (nobelOnly) params.append("nobelOnly", "true");
  if (country) params.append("country", country);
  if (yearFrom) params.append("yearFrom", yearFrom);
  if (yearTo) params.append("yearTo", yearTo);
  if (minRating > 0) params.append("minRating", minRating);

  const response = await fetch(`${BASE_URL}books/filter?${params}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error(`Filtre isteği başarısız (${response.status})`);
  return response.json();
};

export const getBooks = async () => {
  const token = sessionStorage.getItem("token");

  const response = await fetch(BOOKS_API, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Kitaplar alınamadı (${response.status})`);
  }

  return response.json();
};

export const getBookById = async (id) => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await axios.get(`${BOOKS_API}${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Kitap alınırken hata oluştu:", error);
    throw error;
  }
};

/** Kitap sosyal hub: friendsReading, topReviews, authorOtherBooks */
export const getBookSocial = async (bookId) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${BOOKS_API}${bookId}/social`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

const localDateIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Günlük okuma check-in durumu */
export const getDailyReadCheckin = async (date = localDateIso()) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}profile/me/read-today`, {
    params: { date },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

/** Bugün okudum tik’i — checkedIn: true/false */
export const setDailyReadCheckin = async (checkedIn, date = localDateIso()) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.put(
    `${BASE_URL}profile/me/read-today`,
    { checkedIn, date },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const getBooksByPublishYear = async (publishYear) => {
  try {
    const response = await axios.get(`${BOOKS_BY_YEAR_API}${publishYear}`);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("getBooksByPublishYear ERROR:", error);
    throw error;
  }
};

// AUTHOR SERVICE
export const getAuthorById = async (id) => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await axios.get(`${AUTHOR_API}${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Yazarlar alınırken hata oluştu:", error);
    throw error;
  }
};

export const getAuthors = async () => {
  try {
    const response = await axios.get(AUTHOR_API);
    return response.data;
  } catch (error) {
    console.error("Yazarlar alınırken hata oluştu:", error);
    throw error;
  }
};

export const getCommunityStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}community/stats`);
    return response.data;
  } catch (error) {
    console.error("Topluluk istatistikleri alınamadı:", error);
    throw error;
  }
};

export const getCommunityReviews = async (limit = 10) => {
  const response = await axios.get(`${BASE_URL}community/reviews`, { params: { limit } });
  return response.data;
};

export const getHomeFeed = async () => {
  const response = await axios.get(`${BASE_URL}home`);
  return response.data;
};

export const getBadges = async (username) => {
  const token = sessionStorage.getItem("token");
  const url = username
    ? `${BASE_URL}gamification/badges/${encodeURIComponent(username)}`
    : `${BASE_URL}gamification/badges`;
  const response = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const getChallenges = async (username) => {
  const token = sessionStorage.getItem("token");
  const url = username
    ? `${BASE_URL}gamification/challenges/${encodeURIComponent(username)}`
    : `${BASE_URL}gamification/challenges`;
  const response = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const importOpenLibraryCatalog = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(
    `${BASE_URL}admin/catalog/import-open-library`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// PROFILE SERVICE
export const createUserActivity = async (activityDto) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:8080/userActivity/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityDto),
      mode: "cors", // mutlaka ekle
    });

    if (!response.ok) {
      throw new Error("Hata oluştu: " + response.statusText);
    }

    return response.json();
  } catch (error) {
    console.error("Hata:", error);
    throw error;
  }
};

export const createUserActivityFromGhostMenu = async (activityDto) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:8080/userActivity/ghostMenu",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(activityDto),
        mode: "cors",
      }
    );

    if (!response.ok) {
      throw new Error("Hata oluştu: " + response.statusText);
    }

    const text = await response.text();
    if (!text) return { ok: true };
    try {
      return JSON.parse(text);
    } catch {
      return { ok: true };
    }
  } catch (error) {
    console.error("Hata:", error);
    throw error;
  }
};

export const getProfileSummary = async () => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(PROFILE_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "include",
    });

    return response.json();
  } catch (error) {
    console.error("Profil özeti alınırken hata oluştu", error);
    throw error;
  }
};

export const getProfileSummaryByUsername = async (username) => {
  try {
    const token = sessionStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}profile/${username}`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) throw new Error("Profil getirilemedi");

    return await response.json();
  } catch (error) {
    console.error("Kullanıcı profili alınırken hata oluştu", error);
    throw error;
  }
};

export const getComments = async (targetType, targetId) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}comments`, {
    params: { targetType, targetId },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const createComment = async ({ targetType, targetId, body, spoiler = false }) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(
    `${BASE_URL}comments`,
    { targetType, targetId, body, spoiler: !!spoiler },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const toggleCommentLike = async (commentId) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(
    `${BASE_URL}comments/${commentId}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getGenrePreferences = async (username) => {
  const response = await axios.get(
    `${BASE_URL}genres/preferences/${encodeURIComponent(username)}`
  );
  return response.data;
};

export const getActivityRecent = async (limit = 12) => {
  const response = await axios.get(`${BASE_URL}activity/recent`, { params: { limit } });
  return response.data;
};

export const getActivityFeed = async (scope = "friends", limit = 40) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}activity/feed`, {
    params: { scope, limit },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const followUser = async (username) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(
    `${BASE_URL}activity/follow/${encodeURIComponent(username)}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const unfollowUser = async (username) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.delete(
    `${BASE_URL}activity/follow/${encodeURIComponent(username)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getFollowStats = async (username) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(
    `${BASE_URL}activity/follow/${encodeURIComponent(username)}/stats`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  return response.data;
};

// AUTH
export const loginAccount = async (param) => {
  try {
    const response = await axios.post(LOGIN_API, param);
    sessionStorage.setItem("token", response.data.token);
    sessionStorage.setItem("username", response.data.username);
    sessionStorage.setItem("profileName", response.data.profileName);
    sessionStorage.setItem("userRole", response.data.role);
    sessionStorage.setItem("emailAddress", param.email);
    if (response.data.avatarUrl) {
      sessionStorage.setItem("avatarUrl", response.data.avatarUrl);
    } else {
      sessionStorage.removeItem("avatarUrl");
    }
    if (response.data.contributionPoint != null) {
      sessionStorage.setItem("contributionPoint", String(response.data.contributionPoint));
    }
    
    console.log("loginAccount: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Create error:", error);
    throw error;
  }
};

export const extractApiErrorMessage = (error, fallback = "Bir hata oluştu.") => {
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Sunucuya bağlanılamadı. Backend (localhost:8080) çalışıyor mu?";
  }

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;

  const status = error.response?.status;
  if (status === 401 || status === 403) {
    return "E-posta veya şifre hatalı.";
  }
  if (status === 404) {
    return "İstenen kaynak bulunamadı.";
  }
  if (status >= 500) {
    return "Sunucu hatası oluştu. Lütfen tekrar deneyin.";
  }

  // Axios'un "Request failed with status code XXX" mesajını gösterme
  if (error.message?.startsWith("Request failed with status code")) {
    return fallback;
  }

  return error.message || fallback;
};

export const createAccount = async (param) => {
  try {
    const response = await axios.post(SIGNUP_API, param);
    return response.data;
  } catch (error) {
    console.error("Create error:", error);
    throw error;
  }
};

export const getProfileBookList = async (username, listType) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${BASE_URL}profile/${username}/list/${listType}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Liste alınamadı");
  return response.json();
};

export const createShowcase = async ({ bookId, quote }) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(
    `${BASE_URL}profile/showcases`,
    { bookId, quote },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const updateShowcase = async (id, { bookId, quote }) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.put(
    `${BASE_URL}profile/showcases/${id}`,
    { bookId, quote },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const deleteShowcase = async (id) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.delete(`${BASE_URL}profile/showcases/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getPendingAvatars = async () => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${BASE_URL}admin/pending-avatars`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const approveAvatar = async (userId) => {
  const token = sessionStorage.getItem("token");
  await fetch(`${BASE_URL}admin/pending-avatars/${userId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rejectAvatar = async (userId) => {
  const token = sessionStorage.getItem("token");
  await fetch(`${BASE_URL}admin/pending-avatars/${userId}/reject`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rateAuthor = async (authorId, rating) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${BASE_URL}authors/${authorId}/rate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating }),
  });
  if (!response.ok) throw new Error("Rating gönderilemedi");
};

export const updateProfile = async (payload) => {
  const token = sessionStorage.getItem("token");

  const response = await fetch(`${BASE_URL}profile/edit`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Profil güncellenemedi");
  }
  if (data?.avatarUrl) {
    sessionStorage.setItem("avatarUrl", resolveMediaUrl(data.avatarUrl));
  }
  if (data?.contributionPoint != null) {
    sessionStorage.setItem("contributionPoint", String(data.contributionPoint));
  }
  if (data?.role) {
    sessionStorage.setItem("userRole", data.role);
  }
  return data || {};
};

export const uploadAvatar = async (file) => {
  const token = sessionStorage.getItem("token");
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(`${BASE_URL}profile/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Fotoğraf yüklenemedi");
  }

  if (data?.avatarUrl) {
    sessionStorage.setItem("avatarUrl", resolveMediaUrl(data.avatarUrl));
  }
  if (data?.role) {
    sessionStorage.setItem("userRole", data.role);
  }
  return data || {};
};

// NOTIFICATIONS
export const getNotifications = async (limit = 30) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}notifications`, {
    params: { limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data?.count ?? 0;
};

export const markNotificationsRead = async (ids) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(
    `${BASE_URL}notifications/read`,
    ids?.length ? { ids } : {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const markNotificationRead = async (id) => {
  const token = sessionStorage.getItem("token");
  await axios.post(
    `${BASE_URL}notifications/${id}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const formatNotificationText = (n) => {
  const actor = n.actorUsername || "Birisi";
  const book = n.bookTitle || "bir kitap";
  switch (n.type) {
    case "FOLLOW":
      return { emphasis: actor, rest: " seni takip etti" };
    case "COMMENT_LIKE":
      return { emphasis: actor, rest: " yorumunu beğendi" };
    case "SAME_BOOK":
      if ((n.count || 1) <= 1) {
        return { emphasis: actor, rest: ` ${book} okuyor` };
      }
      return { emphasis: `${n.count} kişi`, rest: ` ${book} kitabını da okuyor` };
    case "WEEKLY_PICK_COMMENT":
      return { emphasis: null, rest: `Haftanın kitabına yorum geldi: ${book}` };
    case "AVATAR_APPROVED":
      return { emphasis: null, rest: "Profil fotoğrafın onaylandı" };
    case "AVATAR_REJECTED":
      return { emphasis: null, rest: "Profil fotoğrafın reddedildi — yeni bir foto yükleyebilirsin" };
    default:
      return { emphasis: null, rest: "Yeni bildirim" };
  }
};

export const AVATAR_UPLOAD_MIN_SCORE = 100; // deprecated — avatar artık puana bağlı değil

/** Katkı puanı kapılarını bypass eden roller (ileride başka özellikler için) */
export const SCORE_BYPASS_ROLES = ["ADMIN", "MODERATOR", "PRO"];

export const isScoreBypassRole = (role) =>
  SCORE_BYPASS_ROLES.includes(String(role || "").toUpperCase());

export const isStaffRole = (role) => {
  const r = String(role || "").toUpperCase();
  return r === "ADMIN" || r === "MODERATOR";
};

export const isAdminRole = (role) => String(role || "").toUpperCase() === "ADMIN";

/** PRO plan (ve üzeri staff) — doğrulanmış rozet */
export const isProPlanRole = (role) => {
  const r = String(role || "").toUpperCase();
  return r === "PRO" || r === "ADMIN" || r === "MODERATOR";
};
