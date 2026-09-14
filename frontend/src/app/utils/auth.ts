// Auth utility functions for managing user authentication state

export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  phoneNumber: string;
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}

export function getCurrentUser(): User | null {
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("userEmail");
  const fullName = localStorage.getItem("userFullName");
  const role = localStorage.getItem("userRole");
  const phoneNumber = localStorage.getItem("userPhone");

  if (!userId || !email) {
    return null;
  }

  return {
    userId: parseInt(userId),
    email,
    fullName: fullName || "",
    role: role || "CUSTOMER",
    phoneNumber: phoneNumber || "",
  };
}

export function getUserId(): number | null {
  const userId = localStorage.getItem("userId");
  return userId ? parseInt(userId) : null;
}

export function setAuthData(data: {
  userId: number;
  accessToken: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber: string;
}): void {
  localStorage.setItem("token", data.accessToken);
  localStorage.setItem("userId", data.userId.toString());
  localStorage.setItem("userEmail", data.email);
  localStorage.setItem("userFullName", data.fullName);
  localStorage.setItem("userRole", data.role);
  localStorage.setItem("userPhone", data.phoneNumber);
}

export function clearAuthData(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userFullName");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userDob");
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}
