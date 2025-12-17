import React, { useState, useEffect } from "react";
import axios from "axios";
import Side from '../Side/side'
// same styling use kar sakta hai

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export default function DocumentPrepared() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first");
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    api.get("/api/my-documents/")
      .then(res => {
        setDocs(res.data.documents || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("access_token");
          window.location.href = "/";
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="ai-container"><h2>Loading your documents...</h2></div>;
  }

  return (
    <>
      
        <div className="aiperent">
               <Side />
          <div className="ai-container" style={{ maxWidth: "1200px", }}>
            <h2 style={{ textAlign: "center", color: "#5D3FD3", marginBottom: "30px" }}>
              Your Generated Tender Documents
            </h2>

            {docs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <h3>No documents generated yet</h3>
                <p>Go to AI Agent and generate your first tender!</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" }}>
                {docs.map((doc, i) => (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "24px",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      border: "1px solid #eee",
                    }}
                  >
                    <h3 style={{ marginBottom: "12px", color: "#333", fontSize: "18px" }}>
                      {doc.name}
                    </h3>
                    <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
                      {doc.date} • {doc.size_kb} KB
                    </p>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {doc.pdf_url && (
                        <a
                          href={`http://localhost:8000${doc.pdf_url}`}
                          target="_blank"
                          style={{
                            background: "#dc3545",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "bold",
                          }}
                        >
                          Download PDF
                        </a>
                      )}
                      {doc.docx_url && (
                        <a
                          href={`http://localhost:8000${doc.docx_url}`}
                          target="_blank"
                          style={{
                            background: "#0d6efd",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "bold",
                          }}
                        >
                          Download DOCX
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    
    </>
  );
}