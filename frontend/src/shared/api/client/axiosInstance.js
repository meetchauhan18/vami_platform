// src/shared/api/client/axiosInstance.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}${
    import.meta.env.VITE_API_VERSION
  }`,
  timeout: 10000,
  withCredentials: true,
});
