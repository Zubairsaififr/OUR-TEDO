// src/utils/auth.js
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const saveTokens = ({ access, refresh }) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};

export const saveAccessToken = (access) => {
  localStorage.setItem("access_token", access);
};

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");
export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const API_URL_BASE = API_URL;
