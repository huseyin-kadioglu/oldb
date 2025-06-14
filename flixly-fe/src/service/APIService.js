import axios from "axios";

const BASE_URL = "http://localhost:8080/"; // Backend URL

const BOOKS_API = BASE_URL + "books/"; // Backend URL
const BOOKS_BY_YEAR_API = BASE_URL + "books/publishYear/"; // Backend URL
const AUTHOR_API = BASE_URL + "authors/"; // Backend URL
const PROFILE_API = BASE_URL + "profile/"; // Backend URL
const BOOK_APPROVAL_API = BASE_URL + "book-approvals";
const SIGNUP_API = BASE_URL + "api/auth/signup";
const LOGIN_API = BASE_URL + "api/auth/login";
const USER_ACTIVITY_API = BASE_URL + "userActivity/"; // Backend URL

export const getBooks = async () => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(BOOKS_API, {
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
    console.error("Kitaplar alınırken hata oluştu:", error);
    throw error;
  }
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

export const loginAccount = async (param) => {
  try {
    const response = await axios.post(LOGIN_API, param);
    sessionStorage.setItem("token", response.data.token);
    sessionStorage.setItem("username", response.data.profileName);
    sessionStorage.setItem("userRole", response.data.role);
    console.log(response.data);
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

export const getAuthorById = async (id) => {
  try {
    const response = await axios.get(`${AUTHOR_API}${id}`);
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
  console.log("token", token);
  console.log("createUserActivityFromGhostMenu params:", activityDto);

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

    return response.json();
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
