import React, { useState } from "react";
import bg from "./assets/TEDO_BG.png";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conpassword, setConPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(""); // ✅ success state
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    if (password !== conpassword) {
      setErr("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      let result = await axios.post("http://localhost:8000/api/auth/register/", {
        username: name,
        email: email,
        password: password,
        confirm_password: conpassword,
      });

      console.log("Signup success:", result.data);
      setLoading(false);

      // ✅ Success message show karo
      setSuccess("Registration successful! Please wait for admin approval.");

      // 2 sec baad login page pe redirect
      setTimeout(() => navigate("/"), 2000);

    } catch (error) {
      console.log(error.response?.data);
      setLoading(false);
      setErr(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex items-center justify-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <form
        className="w-[90%] max-w-[500px] h-[600px] bg-[#00000069] backdrop-blur-sm shadow-lg shadow-black rounded-lg flex flex-col justify-center items-center p-[80px] gap-[20px] px-[40px]"
        onSubmit={handleSignUp}
      >
        <h1 className="text-gray-800 text-[30px] font-semibold mb-[30px] w-full text-center">
          Register to <span className="text-[30px] text-white">TEDO MAKER</span>
        </h1>

        {/* Username */}
        <div className="w-120 h-[60px] outline-none border-2 border-[#0006] rounded-full">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-110 bg-transparent placeholder-gray-300 pl-[50px] pr-[50px] rounded-full text-[20px] transform translate-y-3 translate-x-3 outline-none"
            placeholder="Username"
            required
          />
        </div>

        {/* Email */}
        <div className="w-120 h-[60px] outline-none border-2 border-[#0006] rounded-full">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-100 bg-transparent placeholder-gray-300 pl-[50px] pr-[50px] outline-none rounded-full text-[20px] transform translate-y-3 translate-x-3"
            placeholder="Email"
            required
          />
        </div>

        {/* Password */}
        <div className="border-2 border-[#0006] rounded-full flex relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="w-113 h-[52px] outline-none bg-transparent placeholder-gray-300 pl-[50px] pr-[50px] text-[20px] transform translate-x-2"
            placeholder="Password"
          />
          {!showPassword ? (
            <IoIosEye
              className="absolute top-[15px] right-[20px] w-[22px] h-[22px] cursor-pointer text-white  transform -translate-x-4 translate-y-3.5"
              onClick={() => setShowPassword(true)}
            />
          ) : (
            <IoIosEyeOff
              className="absolute top-[15px] right-[20px] w-[22px] h-[22px] cursor-pointer text-white transform -translate-x-4 translate-y-3.5"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>

        {/* Confirm Password */}
        <div className="border-2 border-[#0006] rounded-full flex relative">
          <input
            type={showPassword1 ? "text" : "password"}
            onChange={(e) => setConPassword(e.target.value)}
            required
            className="w-113 h-[52px] outline-none bg-transparent placeholder-gray-300 pl-[50px] pr-[50px] rounded-full text-[20px] transform translate-x-2"
            placeholder="Confirm Password"
            value={conpassword}
          />
          {!showPassword1 ? (
            <IoIosEye
              className="absolute top-[15px] right-[20px] w-[22px] h-[22px] cursor-pointer text-white transform -translate-x-4 translate-y-3.5"
              onClick={() => setShowPassword1(true)}
            />
          ) : (
            <IoIosEyeOff
              className="absolute top-[15px] right-[20px] w-[22px] h-[22px] cursor-pointer text-white transform -translate-x-4 translate-y-3.5"
              onClick={() => setShowPassword1(false)}
            />
          )}
        </div>

        {/* Error Message */}
        {err && <p className="text-red-400">{err}</p>}
        {/* Success Message */}
        {success && <p className="text-green-400">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="min-w-[150px] h-[60px] bg-gray-500 cursor-pointer text-white rounded-full text-[20px] mt-[10px] disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-white text-[16px] cursor-pointer">
          Already have an account?
          <span
            className="cursor-pointer text-blue-300 pl-[5px]"
            onClick={() => navigate("/")}
          >
           &nbsp; Log in
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
