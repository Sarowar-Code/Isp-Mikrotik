// lib/api/auth.ts
export type Role = "superadmin" | "admin" | "reseller";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginUser(
  role: Role,
  data: { email: string; password: string }
) {
  try {
    const res = await fetch(`${API_URL}/${role}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ important for cookies
      body: JSON.stringify(data),
    });

    return res;
  } catch (err) {
    console.error("Login API error:", err);
    throw new Error("Network error. Please try again.");
  }
}

export async function logoutUser(role: Role) {
  try {
    const res = await fetch(`${API_URL}/${role}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    return res;
  } catch (err) {
    console.error("Logout API error:", err);
    throw new Error("Network error. Please try again.");
  }
}

export async function getCurrentAuth(
  role: "superadmin" | "admin" | "reseller"
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/${role}/getCurrentAuthDetails`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // include cookies
      }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    console.log("data", data);
    return data.data; // ✅ return only the user data
  } catch (err) {
    console.error("Get Current Auth API error:", err);
    throw new Error("Network error. Please try again.");
  }
}
