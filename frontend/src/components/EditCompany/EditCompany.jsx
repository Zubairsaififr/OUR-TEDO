import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditCompany.css";
import Side from '../Side/side';

export default function EditCompany() {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const id = parseInt(companyId, 10);

  const [form, setForm] = useState({
    company_name: "",
    company_address: "",
    company_type: "",
    major_activity: "",
    services_string: "",
    products_string: "",
  });

  // Fixed document files (new uploads)
  const [documentFiles, setDocumentFiles] = useState({
    gst_certificate: null,
    msme_certificate: null,
    cancel_cheque: null,
    pan_card: null,
    incorporation_certificate: null,
    eft_mandate: null,
    oem_turnover_certificate: null,
    bidder_turnover_certificate: null,
    networth_certificate: null,
    audited_balance_sheet: null,
    purchase_document: null,
    undertaking_blacklisting: null,
    quality_certificate: null,
    epf_registration: null,
    esic_registration: null,
    factory_license: null,
    product_catalog: null,
  });

  // Existing fixed document URLs
  const [existingDocuments, setExistingDocuments] = useState({});

  // Dynamic Required Documents
  const [requiredDocs, setRequiredDocs] = useState([]); // from backend
  const [updatingRequiredDocs, setUpdatingRequiredDocs] = useState({}); // {id: File}

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return navigate("/");

        const res = await axios.get(`http://127.0.0.1:8000/api/companies/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        const nob = typeof data.nature_of_business === "string"
          ? JSON.parse(data.nature_of_business)
          : data.nature_of_business || { services: [], products: [] };

        setForm({
          company_name: data.company_name || "",
          company_address: data.company_address || "",
          company_type: data.company_type || "",
          major_activity: data.major_activity || "",
          services_string: nob.services?.join(", ") || "",
          products_string: nob.products?.join(", ") || "",
        });

        // Fixed documents URLs
        const docs = {
          gst_certificate: data.gst_certificate,
          msme_certificate: data.msme_certificate,
          cancel_cheque: data.cancel_cheque,
          pan_card: data.pan_card,
          incorporation_certificate: data.incorporation_certificate,
          eft_mandate: data.eft_mandate,
          oem_turnover_certificate: data.oem_turnover_certificate,
          bidder_turnover_certificate: data.bidder_turnover_certificate,
          networth_certificate: data.networth_certificate,
          audited_balance_sheet: data.audited_balance_sheet,
          purchase_document: data.purchase_document,
          undertaking_blacklisting: data.undertaking_blacklisting,
          quality_certificate: data.quality_certificate,
          epf_registration: data.epf_registration,
          esic_registration: data.esic_registration,
          factory_license: data.factory_license,
          product_catalog: data.product_catalog,
        };
        setExistingDocuments(docs);

        // Dynamic required documents
        setRequiredDocs(data.required_docs || []);

      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to fetch company details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = (fieldName) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFiles(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleRequiredDocChange = (docId) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setUpdatingRequiredDocs(prev => ({ ...prev, [docId]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/");

      const stringToArray = (str) => str.split(",").map(s => s.trim()).filter(s => s.length > 0);

      const servicesArray = stringToArray(form.services_string);
      const productsArray = stringToArray(form.products_string);

      if (servicesArray.length === 0 || productsArray.length === 0) {
        alert("Please ensure Services and Products are not empty.");
        return;
      }

      const formData = new FormData();

      formData.append("company_name", form.company_name);
      formData.append("company_address", form.company_address);
      formData.append("company_type", form.company_type);
      formData.append("major_activity", form.major_activity);
      formData.append("nature_of_business", JSON.stringify({
        services: servicesArray,
        products: productsArray,
      }));

      // Fixed documents - only changed ones
      Object.keys(documentFiles).forEach(key => {
        if (documentFiles[key]) {
          formData.append(key, documentFiles[key]);
        }
      });

      // Dynamic required documents update (custom field names)
      Object.keys(updatingRequiredDocs).forEach(docId => {
        if (updatingRequiredDocs[docId]) {
          formData.append(`required_doc_${docId}`, updatingRequiredDocs[docId]);
        }
      });

      await axios.put(`http://127.0.0.1:8000/api/companies/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Company updated successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);

    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert("Error updating company. Check console or backend logs.");
    }
  };

  const handleDeleteCompany = async () => {
    if (!window.confirm("Are you sure you want to DELETE this company permanently? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://127.0.0.1:8000/api/companies/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Company deleted successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert("Error deleting company.");
    }
  };

  const documentLabels = {
    gst_certificate: "GST Certificate",
    msme_certificate: "MSME Certificate",
    cancel_cheque: "Cancelled Cheque",
    pan_card: "PAN Card",
    incorporation_certificate: "Incorporation Certificate",
    eft_mandate: "EFT Mandate",
    oem_turnover_certificate: "OEM Turnover Certificate",
    bidder_turnover_certificate: "Bidder Turnover Certificate",
    networth_certificate: "Net Worth Certificate",
    audited_balance_sheet: "Audited Balance Sheet",
    purchase_document: "Purchase Document",
    undertaking_blacklisting: "Undertaking (Non-Blacklisting)",
    quality_certificate: "Quality Certificate",
    epf_registration: "EPF Registration",
    esic_registration: "ESIC Registration",
    factory_license: "Factory License",
    product_catalog: "Product Catalog",
  };

  const getDocTypeLabel = (type) => {
    const types = {
      PAN: "PAN Card",
      INC_CERT: "Incorporation Certificate",
      AADHAAR: "Aadhaar Card",
      UDYAM: "Udyam Certificate",
      GST_CERT: "GST Certificate",
      BANK_PROOF: "Bank Proof",
      OTHER: "Other Document",
    };
    return types[type] || type;
  };

  if (loading) return <p>Loading company data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="editc-containerc">
      <Side />

      <div className="editc-cardc">
        <h2 className="textc">Edit Company</h2>
        <form onSubmit={handleSubmit}>

          {/* === Basic Fields === */}
          {/* (tere original fields unchanged - already perfect) */}
          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Company Name</label>
            <input type="text" name="company_name" className="formc-inputc" value={form.company_name} onChange={handleChange} required />
          </div>

          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Company Address</label>
            <input type="text" name="company_address" className="formc-inputc" value={form.company_address} onChange={handleChange} required />
          </div>

          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Company Type</label>
            <select name="company_type" className="formc-inputc" value={form.company_type} onChange={handleChange} required>
              <option value="" disabled>-- Select Type --</option>
              <option value="PVT_LTD">Pvt. Ltd.</option>
              <option value="LLP">LLP</option>
              <option value="PARTNERSHIP">Partnership</option>
              <option value="PROPRIETORSHIP">Proprietorship</option>
              <option value="ENTERPRISES">Enterprises</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Major Activity</label>
            <select name="major_activity" className="formc-inputc" value={form.major_activity} onChange={handleChange} required>
              <option value="" disabled>-- Select Activity --</option>
              <option value="MANUFACTURE">Manufacture</option>
              <option value="SERVICES">Services</option>
              <option value="TRADER">Trader</option>
              <option value="RESELLER">Reseller</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Services (comma-separated)</label>
            <input type="text" name="services_string" className="formc-inputc" value={form.services_string} onChange={handleChange} required />
          </div>

          <div className="formc-groupc mb-6">
            <label className="formc-labelc">Products (comma-separated)</label>
            <input type="text" name="products_string" className="formc-inputc" value={form.products_string} onChange={handleChange} required />
          </div>

          {/* === FIXED DOCUMENTS === */}
          <h3 style={{ margin: "40px 0 20px", color: "#333" }}>Fixed Company Documents</h3>
          <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", background: "#f9f9f9" }}>
            {Object.keys(documentLabels).map((key) => {
              const url = existingDocuments[key];
              const newFile = documentFiles[key];

              return (
                <div key={key} className="formc-groupc mb-4" style={{ borderBottom: "1px dashed #ccc", paddingBottom: "15px" }}>
                  <label className="formc-labelc">{documentLabels[key]}</label>

                  {url && !newFile && (
                    <div style={{ marginBottom: "10px" }}>
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc" }}>
                        View Current: {url.split("/").pop()}
                      </a>
                    </div>
                  )}

                  {newFile && (
                    <div style={{ marginBottom: "10px", color: "green" }}>
                      New: {newFile.name}
                    </div>
                  )}

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange(key)}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                  <small style={{ color: "#666" }}>Upload to replace existing document</small>
                </div>
              );
            })}
          </div>

          {/* === DYNAMIC REQUIRED DOCUMENTS === */}
          <h3 style={{ margin: "40px 0 20px", color: "#333" }}>Additional Required Documents</h3>
          <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", background: "#f0f8ff" }}>
            {requiredDocs.length === 0 ? (
              <p style={{ color: "#666", fontStyle: "italic" }}>No additional documents uploaded yet.</p>
            ) : (
              requiredDocs.map((doc) => {
                const newFile = updatingRequiredDocs[doc.id];

                return (
                  <div key={doc.id} className="formc-groupc mb-4" style={{ borderBottom: "1px dashed #aaa", paddingBottom: "15px" }}>
                    <label className="formc-labelc">
                      {getDocTypeLabel(doc.document_type)} - {doc.document_name}
                    </label>

                    {doc.file && !newFile && (
                      <div style={{ marginBottom: "10px" }}>
                        <a href={doc.file} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc" }}>
                          View Current: {doc.file.split("/").pop()}
                        </a>
                      </div>
                    )}

                    {newFile && (
                      <div style={{ marginBottom: "10px", color: "green" }}>
                        New: {newFile.name}
                      </div>
                    )}

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleRequiredDocChange(doc.id)}
                      style={{ display: "block", marginTop: "8px" }}
                    />
                    <small style={{ color: "#666" }}>Upload to replace this document</small>
                  </div>
                );
              })
            )}
          </div>

          {/* === BUTTONS === */}
          <div style={{ marginTop: "40px", display: "flex", gap: "20px", justifyContent: "space-between" }}>
            <button type="submit" className="submitc-btnc">
              Update Company
            </button>

            <button
              type="button"
              onClick={handleDeleteCompany}
              style={{
                background: "#dc3545",
                color: "white",
                padding: "12px 28px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Delete Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}