import { handleApiError } from "@/utils/handleApiError";
import axiosInstance from "./axiosInstance";
import { UserRole } from "./roles";

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export class ApiClient {
  static async get<T>(url: string, role?: UserRole): Promise<ApiResponse<T>> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<T>>(url, { role });
      return data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }

  static async post<T>(
    url: string,
    body: unknown,
    role?: UserRole
  ): Promise<ApiResponse<T>> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<T>>(url, body, {
        role,
      });
      return data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }

  static async put<T>(
    url: string,
    body: unknown,
    role?: UserRole
  ): Promise<ApiResponse<T>> {
    try {
      const { data } = await axiosInstance.put<ApiResponse<T>>(url, body, {
        role,
      });
      return data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }

  static async delete<T>(
    url: string,
    role?: UserRole
  ): Promise<ApiResponse<T>> {
    try {
      const { data } = await axiosInstance.delete<ApiResponse<T>>(url, {
        role,
      });
      return data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }
}
