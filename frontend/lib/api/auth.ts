import { API } from "@/lib/api/axios/apiEndpoints";
import axiosInstance from "@/lib/api/axios/axiosInstance";

export type Role = "superadmin" | "admin" | "reseller";

// Login user
export async function loginUser(
  role: Role,
  data: { email: string; password: string }
) {
  try {
    const res = await axiosInstance.post(`${API[role].login}`, data);
    return res.data;
  } catch (err: unknown) {
    console.error("Login API error:", err);
    throw err.response?.data || { message: "Network error" };
  }
}

// Logout user
export async function logoutUser(role: Role) {
  try {
    const res = await axiosInstance.post(`${API[role].logout}`);
    return res.data;
  } catch (err: unknown) {
    console.error("Logout API error:", err);
    throw err.response?.data || { message: "Network error" };
  }
}

// Get current auth user
export async function getCurrentAuth(role: Role) {
  try {
    const res = await axiosInstance.get(`${API[role].getCurrentAuthDetails}`);
    return res.data.data; // ✅ your backend returns { data, message, success }
  } catch (err: unknown) {
    console.error("Get Current Auth API error:", err);
    throw err.response?.data || { message: "Network error" };
  }
}
