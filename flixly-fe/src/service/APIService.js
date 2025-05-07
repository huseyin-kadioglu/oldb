import axios from "axios";

const BASE_URL = "http://localhost:8080/"; // Backend URL

const BOOKS_API = BASE_URL + "books/"; // Backend URL
const AUTHOR_API = BASE_URL + "authors/"; // Backend URL
const PROFILE_API = BASE_URL + "profile/"; // Backend URL
const SIGNUP_API = BASE_URL + "api/auth/signup";
const LOGIN_API = BASE_URL + "api/auth/login";
const USER_ACTIVITY_API = BASE_URL + "userActivity/"; // Backend URL

export const getBooks = async () => {
  try {
    const response = await axios.get(BOOKS_API);
    return response.data;
  } catch (error) {
    console.error("Kitaplar alınırken hata oluştu:", error);
    throw error;
  }
};

export const loginAccount = async (param) => {
  try {
    console.log("loginAccount", param);
    const response = await axios.post(LOGIN_API, param);
    console.log("login res", response);
    sessionStorage.setItem("token", response.data.token);
    sessionStorage.setItem("username", response.data.username);

    return response.data;
  } catch (error) {
    console.error("Create error:", error);
    throw error;
  }
};

export const createAccount = async (param) => {
  try {
    console.log("creatcreateAccounteUserActivity", param);
    const response = await axios.post(SIGNUP_API, param);
    return response.data;
  } catch (error) {
    console.error("Create error:", error);
    throw error;
  }
};

export const getAuthorById = async (id) => {
  console.log("getAuthorById: " + id);
  try {
    const response = await axios.get(`${AUTHOR_API}${id}`);
    return response.data;
  } catch (error) {
    console.error("Yazarlar alınırken hata oluştu:", error);
    throw error;
  }
};

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
    });

    // Yanıtın başarılı olup olmadığını kontrol et
    if (!response.ok) {
      throw new Error("Hata oluştu: " + response.statusText);
    }

    // Cevabın JSON olup olmadığını kontrol et
    const responseText = await response.text(); // JSON olmayan veri durumunda
    const responseData = responseText ? JSON.parse(responseText) : null; // JSON parse et

    console.log("Response Data:", responseData); // JSON verisini yazdır

    return responseData;
  } catch (error) {
    console.error("Hata:", error);
    throw error;
  }
};

export const getProfileSummary = async () => {
  try {
    const token = sessionStorage.getItem("token");

    console.log("getProfileSummary, token: ", token);
    const response = await fetch(PROFILE_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      mode: "cors", // mutlaka ekle
      credentials: "include", // Eğer cookie ile auth varsa
    });
    console.log("response", response);

    return response.json();
  } catch (error) {
    console.error("Profil özeti alınırken hata oluştu", error);
    throw error;
  }
};
