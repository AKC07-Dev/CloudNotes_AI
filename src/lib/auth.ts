const TOKEN_KEY = "cloudnotes_token";
const USER_KEY = "cloudnotes_user";

export interface StoredUser {
  userId?: string;
  email?: string;
  fullName?: string;
  username?: string;
  avatar?: string;
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function saveUser(user: StoredUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    return JSON.parse(user) as StoredUser;
  } catch {
    return null;
  }
}

export function getEmail(): string | null {
  return getUser()?.email ?? null;
}

export function isLoggedIn() {
  return !!getToken();
}

export function authHeader() {
  const token = getToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

/** Admin email — only this account sees the Admin UI */
export const ADMIN_EMAIL = "akc07.genai@gmail.com";

export function isAdmin(): boolean {
  const email = getEmail();
  return email === ADMIN_EMAIL;
}
