import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AIAgent.css";
import { useNavigate } from "react-router-dom";
import Side from "../Side/side";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export default function AIAgent() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [previewHtml, setPreviewHtml] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [docxUrl, setDocxUrl] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) return navigate("/");

        const res = await axios.get("http://127.0.0.1:8000/api/companies/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCompanies(res.data);
      } catch (err) {
        console.error("❌ Error fetching companies:", err);
        localStorage.removeItem("access_token");
        navigate("/");
      }
    }
    loadCompanies();
  }, [navigate]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setPreviewHtml("");
    setPdfUrl("");
    setDocxUrl("");

    if (!documentFile) return setError("⚠️ Please upload a document.");
    if (!selectedCompany) return setError("⚠️ Please select a company.");

    const formData = new FormData();
    formData.append("file", documentFile);
    formData.append("company", selectedCompany);
    formData.append("prompt", prompt);

    setLoading(true);

    try {
      const res = await api.post("/api/generate-docs/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      setSuccess("✅ Document processed successfully!");

      // 🔥 Backend response ko correctly handle kiya
      setPreviewHtml(res.data.preview_html || "");
      setPdfUrl(res.data.pdf_url || "");
      setDocxUrl(res.data.docx_url || "");
    } catch (err) {
      console.error("AI processing error:", err);
      setError("❌ " + (err.response?.data?.error || "Processing failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="aiperent">
        <Side />

        <div className="ai-container">
          <h2>AI Document Assistant</h2>

          <label className="file-label">
            ADD DOCUMENT
            <input
              type="file"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.txt"
              onChange={(e) => setDocumentFile(e.target.files?.[0])}
            />
          </label>

          <div className="company-select">
            <label>SELECT YOUR COMPANY</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Choose Your Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>

          <label>ADDITIONAL PROMPT (optional)</label>
          <textarea
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Extra instructions for AI..."
          />

          <div style={{ marginTop: 12 }}>
            <button id="ll" onClick={handleSubmit} disabled={loading}>
              {loading ? "Processing..." : "SUBMIT"}
            </button>
          </div>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          {/* OUTPUT PREVIEW BOX */}
          {(previewHtml || pdfUrl || docxUrl) && (
            <div className="output-box">
              <h3>Preview</h3>

              <div
                className="preview-html"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />

              <div className="after-actions">
                {pdfUrl && (
                  <button
                    className="btn-download"
                    onClick={() => window.open(`http://localhost:8000${pdfUrl}`, "_blank")}
                  >
                    Download PDF
                  </button>
                )}

                {docxUrl && (
                  <button
                    className="btn-download"
                    onClick={() => window.open(`http://localhost:8000${docxUrl}`, "_blank")}
                  >
                    Download DOCX
                  </button>
                )}

                {/* NEW — PREVIEW PAGE BUTTON */}
                <button
                  className="btn-preview"
                  onClick={() =>
                    navigate("//preview-document", {
                      state: {
                        preview_html: previewHtml,
                        pdf_url: pdfUrl,
                        docx_url: docxUrl,
                      },
                    })
                  }
                >
                  Open Full Preview →
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
