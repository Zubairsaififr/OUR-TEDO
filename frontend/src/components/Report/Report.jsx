
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate instead of Navigate
import Side from "../../components/Side/side";
import "./Report.css";
import { FaFilter } from "react-icons/fa";
import axios from "axios";

function Report() {
    const navigate = useNavigate(); // ✅ Correct hook
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [companyData, setCompanyData] = useState(null); // ✅ Selected company full data
    const [username, setUsername] = useState("");

    // ✅ Fetch companies
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    console.warn("⚠️ No token found, redirecting to login...");
                    navigate("/");
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
                    localStorage.removeItem("access_token");
                    navigate("/");
                }
            }
        };

        fetchCompanies();
    }, [navigate]);

    // ✅ Fetch logged-in username
    useEffect(() => {
        const storedUser = localStorage.getItem("username");
        if (storedUser) {
            setUsername(storedUser);
        } else {
            navigate("/");
        }
    }, [navigate]);

    // ✅ When company selected, fetch its tender & participation details
    const handleCompanySelect = async (e) => {
        const companyId = e.target.value;
        setSelectedCompany(companyId);

        if (!companyId) {
            setCompanyData(null);
            return;
        }

        try {
            const token = localStorage.getItem("access_token");
            const res = await axios.get(
                `http://127.0.0.1:8000/api/companies/${companyId}/details/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("✅ Company details API response:", res.data); // 🔥 Debug line
            setCompanyData(res.data);
        } catch (err) {
            console.error("❌ Error fetching company details:", err.response?.data || err.message);
            setCompanyData(null);
        }
    };


    return (
        <div className="consy">
            <div id="rand1">
                <Side />
            </div>

            <div id="divi2" className="navbar1">
                <div>
                    <p className="text-gray-400 text-lg mt-2">
                        Welcome, <span className="text-blue-400">{username}</span> 👋
                    </p>
                </div>
            </div>

            <div id="tb1">
                <div id="icons2">
                    <div id="pub">
                        <FaFilter /> Filters
                    </div>

                    <select id="dd1" value={selectedCompany} onChange={handleCompanySelect}>
                        <option value="">Select Company</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                                {company.company_name}
                            </option>
                        ))}
                    </select>
                </div>

                <table className="tabl">
                    <thead>
                        <tr>
                            <th scope="col">S.No.</th>
                            <th scope="col">Company Name</th>
                            <th scope="col">Tender</th>
                            <th scope="col">Participation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companyData ? (
                            companyData.tenders && companyData.tenders.length > 0 ? (
                                companyData.tenders.map((tender, index) => (
                                    <tr key={tender.id}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{companyData.company_name}</td>
                                        <td>{tender.tender_name}</td>
                                        <td>
                                            {tender.participated ? (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => alert(`Viewing participation for ${tender.tender_name}`)}
                                                >
                                                    View
                                                </button>
                                            ) : (
                                                "NA"
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center" }}>
                                        No tenders found for this company.
                                    </td>
                                </tr>
                            )
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>
                                    Select a company to view details.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Report;
