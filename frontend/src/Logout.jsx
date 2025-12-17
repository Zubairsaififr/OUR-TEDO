// src/Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Clear tokens from localStorage
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // ✅ Redirect to login page
    navigate("/");
  }, [navigate]);

  return null; // kuch render karne ki zarurat nahi
}

export default Logout;
