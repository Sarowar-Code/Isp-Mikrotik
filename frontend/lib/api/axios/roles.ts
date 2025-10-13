export type UserRole = "superadmin" | "admin" | "reseller";

export const ROLE_BASE_URLS: Record<UserRole, string> = {
  superadmin: `${process.env.NEXT_PUBLIC_API_URL}/superadmin`,
  admin: `${process.env.NEXT_PUBLIC_API_URL}/admin`,
  reseller: `${process.env.NEXT_PUBLIC_API_URL}/reseller`,
};
