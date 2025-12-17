
import React, { useEffect, useState } from "react";
import Side from "../Side/side";
import { useNavigate } from "react-router-dom";
import "./DocumentData.css";
import api from "../../api"; // baseURL should be http://localhost:8000/api/

function DocumentData() {
  const [username, setUsername] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

  // ✅ Helper to safely render any value
  const safeRender = (value) => {
    if (value == null || value === "") return "-";
    if (typeof value === "object") {
      try {
        return Object.values(value).join(", ");
      } catch {
        return JSON.stringify(value);
      }
    }
    return value;
  };

  // ✅ Toggle show/hide document
  const handleShowDocument = (url) => {
    if (selectedDocUrl === url) {
      setSelectedDocUrl(null);
    } else {
      setLoading(true);
      setSelectedDocUrl(url);
      setTimeout(() => setLoading(false), 800);
    }
  };

  // ✅ Fetch documents from backend
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await api.get("documents/"); // ✅ FIXED URL
        setDocuments(response.data);
      } catch (error) {
        console.error("❌ Error fetching documents:", error);
      }
    }
    fetchDocuments();
  }, []);

  // ✅ Fetch companies from backend
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await api.get("companies/"); // ✅ FIXED URL
        setCompanies(response.data);
      } catch (error) {
        console.error("❌ Error fetching companies:", error);
      }
    }
    fetchCompanies();
  }, []);

  // ✅ Get username from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex justify-center h-[80px]" id="dabba">
      <div className="mango">
        <Side />
      </div>

      <div id="div2" className="navbar">
        <div>
          <p className="text-gray-400 text-lg mt-2">
            Welcome, <span className="text-blue-400">{username}</span> 👋
          </p>

          <div id="companydata">
            <h2 className="text-[25px] font-semibold mb-2">Company Data:</h2>
            <div className="table-container">
              <table className="bg-white border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th>Name</th>
                    <th>Company Type</th>
                    <th>Major Activity</th>
                    <th>Nature of Business</th>
                    <th>Company Address</th>
                    <th>GST No.</th>
                    <th>GST Certificate</th>
                    <th>MSME No.</th>
                    <th>MSME Certificate</th>
                    <th>Account No.</th>
                    <th>Enterprise Type</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Account Holder Name</th>
                    <th>Cancel Cheque</th>
                    <th>IFSC Code</th>
                    <th>Bank Name</th>
                    <th>Bank Ph. No.</th>
                  </tr>
                </thead>

                <tbody>
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan="18" className="text-center py-4 text-gray-400">
                        No company data available
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td>{safeRender(company.company_name)}</td>
                        <td>{safeRender(company.company_type)}</td>
                        <td>{safeRender(company.major_activity)}</td>
                        <td>{safeRender(company.nature_of_business)}</td>
                        <td>{safeRender(company.company_address)}</td>
                        <td>{safeRender(company.gstin_no)}</td>

                        {/* GST Certificate */}
                        <td>
                          <button
                            onClick={() =>
                              handleShowDocument(
                                `http://127.0.0.1:8000${company.gst_certificate}`
                              )
                            }
                            className="text-blue-500 underline hover:text-blue-700"
                          >
                            {selectedDocUrl ===
                            `http://127.0.0.1:8000${company.gst_certificate}`
                              ? "Hide"
                              : "Show"}
                          </button>{" "}
                          /{" "}
                          <a
                            href={`http://127.0.0.1:8000${company.gst_certificate}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 underline hover:text-green-700"
                          >
                            Download
                          </a>
                        </td>

                        <td>{safeRender(company.msme_no)}</td>

                        {/* MSME Certificate */}
                        <td>
                          <button
                            onClick={() =>
                              handleShowDocument(
                                `http://127.0.0.1:8000${company.msme_certificate}`
                              )
                            }
                            className="text-blue-500 underline hover:text-blue-700"
                          >
                            {selectedDocUrl ===
                            `http://127.0.0.1:8000${company.msme_certificate}`
                              ? "Hide"
                              : "Show"}
                          </button>{" "}
                          /{" "}
                          <a
                            href={`http://127.0.0.1:8000${company.msme_certificate}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 underline hover:text-green-700"
                          >
                            Download
                          </a>
                        </td>

                        <td>{safeRender(company.account_number)}</td>
                        <td>{safeRender(company.enterprise_type)}</td>
                        <td>{safeRender(company.created_at)}</td>
                        <td>{safeRender(company.updated_at)}</td>
                        <td>{safeRender(company.account_holder_name)}</td>

                        {/* Cancel Cheque */}
                        <td>
                          <button
                            onClick={() =>
                              handleShowDocument(
                                `http://127.0.0.1:8000${company.cancel_cheque}`
                              )
                            }
                            className="text-blue-500 underline hover:text-blue-700"
                          >
                            {selectedDocUrl ===
                            `http://127.0.0.1:8000${company.cancel_cheque}`
                              ? "Hide"
                              : "Show"}
                          </button>{" "}
                          /{" "}
                          <a
                            href={`http://127.0.0.1:8000${company.cancel_cheque}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 underline hover:text-green-700"
                          >
                            Download
                          </a>
                        </td>

                        <td>{safeRender(company.ifsc_code)}</td>
                        <td>{safeRender(company.bank_name)}</td>
                        <td>{safeRender(company.bank_phone)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* PDF Preview */}
              <div className="viewer-section mt-4">
                {loading && <p>Loading document...</p>}
                {!loading && selectedDocUrl && (
                  <object
                    data={selectedDocUrl}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                  >
                    <p>
                      Your browser does not support PDF preview.{" "}
                      <a href={selectedDocUrl} target="_blank" rel="noreferrer">
                        Click here to view
                      </a>
                    </p>
                  </object>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentData;
