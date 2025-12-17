import React from "react";
import { Navigate } from "react-router-dom";

const getAccessToken = () => {
  return localStorage.getItem("access_token"); // ✅ same key as Login.jsx
};

function ProtectedRoute({ children }) {
  const token = getAccessToken();
  return token ? children : <Navigate to="/" replace />; // ✅ replace added
}

export default ProtectedRoute;
