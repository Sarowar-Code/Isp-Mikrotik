import axios, { AxiosError, AxiosInstance } from "axios";
import { ROLE_BASE_URLS } from "./roles";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // important for sending cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Optional: Add interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    const role = config.headers["role"];
    if (role) {
      config.baseURL = ROLE_BASE_URLS[role as UserRole];
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: Redirect to login or refresh token");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
