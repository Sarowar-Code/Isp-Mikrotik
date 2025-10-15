import axiosInstance, { UserRole } from "@/lib/api/axios/axiosInstance";
import { AxiosError } from "axios";

// Types for SuperAdmin API
export interface SuperAdminRegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface AdminRegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  contact: string;
  whatsapp: string;
  nid: string;
  address: {
    thana: string;
    district: string;
    division: string;
  };
  avatar?: File;
}

export interface SuperAdminResponse {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminResponse {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  contact: string;
  whatsapp: string;
  nid: string;
  address: {
    thana: string;
    district: string;
    division: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ================================
// SuperAdmin Registration API
// ================================

/**
 * Register a new SuperAdmin
 */
export async function registerSuperAdmin(data: SuperAdminRegisterData) {
  try {
    const res = await axiosInstance.post("/register", data, {
      headers: {
        role: "superadmin" as UserRole,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err: unknown) {
    console.error("SuperAdmin Register API error:", err);
    if (err instanceof AxiosError) {
      throw err.response?.data || { message: "Network error" };
    }
    throw { message: "An unexpected error occurred" };
  }
}

/**
 * Refresh SuperAdmin access token
 */
export async function refreshSuperAdminToken() {
  try {
    const res = await axiosInstance.post(
      "/refresh-token",
      {},
      {
        headers: { role: "superadmin" as UserRole },
      }
    );
    return res.data;
  } catch (err: unknown) {
    console.error("SuperAdmin Refresh Token API error:", err);
    if (err instanceof AxiosError) {
      throw err.response?.data || { message: "Network error" };
    }
    throw { message: "An unexpected error occurred" };
  }
}

// ================================
// Admin Management APIs (by SuperAdmin)
// ================================

/**
 * Register a new Admin (SuperAdmin only)
 */
export async function registerAdmin(data: AdminRegisterData) {
  try {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("contact", data.contact);
    formData.append("whatsapp", data.whatsapp);
    formData.append("nid", data.nid);
    formData.append("address", JSON.stringify(data.address));
    if (data.avatar) {
      formData.append("avatar", data.avatar);
    }

    const res = await axiosInstance.post("/registerAdmin", formData, {
      headers: {
        role: "superadmin" as UserRole,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err: unknown) {
    console.error("Register Admin API error:", err);
    if (err instanceof AxiosError) {
      throw err.response?.data || { message: "Network error" };
    }
    throw { message: "An unexpected error occurred" };
  }
}

/**
 * Get all Admins (SuperAdmin only)
 */
export async function getAllAdmins(): Promise<AdminResponse[]> {
  try {
    const res = await axiosInstance.get("/getAllAdmins", {
      headers: { role: "superadmin" as UserRole },
    });
    return res.data.data;
  } catch (err: unknown) {
    console.error("Get All Admins API error:", err);
    if (err instanceof AxiosError) {
      throw err.response?.data || { message: "Network error" };
    }
    throw { message: "An unexpected error occurred" };
  }
}

/**
 * Get Admin by ID (SuperAdmin only)
 */
export async function getAdminById(adminId: string): Promise<AdminResponse> {
  try {
    const res = await axiosInstance.get(`/getAdmin?id=${adminId}`, {
      headers: { role: "superadmin" as UserRole },
    });
    return res.data.data;
  } catch (err: unknown) {
    console.error("Get Admin By ID API error:", err);
    if (err instanceof AxiosError) {
      throw err.response?.data || { message: "Network error" };
    }
    throw { message: "An unexpected error occurred" };
  }
}

/**
 * Delete Admin by ID (SuperAdmin only)
 */
export async function deleteAdminById(adminId: string) {
  try {
    const res = await axiosInstance.delete(`/deleteAdmin?id=${adminId}`, {
      headers: { role: "superadmin" as UserRole },
    });
    return res.data;
  } catch (err: unknown) {
    console.error("Delete Admin API error:", err);
    if (err instanceof AxiosError) {
      throw err.response?.data || { message: "Network error" };
    }
    throw { message: "An unexpected error occurred" };
  }
}
