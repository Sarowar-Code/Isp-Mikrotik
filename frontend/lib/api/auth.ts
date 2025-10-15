import axiosInstance, { UserRole } from "@/lib/api/axios/axiosInstance";
import { AxiosError } from "axios";

// Use consistent type naming
export type Role = UserRole;

// Login user
export async function loginUser(
  role: Role,
  data: { email: string; password: string }
) {
  try {
    // Use role header to leverage role-based URL switching in axiosInstance
    const res = await axiosInstance.post("/login", data, {
      headers: { role },
    });
    return res.data;
  } catch (err: unknown) {
    console.error("Login API error:", err);
    if (err instanceof AxiosError) {
      throw err.response?.data || { message: "Network error" };
    }
    throw { message: "An unexpected error occurred" };
  }
}

// Logout user
export async function logoutUser(role: Role) {
  try {
    const res = await axiosInstance.post(
      "/logout",
      {},
      {
        headers: { role },
      }
    );
    return res.data;
  } catch (err: unknown) {
    console.error("Logout API error:", err);
    if (err instanceof AxiosError) {
      throw err.response?.data || { message: "Network error" };
    }
    throw { message: "An unexpected error occurred" };
  }
}

// Get current auth user
export async function getCurrentAuth(role: Role) {
  try {
    const res = await axiosInstance.get("/getCurrentAuthDetails", {
      headers: { role },
    });
    return res.data.data; // ✅ your backend returns { data, message, success }
  } catch (err: unknown) {
    console.error("Get Current Auth API error:", err);
    if (err instanceof AxiosError) {
      throw err.response?.data || { message: "Network error" };
    }
    throw { message: "An unexpected error occurred" };
  }
}
