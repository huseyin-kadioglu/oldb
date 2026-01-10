import axios from "axios";

const BASE_URL = "http://localhost:8080/"; // Backend URL

const BOOKS_API = BASE_URL + "books/"; // Backend URL
const BOOKS_BY_YEAR_API = BASE_URL + "books/publishYear/"; // Backend URL
const AUTHOR_API = BASE_URL + "authors/"; // Backend URL
const PROFILE_API = BASE_URL + "profile/"; // Backend URL
const BOOK_APPROVAL_API = BASE_URL + "book-approvals";
const AUTHOR_APPROVAL_API = BASE_URL + "author-approvals";
const SIGNUP_API = BASE_URL + "api/auth/signup";
const LOGIN_API = BASE_URL + "api/auth/login";
const USER_ACTIVITY_API = BASE_URL + "userActivity/"; // Backend URL

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

export const getProfileSummaryByUsername = async (username) => {
  try {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`${BASE_URL}profile/${username}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Profil getirilemedi");

    return await response.json();
  } catch (error) {
    console.error("Kullanıcı profili alınırken hata oluştu", error);
    throw error;
  }
};


// AUTH
export const loginAccount = async (param) => {
  try {
    const response = await axios.post(LOGIN_API, param);
    sessionStorage.setItem("token", response.data.token);
    sessionStorage.setItem("username", response.data.profileName);
    sessionStorage.setItem("userRole", response.data.role);
    sessionStorage.setItem("emailAddress", response.data.username);
    
    console.log("loginAccount: ", response.data);
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
