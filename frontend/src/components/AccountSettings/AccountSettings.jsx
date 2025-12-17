import React, { useState, useEffect } from "react";
import "./AccountSettings.css";
import API from "../../api";  // <-- ab apne api.js use karna
import Side from '../Side/side'

export default function AccountSettings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch logged in user details
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me/");
      setUsername(res.data.username || "");  // 👈 fallback
      setEmail(res.data.email || "");        // 👈 fallback
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };
  fetchUser();
}, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/auth/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (res.status === 200) {
        setMessage("Password changed successfully ✅");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      setMessage("❌ Error changing password. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
     <div id="doremon">
    <div>
      
    <Side/>
    </div>
    <div className="settings-container">
      <div className="settings-content">
        <h2>Account Settings</h2>
     

        <form onSubmit={handlePasswordChange} className="form-box">
          <div className="input-group">
            <label id="jaanu">Username</label>
           <input type="text" value={username || ""} disabled />
          </div>

          <div className="input-group">
            <label id="jaanu">Email</label>
            <input type="email" value={email || ""} disabled />
          </div>

          <div className="input-group">
            <label id="jaanu">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label id="jaanu">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="actionsf">
            <button id="we" type="button" className="cancel-btn">Cancel</button>
            <button id="we" type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
   

    </div>
    </>
  );
}
