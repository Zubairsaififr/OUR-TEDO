import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { GrOrganization } from "react-icons/gr";
import { TbBrandReact } from "react-icons/tb";
import { FaFileContract } from "react-icons/fa6";
import { IoDocument, IoFileTrayFull, IoSettings, IoLogOut } from "react-icons/io5";
import { HiClipboardDocumentCheck } from "react-icons/hi2";
import "./Dashboard.css";
import CompanyCards from "./components/CompanyCards/CompanyCards";
import AnalyticsDashboard from "./components/AnalyticsDashboard/AnalyticsDashboard";
import Side from "./components/Side/side";


function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div
      id="parent"
      className={`${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${
        isMobile ? "mobile-layout" : ""
      }`}
    >
      {isSidebarOpen && (
        <div id="div1" >
          <Side/>
        </div>
      )}
      {/* Navbar Toggle Button - Always on Top */}
      <div id="div2" className="navbar">
        <div>
          <p className="text-gray-400 text-lg mt-2">
            Welcome, <span className="text-blue-400">{username}</span> 👋
          </p>
        </div>
        <div className="container">
          <button
            className="navbar-toggler"
            aria-label="Toggle navigation"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span>☰</span>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      

      {/* Main Content */}
      <div className="div3">
        <div className="w-[500px] h-full min-h-screen ">
          <h1></h1>
          <CompanyCards />
        </div>
      </div>
      <div id="div4">
        <AnalyticsDashboard/>
   
      </div>
    </div>
  );
}

export default Dashboard;
