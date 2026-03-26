import { User } from "../types";

export const clientStorage = {
  setUser(key: string, user: User) {
    localStorage.setItem(key, JSON.stringify(user));
  },
  getUser(key: string): User | null {
    const user = localStorage.getItem(key);
    return user ? JSON.parse(user) : null;
  },
  clearUser(key: string) {
    localStorage.removeItem(key);
  },
  setRememberMe(key: string, value: boolean) {
    localStorage.setItem(key, String(value));
  },
  getRememberMe(key: string) {
    const value = localStorage.getItem(key);
    return value ? true : false;
  },
  clearRememberMe(key: string) {
    localStorage.removeItem(key);
  },
};

export const sessionStore = {
  setUser(key: string, user: User) {
    sessionStorage.setItem(key, JSON.stringify(user));
  },
  clearUser(key: string) {
    sessionStorage.removeItem(key);
  },
};
