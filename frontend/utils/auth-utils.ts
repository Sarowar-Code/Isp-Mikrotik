import { logoutUser } from "../lib/api/auth";
import { UserRole } from "../lib/api/axios/axiosInstance";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

/*
 * Check if user is authenticated by verifying token exists
 */

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  // Check if accessToken cookie exists
  return document.cookie.includes("accessToken=");
}

/**
 * Get current user role from token (client-side)
 * Note: This is for UI purposes only, server-side validation is still required
 */

export function getCurrentUserRole(): UserRole | null {
  if (typeof window === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );

    if (!tokenCookie) return null;

    const token = tokenCookie.split("=")[1];
    if (!token) return null;

    // Decode JWT payload (without verification - for client-side use only)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Clear authentication data (logout)
 */

export function clearAuth(): void {
  if (typeof window === "undefined") return;

  // Clear the accessToken cookie
  document.cookie =
    "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/**
 * Perform complete logout (API call + clear local auth)
 */
export async function performLogout(role: UserRole): Promise<void> {
  try {
    // Call logout API to invalidate server-side session
    await logoutUser(role);
  } catch (error) {
    console.warn("Logout API call failed:", error);
    // Continue with local cleanup even if API call fails
  } finally {
    // Always clear local auth data
    clearAuth();

    // Redirect to login page
    redirectToLogin();
  }
}

/**
 * Redirect to appropriate login page based on current path
 */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;

  // Determine role from current path
  if (currentPath.startsWith("/superadmin")) {
    window.location.href = "/superadmin/login";
  } else if (currentPath.startsWith("/admin")) {
    window.location.href = "/admin/login";
  } else if (currentPath.startsWith("/reseller")) {
    window.location.href = "/reseller/login";
  } else {
    window.location.href = "/";
  }
}
