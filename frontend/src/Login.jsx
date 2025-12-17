import React, { useState, useEffect } from "react";
import bg from "./assets/TEDO_BG.png";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import api from "./api"; // 👈 ab axios ki jagah ye use hoga

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Agar already login hai to direct dashboard bhej do
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      let result = await api.post("auth/login/", {
        username: username,
        password: password,
      });

      console.log("Login success:", result.data);

      // ✅ Save tokens + username in localStorage
      localStorage.setItem("access_token", result.data.access);
      localStorage.setItem("refresh_token", result.data.refresh);
      localStorage.setItem("username", username);

      // 👇 Immediately update api default headers
      api.defaults.headers.common["Authorization"] = `Bearer ${result.data.access}`;

      setLoading(false);

      // ✅ Replace history so login page back me na aaye
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.log(error);
      setLoading(false);

      if (error?.response?.data?.error === "Your account is pending approval") {
        setErr("Your account is pending approval. Please wait for admin approval.");
      } else if (error?.response?.data?.detail) {
        setErr(error.response.data.detail);
      } else {
        setErr("Invalid credentials. Please try again.");
      }
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <form
        className="w-[90%] h-[600px] max-w-[500px] bg-[#00000069] backdrop-blur-sm shadow-lg shadow-black rounded-lg flex flex-col justify-center items-center p-8 gap-[20px] px-[30px]"
        onSubmit={handleLogin}
      >
        <h1 className="text-gray-800 text-[30px] font-semibold mb-[30px]">
          Log in to <span className="text-white">TEDO MAKER</span>
        </h1>

        <div className=" w-120 border-2 border-[#0006] rounded-full flex relative">
          <input
            type="text"
            placeholder="Username"
            className="w-110 h-[60px] outline-none bg-transparent placeholder-gray-300 rounded-full text-[20px] mb-[10px] transform translate-x-4"
            required
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>

        <div className="w-120 border-2 border-[#0006] rounded-full flex relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className="w-120 h-[60px] outline-none bg-transparent placeholder-gray-300 rounded-full text-[20px] mb-[10px] transform translate-x-4"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {showPassword ? (
            <IoIosEyeOff
              className="absolute top-[15px] right-[20px] w-[22px] h-[22px] cursor-pointer text-white transform -translate-x-4 translate-y-5"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <IoIosEye
              className="absolute top-[15px] right-[20px] w-[22px] h-[22px] cursor-pointer text-white transform -translate-x-4 translate-y-5"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {err && <p className="text-red-500 text-[17px]">{err}</p>}

        <button
          className={`min-w-[150px] h-[60px] rounded-full text-[20px] mt-[10px] text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-500 hover:bg-gray-600 cursor-pointer"
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Log In"}
        </button>

        <p className="text-white text-[16px] cursor-pointer">
          Create a New Account.
          <span
            className="cursor-pointer text-blue-300 pl-[5px]"
            onClick={() => navigate("/register")}
          >
            &nbsp; Register
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
