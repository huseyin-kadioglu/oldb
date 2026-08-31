import COPY from "../copy";
import { showToast } from "./uiEvents";

export const AUTH_KEYS = [
  "token",
  "username",
  "profileName",
  "userRole",
  "emailAddress",
  "avatarUrl",
  "contributionPoint",
];

const REMEMBER_PREF_KEY = "oldb_remember_me";

let expiredNotified = false;

const readJwtExpiryMs = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json)?.exp;
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  const exp = readJwtExpiryMs(token);
  if (!exp) return false;
  return Date.now() >= exp;
};

export const getRememberMePreference = () => localStorage.getItem(REMEMBER_PREF_KEY) !== "0";

export const setRememberMePreference = (rememberMe) => {
  localStorage.setItem(REMEMBER_PREF_KEY, rememberMe ? "1" : "0");
};

const readStored = (key) => sessionStorage.getItem(key) || localStorage.getItem(key);

export const getAuthToken = () => {
  const token = readStored("token");
  if (!token) return null;
  if (isTokenExpired(token)) {
    expireSession();
    return null;
  }
  return token;
};

export const setAuthItem = (key, value) => {
  if (value == null || value === "") {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
    return;
  }
  const text = String(value);
  sessionStorage.setItem(key, text);
  if (localStorage.getItem("token")) {
    localStorage.setItem(key, text);
  }
};

export const persistAuth = (fields, rememberMe = true) => {
  setRememberMePreference(rememberMe);
  const primary = rememberMe ? localStorage : sessionStorage;
  const secondary = rememberMe ? sessionStorage : localStorage;
  AUTH_KEYS.forEach((key) => secondary.removeItem(key));
  Object.entries(fields).forEach(([key, value]) => {
    if (value == null || value === "") {
      primary.removeItem(key);
      sessionStorage.removeItem(key);
      return;
    }
    const text = String(value);
    primary.setItem(key, text);
    sessionStorage.setItem(key, text);
  });
};

export const clearAuth = () => {
  AUTH_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
  expiredNotified = false;
};

export const expireSession = () => {
  const hadToken = !!(sessionStorage.getItem("token") || localStorage.getItem("token"));
  clearAuth();
  if (hadToken && !expiredNotified) {
    expiredNotified = true;
    window.dispatchEvent(new CustomEvent("oldb:session-expired"));
    showToast(COPY.auth.sessionExpired);
  }
};

/** Tab açılışında kalıcı oturumu sessionStorage'a kopyala (mevcut okumalar çalışsın). */
export const hydrateAuth = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearAuth();
    return null;
  }
  AUTH_KEYS.forEach((key) => {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value != null) sessionStorage.setItem(key, value);
  });
  return token;
};
