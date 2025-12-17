import React, { useEffect, useState } from "react";
import axios from "axios";
import './CompanyCards.css'
import {
 
  MdAccessTime,
} from "react-icons/md";
import { FaBuilding } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function CompanyCards() {
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

useEffect(() => {
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("access_token"); // 🔥 FIXED

      if (!token) {
        console.warn("⚠️ No token found, redirecting to login...");
        navigate("/"); // redirect login par hi kar
        return;
      }

      const res = await axios.get("http://127.0.0.1:8000/api/companies/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCompanies(res.data);
    } catch (err) {
      console.error("❌ Error fetching companies:", err);

      if (err.response && err.response.status === 401) {
        // Token expired/invalid → logout + redirect
        localStorage.removeItem("access_token"); // 🔥 FIXED
        navigate("/");
      }
    }
  };

  fetchCompanies();
}, [navigate]);


  return (
    <div id="cperent" className="" >
      {companies.map((company) => (
        <div id="hakunamatata"
          key={company.id}
          className=" shadow-md hover:shadow-xl transition"
        >
          {/* Status */}
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
            </span>
            <div className="flex gap-3 text-gray-500">
              {/* <button className="hover:text-gray-700">⬇</button> */}
              <button className="hover:text-gray-700">⋮</button>
            </div>
          </div>

          {/* Logo + Name */}
          <div className="mt-7 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-400 flex items-center justify-center rounded-lg">
              <FaBuilding className="text-gray-600 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-700 uppercase">
                {company.company_name}
              </h2>
              <p className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full w-fit">
                {company.company_type || "N/A"}
              </p>
            </div>
          </div>

          {/* Created Date */}
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-600">
              <MdAccessTime /> Created
            </span>
            <span className="text-sm text-gray-500">
              {company.created_at
                ? new Date(company.created_at).toLocaleDateString("en-GB")
                : "N/A"}
            </span>
          </div>

          {/* Edit Button */}
          <button id="mnhibtaunga" className="mt-9 w-full py-2 rounded-2xl bg-gradient-to-r from-black-500 to-gray-600 
          text-white font-medium hover:opacity-80 transition hover:border-1"onClick={() => navigate(`/editcompany/${company.id}`)}>
            ✏ Edit Company
          </button>
        </div>
      ))}
    </div>
  );
}

export default CompanyCards;
