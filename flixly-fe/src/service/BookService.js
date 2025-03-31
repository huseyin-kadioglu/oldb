import axios from "axios";

const BASE_URL = "http://localhost:8080/"; // Backend URL

const BOOKS_API = BASE_URL + "books/"; // Backend URL
const PROFILE_API = BASE_URL + "profile/"; // Backend URL


export const getBooks = async () => {
    try {
      const response = await axios.get(BOOKS_API);
      return response.data;
    } catch (error) {
      console.error("Kitaplar alınırken hata oluştu:", error);
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