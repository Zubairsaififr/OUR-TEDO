// // src/utils/subscription.js
// import api from "../api";

// // ye helper backend se fresh subscription status fetch karega
// export const updateSubscriptionStatus = async () => {
//   try {
//     const res = await api.get("http://localhost:8000/api/auth/me/");
//     const active = res.data.has_active_subscription || false;

//     // localStorage update
//     localStorage.setItem("subscription_active", active ? "true" : "false");

//     return active;
//   } catch (error) {
//     console.error("Error fetching subscription status:", error);
//     localStorage.setItem("subscription_active", "false");
//     return false;
//   }
// };

// src/utils/subscription.js
import { apiFetch } from "./api";

export const updateSubscriptionStatus = async () => {
  try {
    const res = await apiFetch("/api/auth/me/");
    if (!res.ok) throw new Error("Failed to fetch subscription status");

    const data = await res.json();
    const active = data.has_active_subscription || false;

    localStorage.setItem("subscription_active", active ? "true" : "false");

    return active;
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    localStorage.setItem("subscription_active", "false");
    return false;
  }
};
