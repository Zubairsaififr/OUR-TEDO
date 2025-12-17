// import React, { useEffect, useState } from "react";
// import "./BidViewer.css";

// export default function BidViewer({ bidNo, serverUrl }) {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [mainPdf, setMainPdf] = useState(null);
//   const [links, setLinks] = useState([]);

//   useEffect(() => {
//     if (!bidNo) return;

//     const fetchData = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         // 👇 Construct correct GeM URL
//         const gemUrl = `https://bidplus.gem.gov.in/bid/view-bid/${bidNo}`;
//         console.log("🔗 Fetching bid URL:", gemUrl);

//         const res = await fetch(`${serverUrl}/api/save-bid-pdf?url=${encodeURIComponent(gemUrl)}`);
//         const json = await res.json();
//         if (!res.ok) throw new Error(json.error || "Failed to load bid document");

//         setMainPdf(json.mainPdf || null);
//         setLinks(json.mergedLinks || []);
//       } catch (err) {
//         console.error("Error fetching bid data:", err);
//         setError(err.message || "Error loading PDF");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [bidNo, serverUrl]);

//   if (!bidNo) return <div>No Bid Number Provided</div>;
//   if (loading) return <div className="bv-loading">Loading...</div>;
// if (error)
//   return (
//     <div className="bv-root">
//       <h3>Bid Viewer for {bidNo}</h3>
//       <div className="bv-error">
//         ⚠️ Could not load bid document automatically.<br />
//         You can manually view the bid at:{" "}
//         <a
//           href={`https://bidplus.gem.gov.in/bidlists?bid_no=${bidNo}`}
//           target="_blank"
//           rel="noreferrer"
//         >
//           Open on GeM
//         </a>
//       </div>
//     </div>
//   );


//   const displayUrl = mainPdf?.filePath
//     ? `${serverUrl}${mainPdf.filePath}`
//     : mainPdf?.url;

//   return (
//     <div className="bv-root">
//       <h3>Bid Viewer for {bidNo}</h3>

//       {displayUrl ? (
//         <iframe
//           src={displayUrl}
//           title="Bid PDF"
//           className="bv-pdf-iframe"
//         />
//       ) : (
//         <div>No PDF available</div>
//       )}

//       <div className="bv-related">
//         <h4>📎 Related Documents</h4>
//         {links.length === 0 && <div>No related links found.</div>}
//         <ul className="bv-links">
//           {links.map((l, idx) => (
//             <li key={idx} className="bv-link-row">
//               <div className="bv-link-meta">
//                 <strong>{l.name || new URL(l.url).hostname}</strong>
//                 <span className="bv-link-cat">{l.category}</span>
//               </div>
//               <a
//                 href={l.url}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="bv-download-btn"
//               >
//                 Open / Download
//               </a>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }





import React, { useState, useEffect } from "react";
import axios from "axios";

const BidViewer = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedBids, setSavedBids] = useState([]);
  const [error, setError] = useState("");

  // 🧠 Load saved bids from Django
  const fetchSavedBids = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/bids/");
      setSavedBids(response.data);
    } catch (err) {
      console.error("Error fetching bids:", err);
    }
  };

  useEffect(() => {
    fetchSavedBids();
  }, []);

  // 📥 Save new PDF (via Node)
  const handleSaveBid = async () => {
    if (!url) return alert("Please enter a Bid URL");
    setLoading(true);
    setError("");

    try {
      const res = await axios.get("http://localhost:5100/api/save-bid-pdf", {
        params: { url },
      });

      console.log("Bid saved:", res.data);
      alert("PDF saved & uploaded to backend ✅");
      fetchSavedBids(); // refresh list

    } catch (err) {
      console.error(err);
      setError("Failed to save bid. Please check server logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Poppins, sans-serif" }}>
      <h2>📄 GeM Bid PDF Downloader</h2>
      <p>Enter a valid bid link to download & upload it into your Django backend.</p>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter GeM Bid URL"
          style={{
            width: "70%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "8px",
          }}
        />
        <button
          onClick={handleSaveBid}
          disabled={loading}
          style={{
            padding: "10px 15px",
            backgroundColor: loading ? "#aaa" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : "Save Bid"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />
      <h3>🗂️ Saved Bids from Django</h3>

      {savedBids.length === 0 ? (
        <p>No bids saved yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f3f3" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>#</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Bid No</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>File</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {savedBids.map((bid, index) => (
              <tr key={bid.id || index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{index + 1}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{bid.bid_no}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <a
                    href={`http://127.0.0.1:8000${bid.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <button
                    onClick={() => window.open(`http://127.0.0.1:8000${bid.file}`, "_blank")}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BidViewer;
