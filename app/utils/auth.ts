import { useEffect, useState } from "react";

const AUTH_KEY = "teko_admin_session";
const ADMIN_USERNAME = "teko-lagoon";
const ADMIN_PASSWORD = "teniskomedi2025";
const AUTH_EVENT = "teko_auth_change";

export function login(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "1");
    window.dispatchEvent(new Event(AUTH_EVENT));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const check = () => setIsAdmin(localStorage.getItem(AUTH_KEY) === "1");
    check();
    window.addEventListener(AUTH_EVENT, check);
    return () => window.removeEventListener(AUTH_EVENT, check);
  }, []);
  return isAdmin;
}
