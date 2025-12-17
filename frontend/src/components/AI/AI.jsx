import React, { useState, useEffect } from "react";
import "./AI.css";
import Side from "../Side/side";
import api from "../../api";
import { useNavigate } from "react-router-dom";

function AI() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  // 🔹 Load user companies on mount
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await api.get("/companies/");
        setCompanies(res.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    }
    fetchCompanies();
  }, []);

  // 🔹 Handle file input
  const handleFileChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  // 🔹 Submit task to backend
  const handleSubmit = async () => {
    if (!documentFile || !selectedCompany) {
      alert("Please select a company and upload a document.");
      return;
    }

    setLoading(true);
    setOutput(null);

    try {
      // Step 1️⃣: Upload document to backend first
      const docForm = new FormData();
      docForm.append("file", documentFile);
      docForm.append("title", documentFile.name);

      const docRes = await api.post("/documents/", docForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const documentId = docRes.data.id;

      // Step 2️⃣: Create AI task using uploaded document
      const aiRes = await api.post("/ai-tasks/", {
        company: selectedCompany,
        document: documentId,
        prompt: prompt,
      });

      const taskId = aiRes.data.id;

      // Step 3️⃣: Poll task until completed
      const checkStatus = async () => {
        const res = await api.get(`/ai-tasks/${taskId}/`);
        if (res.data.status === "completed") {
          setOutput(res.data.result_text);
          setLoading(false);
        } else if (res.data.status === "failed") {
          setOutput("❌ Failed to process document. Try again.");
          setLoading(false);
        } else {
          setTimeout(checkStatus, 3000);
        }
      };

      checkStatus();
    } catch (error) {
      console.error("AI processing error:", error);
      alert("Something went wrong while processing your document.");
      setLoading(false);
    }
  };

  return (
    <div id="AIperent">
      <div id="bsdk1">
        <Side />
      </div>

      <div id="bsdk2">
        <div id="imgAI">
          <img alt="" />
        </div>

        <div id="textAI">
          <div className="form-containerg">
            <div className="top-buttonsg">

              {/* 🔹 Upload Document */}
              <label className="btng" style={{ cursor: "pointer" }}>
                ADD TENDER DOC
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  hidden
                />
              </label>

              {/* 🔹 Company Dropdown */}
              <div
                className="dropdowng"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <button className="btng dropdown-btng">
                  {selectedCompany
                    ? companies.find(c => c.id === selectedCompany)?.company_name
                    : "SELECT YOUR COMPANY"}
                  <span className="arrowg">▼</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdowng-contentg">
                    {companies.map((comp) => (
                      <div
                        key={comp.id}
                        onClick={() => {
                          setSelectedCompany(comp.id);
                          setDropdownOpen(false);
                        }}
                      >
                        {comp.company_name}
                      </div>
                    ))}
                    <div
                      style={{
                        color: "blue",
                        cursor: "pointer",
                        paddingTop: "5px",
                      }}
                      onClick={() => navigate("/add-company")}
                    >
                      + Add New Company
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 🔹 Prompt Input */}
            <label className="labelg">ADDITIONAL PROMPT</label>
            <textarea
              className="textarea"
              rows="6"
              placeholder="(Optional) Add custom instructions for AI..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>

            {/* 🔹 Submit Button */}
            <div className="submitg-containerg">
              <button
                className="btng submit-btng"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Processing..." : "SUBMIT"}
              </button>
            </div>

            {/* 🔹 AI Output */}
            {output && (
              <div className="ai-output-box">
                <h4>AI Output:</h4>
                <pre>{output}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AI;
