import axios from "axios";

const API_URL = "http://localhost:8080/books/"; // Backend URL


export const getBooks = async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Kitaplar alınırken hata oluştu:", error);
      throw error;
    }
  };