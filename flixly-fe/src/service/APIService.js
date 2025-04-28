import axios from "axios";

const BASE_URL = "http://localhost:8080/"; // Backend URL

const BOOKS_API = BASE_URL + "books/"; // Backend URL
const AUTHOR_API = BASE_URL + "authors/"; // Backend URL
const PROFILE_API = BASE_URL + "profile/"; // Backend URL
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

export const createUserActivity = async (param) => {
  try {
    console.log("createUserActivity", param);
    const response = await axios.post(USER_ACTIVITY_API, param);
    return response.data;
  } catch (error) {
    console.error("Create error:", error);
    throw error;
  }
};

export const getProfileSummary = async () => {
  try {
    const response = await axios.get(PROFILE_API);
    return response.data;
  } catch (error) {
    console.error("Profil özeti alınırken hata oluştu", error);
    throw error;
  }
};
