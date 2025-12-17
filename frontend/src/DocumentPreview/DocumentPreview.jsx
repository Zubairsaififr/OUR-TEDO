import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DocumentPreview.css";
import Side from '../components/Side/side';

export default function DocumentPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) return <h2>No preview data found.</h2>;

  return (
    <div className="preview-parent">
      <Side />

      <div className="preview-container">
        <h2>Document Preview</h2>

        {/* HTML Output */}
        <div
          className="preview-html"
          dangerouslySetInnerHTML={{ __html: data.preview_html }}
        ></div>

        {/* ACTION BUTTONS */}
        <div className="preview-actions">
          {data.pdf_url && (
            <button
              className="btn-download"
              onClick={() => window.open(`http://localhost:8000${data.pdf_url}`, "_blank")}
            >
              Download PDF
            </button>
          )}

          {data.docx_url && (
            <button
              className="btn-download"
              onClick={() => window.open(`http://localhost:8000${data.docx_url}`, "_blank")}
            >
              Download DOCX
            </button>
          )}

          <button className="btn-back" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
