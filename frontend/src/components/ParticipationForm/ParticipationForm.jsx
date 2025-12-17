// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./ParticipationForm.css";
// import Side from '../Side/side'

// const SERVER_URL = "http://localhost:5100";

// // ⭐ NEW — Proxy opener function (Add only this)
// const openDoc = (url) => {
//   const proxyUrl = `http://localhost:5100/api/fetch-doc?url=${encodeURIComponent(url)}`;
//   window.open(proxyUrl, "_blank");
// };

// const ParticipationForm = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [analysisResult, setAnalysisResult] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [showPdf, setShowPdf] = useState(false);
//   const [pdfPath, setPdfPath] = useState(sessionStorage.getItem("savedBidPdf") || "");
//   const [subDocs, setSubDocs] = useState(JSON.parse(sessionStorage.getItem("savedSubDocs") || "[]"));
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [viewingDoc, setViewingDoc] = useState(null);
//   const [toastMsg, setToastMsg] = useState("");
//   const [showToast, setShowToast] = useState(false);

//   const initialCompany = location.state?.company || JSON.parse(sessionStorage.getItem("selectedCompany") || "{}");
//   const initialBid = location.state?.bid || JSON.parse(sessionStorage.getItem("selectedBid") || "{}");

//   const [company] = useState(initialCompany);
//   const [bid] = useState(initialBid);



//   const showToastMsg = (msg) => {
//     setToastMsg(msg);
//     setShowToast(true);

//     setTimeout(() => {
//       setShowToast(false);
//     }, 2500);
//   };

//   useEffect(() => {
//     const lastBid = sessionStorage.getItem("lastBidNo");
//     const currentBidNo = bid?.bidNo || bid?.bid_no;
//     if (lastBid && lastBid !== currentBidNo) {
//       sessionStorage.removeItem("savedBidPdf");
//       sessionStorage.removeItem("savedSubDocs");
//       setPdfPath("");
//       setSubDocs([]);
//       setShowPdf(false);
//       setViewingDoc(null);
//     }
//     sessionStorage.setItem("lastBidNo", currentBidNo);
//   }, [bid]);

//   const handleBack = async () => {
//     try {
//       if (pdfPath) {
//         await fetch(`${SERVER_URL}/api/delete-bid-pdf`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ filePath: pdfPath }),
//         });
//         sessionStorage.removeItem("savedBidPdf");
//       }
//     } catch (err) { console.error(err); }
//     navigate(-1);
//   };

//   const handleTogglePdf = async () => {
//     setError("");
//     if (showPdf) return setShowPdf(false);
//     if (pdfPath) return setShowPdf(true);
//     if (!bid?.bidLink) return setError("No bid link available");

//     try {
//       setLoading(true);
//       const res = await fetch(`${SERVER_URL}/api/save-bid-pdf?url=${encodeURIComponent(bid.bidLink)}`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed");

//       sessionStorage.setItem("savedBidPdf", data.filePath);
//       sessionStorage.setItem("savedSubDocs", JSON.stringify(data.subDocuments || []));

//       setPdfPath(data.filePath);
//       setSubDocs(data.subDocuments || []);
//       setShowPdf(true);
//     } catch (err) {
//       setError("Failed to load bid document.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAnalyzePdf = async () => {
//     if (!pdfPath) return alert("First load the Bid Document!");

//     setIsAnalyzing(true);
//     setError("");

//     try {
//       const fileUrl = `${SERVER_URL}${pdfPath}`;
//       const fileRes = await fetch(fileUrl);
//       if (!fileRes.ok) throw new Error("PDF not found");

//       const blob = await fileRes.blob();
//       const formData = new FormData();
//       formData.append("file", blob, pdfPath.split("/").pop());

//       const djangoRes = await fetch("http://localhost:8000/api/analyze-pdf/", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await djangoRes.json();
//       if (!djangoRes.ok) throw new Error(result.error || "Analysis failed");

//       setAnalysisResult(result);
//       setIsAnalyzing(false);
//       alert("Analysis Complete!");

//       setTimeout(() => {
//         document.getElementById("related-docs-section")?.scrollIntoView({ behavior: "smooth" });
//       }, 500);

//     } catch (err) {
//       setError("Analysis failed: " + err.message);
//       setIsAnalyzing(false);
//     }
//   };

//   // ⭐ NEW FUNCTION — Extract Documents
//   const handleExtractDocs = async () => {
//     if (!pdfPath) return alert("Load Bid PDF first!");

//     setIsAnalyzing(true);
//     try {
//       const fileUrl = `${SERVER_URL}${pdfPath}`;
//       const fileRes = await fetch(fileUrl);
//       if (!fileRes.ok) throw new Error("PDF not found");

//       const blob = await fileRes.blob();
//       const formData = new FormData();
//       formData.append("file", blob, pdfPath.split("/").pop());

//       const djangoRes = await fetch("http://localhost:8000/api/analyze-pdf/", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await djangoRes.json();
//       setAnalysisResult(result);
//       alert("Documents Extracted Successfully!");
//     } catch (err) {
//       alert("Failed to extract documents.");
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const handleDownload = () => {
//     if (!pdfPath) return;
//     const a = document.createElement("a");
//     a.href = `${SERVER_URL}${pdfPath}`;
//     a.download = `Bid-${(bid?.bidNo || "document").replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
//     a.click();
//   };

//   const attached = analysisResult?.attached_documents || {};

//   const openInPage = (url, name) => {
//     if (
//       url.includes("sso.gem.gov.in") ||
//       url.includes("login") ||
//       url.includes(".doc") ||
//       url.includes(".docx") ||
//       url.includes(".xls") ||
//       url.includes(".xlsx")
//     ) {
//       return window.open(`http://localhost:5100/api/fetch-doc?url=${encodeURIComponent(url)}`, "_blank");
//     }

//     setViewingDoc({ url, name });
//     if (url.includes("gem.gov.in") || url.includes("sso") || url.includes("assets-bg")) {
//       return window.open(`http://localhost:5100/api/fetch-doc?url=${encodeURIComponent(url)}`, "_blank");
//     }

//   };



//   // AUTO DETECT DOCUMENT OPEN LOGIC
//   const proxyDoc = (u) => `http://localhost:5100/api/fetch-doc?url=${encodeURIComponent(u)}`;

//   const handleOpenDocument = (url, name) => {
//     if (!url) return;

//     const cleanUrl = url.trim();
//     const ext = cleanUrl.split(".").pop().split("?")[0].toLowerCase();

//     // 🚫 Always force SSO / blocked-pages to open directly
//     if (cleanUrl.includes("sso.gem.gov.in") || cleanUrl.includes("login") || cleanUrl.includes("authenticate")) {
//       return window.open(proxyDoc(cleanUrl), "_blank");
//     }

//     // 📄 PDF — Try inline preview first via proxy
//     if (ext === "pdf") {
//       return setViewingDoc({ url: proxyDoc(cleanUrl), name });
//     }

//     // 📊 EXCEL / WORD — Use Google Viewer
//     if (["xls", "xlsx", "doc", "docx", "ppt", "pptx"].includes(ext)) {
//       const viewer = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(cleanUrl)}`;
//       return window.open(viewer, "_blank");
//     }

//     // 🛟 Fallback last option — download / proxy open
//     return window.open(proxyDoc(cleanUrl), "_blank");
//   };


//   return (
//     <>
//       <div id="ten_conatian">

//         <div id="hehr">
//           <Side />
//         </div>
//         <div className="participation-container">



//           {isAnalyzing && (
//             <div className="analysis-modal-overlay">
//               <div className="analysis-modal analyzing">
//                 <div className="spinner"><span className="inner-dot" /></div>
//                 <h3>Your Bid is being Analyzing</h3>
//                 <p>Please wait, extracting documents...</p>
//               </div>
//             </div>
//           )}

//           {/* Header */}
//           <div className="header">
//             <h2>{company?.company_name || "Selected Company"}</h2>
//             <p className="bid-number">Bid No: {bid?.bidNo || bid?.bid_no || "N/A"}</p>

//           </div>
//           <div id="mid_mainh">

//             <div id="left_wala">
//               {/* BID DETAILS CARD */}
//               <div className="bid-details-card">
//                 <div className="bid-info">
//                   <p><strong>Items:</strong> {bid?.items || bid?.items_description || "—"}</p>
//                   <p><strong>Quantity:</strong> {bid?.quantity || "—"}</p>
//                   <p><strong>Department:</strong> {bid?.department || "—"}</p>
//                   <p><strong>Start Date:</strong> {bid?.startDate || bid?.start_date || "—"}</p>
//                   <p><strong>End Date:</strong> {bid?.endDate || bid?.end_date || "—"}</p>
//                 </div>
//               </div>
//             {error && <p className="no-doc error">{error}</p>}

//           {showPdf && pdfPath && (
//             <div className="pdf-viewer">
//               <iframe src={`${SERVER_URL}${pdfPath}`} width="100%" height="650px" frameBorder="0" title="Bid Document" />
//             </div>
//           )}
//             </div>
//             <div id="right_wala">

//               {/* ⭐ SEPARATE BUTTON SECTION - OUTSIDE THE CARD */}
//               <div className="action-buttons">
//                 <button onClick={handleTogglePdf} disabled={loading}>
//                   {loading ? "Loading..." : showPdf ? "Hide Bid Document" : "View Bid Document"}
//                 </button>

//                 <button className="download-btn" onClick={handleDownload}>Download PDF</button>

//                 <button className="analyze-btn" onClick={handleAnalyzePdf} disabled={isAnalyzing}>
//                   {isAnalyzing ? "Analyzing..." : "Analyze PDF"}
//                 </button>

//                 <button className="extract-btn" onClick={handleExtractDocs}>
//                   Extract Documents
//                 </button>
//               </div>

//             </div>
//           </div>
//           {/* {error && <p className="no-doc error">{error}</p>}

//           {showPdf && pdfPath && (
//             <div className="pdf-viewer">
//               <iframe src={`${SERVER_URL}${pdfPath}`} width="100%" height="650px" frameBorder="0" title="Bid Document" />
//             </div>
//           )} */}

//           {/* EXTRACTED DOCUMENTS SECTION */}
//           {analysisResult?.attached_documents && analysisResult.attached_documents.length > 0 && (
//             <div className="sub-docs" style={{ marginTop: "50px" }}>
//               <h3>Extracted Documents</h3>
//               <ul>
//                 {analysisResult.attached_documents.map((url, i) => (
//                   <li key={i}>
//                     <span className="doc-badge">DOC</span> Document {i + 1}
//                     <button className="doc-btn" onClick={() => openInPage(url, `Document ${i + 1}`)}>View In Page</button>
//                     <button className="doc-btn" onClick={() => openDoc(url)}>Open via Proxy</button>
//                     <a href={url} download className="doc-btn">Download</a>


//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {viewingDoc && (
//             <div style={{ marginTop: "50px", padding: "20px", border: "3px solid #007bff", borderRadius: "12px", background: "#f8fdff" }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
//                 <h3 style={{ margin: 0, color: "#007bff" }}>{viewingDoc.name}</h3>
//                 <button onClick={() => setViewingDoc(null)} style={{ padding: "10px 20px", background: "#dc3545", color: "white", border: "none", borderRadius: "8px" }}>
//                   Close Document
//                 </button>
//               </div>
//               {/* <iframe src={viewingDoc.url} width="100%" height="900px" title={viewingDoc.name} style={{ border: "1px solid #ccc", borderRadius: "8px" }} /> */}

//               <iframe
//                 src={viewingDoc.url}
//                 width="100%"
//                 height="900px"
//                 title={viewingDoc.name}
//                 style={{ border: "1px solid #ccc", borderRadius: "8px" }}
//                 allow="fullscreen"
//               />

//             </div>
//           )}

//           {subDocs.length > 0 && (
//             <div className="sub-docs" style={{ marginTop: "50px" }}>
//               <h3>Other Attached Documents (from GeM)</h3>
//               <ul>
//                 {subDocs.map((doc, i) => {
//                   const url = typeof doc === 'object' ? doc.url : doc;
//                   const name = typeof doc === 'object' ? doc.name : `Document ${i + 1}`;
//                   return (
//                     <li key={i}>
//                       <span className="doc-badge">PDF</span> {name}
//                       <a href={url} target="_blank" rel="noopener noreferrer" className="doc-btn">View</a>
//                       <button className="doc-btn" onClick={() => openDoc(url)}>Open via Proxy</button>
//                       <a href={url} download className="doc-btn">Download</a>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           )}

//         </div>
//       </div>
//     </>

//   );
// };

// export default ParticipationForm;


















import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ParticipationForm.css";
import Side from '../Side/side'

const SERVER_URL = "http://localhost:5100";

// Proxy opener (rakha hai backup ke liye, ab kam use hoga extracted docs ke liye)
const openDoc = (url) => {
  const proxyUrl = `http://localhost:5100/api/fetch-doc?url=${encodeURIComponent(url)}`;
  window.open(proxyUrl, "_blank");
};

const ParticipationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfPath, setPdfPath] = useState(sessionStorage.getItem("savedBidPdf") || "");
  const [subDocs, setSubDocs] = useState(JSON.parse(sessionStorage.getItem("savedSubDocs") || "[]"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewingDoc, setViewingDoc] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const initialCompany = location.state?.company || JSON.parse(sessionStorage.getItem("selectedCompany") || "{}");
  const initialBid = location.state?.bid || JSON.parse(sessionStorage.getItem("selectedBid") || "{}");

  const [company] = useState(initialCompany);
  const [bid] = useState(initialBid);

  const showToastMsg = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    const lastBid = sessionStorage.getItem("lastBidNo");
    const currentBidNo = bid?.bidNo || bid?.bid_no;
    if (lastBid && lastBid !== currentBidNo) {
      sessionStorage.removeItem("savedBidPdf");
      sessionStorage.removeItem("savedSubDocs");
      setPdfPath("");
      setSubDocs([]);
      setShowPdf(false);
      setViewingDoc(null);
    }
    sessionStorage.setItem("lastBidNo", currentBidNo);
  }, [bid]);

  const handleBack = async () => {
    try {
      if (pdfPath) {
        await fetch(`${SERVER_URL}/api/delete-bid-pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: pdfPath }),
        });
        sessionStorage.removeItem("savedBidPdf");
      }
    } catch (err) { console.error(err); }
    navigate(-1);
  };

  const handleTogglePdf = async () => {
    setError("");
    if (showPdf) return setShowPdf(false);
    if (pdfPath) return setShowPdf(true);
    if (!bid?.bidLink) return setError("No bid link available");

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/save-bid-pdf?url=${encodeURIComponent(bid.bidLink)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      sessionStorage.setItem("savedBidPdf", data.filePath);
      sessionStorage.setItem("savedSubDocs", JSON.stringify(data.subDocuments || []));

      setPdfPath(data.filePath);
      setSubDocs(data.subDocuments || []);
      setShowPdf(true);
    } catch (err) {
      setError("Failed to load bid document.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePdf = async () => {
    if (!pdfPath) return alert("First load the Bid Document!");

    setIsAnalyzing(true);
    setError("");

    try {
      const fileUrl = `${SERVER_URL}${pdfPath}`;
      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) throw new Error("PDF not found");

      const blob = await fileRes.blob();
      const formData = new FormData();
      formData.append("file", blob, pdfPath.split("/").pop());

      const djangoRes = await fetch("http://localhost:8000/api/analyze-pdf/", {
        method: "POST",
        body: formData,
      });

      const result = await djangoRes.json();
      if (!djangoRes.ok) throw new Error(result.error || "Analysis failed");

      setAnalysisResult(result);
      setIsAnalyzing(false);
      alert("Analysis Complete!");

      setTimeout(() => {
        document.getElementById("related-docs-section")?.scrollIntoView({ behavior: "smooth" });
      }, 500);

    } catch (err) {
      setError("Analysis failed: " + err.message);
      setIsAnalyzing(false);
    }
  };

  // YE HAI TERA MAIN HERO FUNCTION — AB SAB KUCH YAHAN HO RAHA HAI
  const handleExtractDocs = async () => {
    if (!pdfPath) return alert("Load Bid PDF first!");

    setIsAnalyzing(true);
    setError("");

    try {
      const fileUrl = `${SERVER_URL}${pdfPath}`;
      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) throw new Error("PDF not found");

      const blob = await fileRes.blob();
      const formData = new FormData();
      formData.append("file", blob, pdfPath.split("/").pop());

      // YE CORRECT ENDPOINT HAI — JISME DOWNLOAD + SAVE HO RAHA HAI
      const djangoRes = await fetch("http://localhost:8000/api/extract-documents/", {
        method: "POST",
        body: formData,
      });

      const result = await djangoRes.json();
      if (!djangoRes.ok) throw new Error(result.error || "Extraction failed");

      const savedDocs = (result.downloaded_subdocs || [])
        .filter(doc => doc.saved_as)
        .map(doc => ({
          url: `${SERVER_URL}${doc.saved_as}`,  // Direct media URL
          name: doc.filename || `Document ${result.downloaded_subdocs.indexOf(doc) + 1}`
        }));

      // Purana format maintain kar rahe hain taaki UI same rahe
      setAnalysisResult(prev => ({
        ...prev,
        attached_documents: savedDocs.map(d => d.url)
      }));

      showToastMsg(`Successfully extracted & saved ${savedDocs.length} documents!`);

    } catch (err) {
      console.error("Extract Error:", err);
      setError("Failed to extract: " + err.message);
      showToastMsg("Extraction failed!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfPath) return;
    const a = document.createElement("a");
    a.href = `${SERVER_URL}${pdfPath}`;
    a.download = `Bid-${(bid?.bidNo || "document").replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
    a.click();
  };

  const handleOpenDocument = (url, name) => {
    if (!url) return;

    const cleanUrl = url.trim();
    const ext = cleanUrl.split(".").pop().split("?")[0].toLowerCase();

    if (cleanUrl.includes("sso.gem.gov.in") || cleanUrl.includes("login") || cleanUrl.includes("authenticate")) {
      return window.open(`http://localhost:5100/api/fetch-doc?url=${encodeURIComponent(cleanUrl)}`, "_blank");
    }

    if (ext === "pdf") {
      return setViewingDoc({ url: cleanUrl, name });
    }

    if (["xls", "xlsx", "doc", "docx", "ppt", "pptx"].includes(ext)) {
      const viewer = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(cleanUrl)}`;
      return window.open(viewer, "_blank");
    }

    return window.open(cleanUrl, "_blank");
  };

  return (
    <>
      <div id="ten_conatian">
        <div id="hehr"><Side /></div>
        <div className="participation-container">

          {isAnalyzing && (
            <div className="analysis-modal-overlay">
              <div className="analysis-modal analyzing">
                <div className="spinner"><span className="inner-dot" /></div>
                <h3>Your Bid is being Analyzed</h3>
                <p>Please wait, extracting & saving documents...</p>
              </div>
            </div>
          )}

          <div className="header">
            <h2>{company?.company_name || "Selected Company"}</h2>
            <p className="bid-number">Bid No: {bid?.bidNo || bid?.bid_no || "N/A"}</p>
          </div>

          <div id="mid_mainh">
            <div id="left_wala">
              <div className="bid-details-card">
                <div className="bid-info">
                  <p><strong>Items:</strong> {bid?.items || bid?.items_description || "—"}</p>
                  <p><strong>Quantity:</strong> {bid?.quantity || "—"}</p>
                  <p><strong>Department:</strong> {bid?.department || "—"}</p>
                  <p><strong>Start Date:</strong> {bid?.startDate || bid?.start_date || "—"}</p>
                  <p><strong>End Date:</strong> {bid?.endDate || bid?.end_date || "—"}</p>
                </div>
              </div>

              {error && <p className="no-doc error">{error}</p>}

              {showPdf && pdfPath && (
                <div className="pdf-viewer">
                  <iframe src={`${SERVER_URL}${pdfPath}`} width="100%" height="650px" frameBorder="0" title="Bid Document" />
                </div>
              )}
            </div>

            <div id="right_wala">
              <div className="action-buttons">
                <button onClick={handleTogglePdf} disabled={loading}>
                  {loading ? "Loading..." : showPdf ? "Hide Bid Document" : "View Bid Document"}
                </button>
                <button className="download-btn" onClick={handleDownload}>Download PDF</button>
                <button className="analyze-btn" onClick={handleAnalyzePdf} disabled={isAnalyzing}>
                  {isAnalyzing ? "Analyzing..." : "Analyze PDF"}
                </button>
                <button className="extract-btn" onClick={handleExtractDocs}>
                  Extract Documents
                </button>
              </div>
            </div>
          </div>

          {/* EXTRACTED DOCUMENTS — AB YE DIRECT SAVED MEDIA URLS DIKHA RAHE HAIN */}
          {analysisResult?.attached_documents && analysisResult.attached_documents.length > 0 && (
            <div className="sub-docs" style={{ marginTop: "50px" }}>
              <h3>Extracted Documents (Saved Locally)</h3>
              <ul>
                {analysisResult.attached_documents.map((url, i) => (
                  <li key={i}>
                    <span className="doc-badge">PDF</span> Document {i + 1}
                    <button className="doc-btn" onClick={() => setViewingDoc({ url, name: `Document ${i + 1}` })}>
                      View Here
                    </button>
                    <button className="doc-btn" onClick={() => handleOpenDocument(url, `Document ${i + 1}`)}>
                      Open in New Tab
                    </button>
                    <a href={url} download className="doc-btn">Download</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {viewingDoc && (
            <div style={{ marginTop: "50px", padding: "20px", border: "3px solid #007bff", borderRadius: "12px", background: "#f8fdff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, color: "#007bff" }}>{viewingDoc.name}</h3>
                <button onClick={() => setViewingDoc(null)} style={{ padding: "10px 20px", background: "#dc3545", color: "white", border: "none", borderRadius: "8px" }}>
                  Close Document
                </button>
              </div>
              <iframe
                src={viewingDoc.url}
                width="100%"
                height="900px"
                title={viewingDoc.name}
                style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                allow="fullscreen"
              />
            </div>
          )}

          {subDocs.length > 0 && (
            <div className="sub-docs" style={{ marginTop: "50px" }}>
              <h3>Other Attached Documents (from GeM)</h3>
              <ul>
                {subDocs.map((doc, i) => {
                  const url = typeof doc === 'object' ? doc.url : doc;
                  const name = typeof doc === 'object' ? doc.name : `Document ${i + 1}`;
                  return (
                    <li key={i}>
                      <span className="doc-badge">PDF</span> {name}
                      <a href={url} target="_blank" rel="noopener noreferrer" className="doc-btn">View</a>
                      <button className="doc-btn" onClick={() => openDoc(url)}>Open via Proxy</button>
                      <a href={url} download className="doc-btn">Download</a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {showToast && (
            <div style={{
              position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)",
              background: "#28a745", color: "white", padding: "15px 30px", borderRadius: "50px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)", zIndex: 9999, fontWeight: "bold"
            }}>
              {toastMsg}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ParticipationForm;