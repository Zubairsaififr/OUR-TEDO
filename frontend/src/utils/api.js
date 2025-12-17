// src/utils/api.js
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  clearTokens,
  API_URL_BASE,
} from "./auth";

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_URL_BASE}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      clearTokens();
      return false;
    }

    const data = await res.json();
    if (data?.access) {
      saveAccessToken(data.access);
      return true;
    } else {
      clearTokens();
      return false;
    }
  } catch (error) {
    console.error("Refresh token failed:", error);
    clearTokens();
    return false;
  }
};

export const apiFetch = async (path, options = {}) => {
  const url = `${API_URL_BASE}${path}`;
  let token = getAccessToken();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": options.headers?.["Content-Type"] ?? "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Try refreshing access token
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      token = getAccessToken();
      headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(url, { ...options, headers }); // retry once
    } else {
      // refresh bhi fail => logout
      clearTokens();
      return Promise.reject(new Error("Unauthorized. Please log in again."));
    }
  }

  return res;
};
