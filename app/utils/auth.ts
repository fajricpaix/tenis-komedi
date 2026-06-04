import { useEffect, useState } from "react";

const AUTH_KEY = "teko_admin_session";
const ADMIN_USERNAME = "teko-lagoon";
const ADMIN_PASSWORD = "teniskomedi2025";

export function login(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(localStorage.getItem(AUTH_KEY) === "1");
  }, []);
  return isAdmin;
}
