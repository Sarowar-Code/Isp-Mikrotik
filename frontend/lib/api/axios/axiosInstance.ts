import axios, { AxiosError, AxiosInstance } from "axios";

export type UserRole = "superadmin" | "admin" | "reseller";

// ✅ Base API URL with validation
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not defined');
}

// ✅ Role-based base URLs (optional, if needed per role)
const ROLE_BASE_URLS: Record<UserRole, string> = {
  superadmin: `${API_URL}/superadmin`,
  admin: `${API_URL}/admin`,
  reseller: `${API_URL}/reseller`,
};

// ✅ Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ include cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Dynamically switch baseURL if "role" header is set
    const role = config.headers["role"] as UserRole | undefined;
    if (role && ROLE_BASE_URLS[role]) {
      config.baseURL = ROLE_BASE_URLS[role];
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ✅ Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn(
        "⚠️ Unauthorized: Redirect to login or handle token refresh."
      );
      // Optionally, you can redirect or trigger logout here.
    }

    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
