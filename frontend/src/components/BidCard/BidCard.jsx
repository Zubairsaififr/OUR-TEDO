import React, { useEffect, useState } from "react";
import "./BidCard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BidCard = ({ cards }) => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companies, setCompanies] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentBid, setCurrentBid] = useState(null);
  const cardsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Fetch Companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.warn("No token found, redirecting to login...");
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
        console.error("Error fetching companies:", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("access_token");
        }
      }
    };

    fetchCompanies();
  }, [navigate]);

  // ================================
  //  ✅ FORMAT CARDS
  // ================================
  let formattedCards = cards.map((item) => ({
    bidNo: item.bid_no || "N/A",
    bidLink: item.bid_link || "#",
    raNo: item.ra_no || "—",
    items: item.items || "N/A",
    quantity: item.quantity || "—",
    department: `${item.department_name || ""}, ${item.address || ""}`,
    startDate: item.start_date || "—",
    endDate: item.end_date || "—",
  }));

  // ================================
  //  ✅ SORTING ADDED HERE ONLY
  // ================================
  formattedCards.sort((a, b) => {
    const now = new Date();

    const dateA = new Date(a.endDate);
    const dateB = new Date(b.endDate);

    const aExpired = dateA < now;
    const bExpired = dateB < now;

    if (aExpired && !bExpired) return 1; // A expired → send to bottom
    if (!aExpired && bExpired) return -1; // B expired → send to bottom
    return dateA - dateB; // earlier end date first
  });

  // ================================
  //  Pagination
  // ================================
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = formattedCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(formattedCards.length / cardsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);

    if (totalPages > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const handlePageClick = (num) => {
    if (num !== "...") setCurrentPage(num);
  };

  // ================================
  // Participate Popup
  // ================================
  const handleParticipateClick = (bid) => {
    setCurrentBid(bid);
    setShowPopup(true);
  };

  const handleCompanySelect = (e) => {
    setSelectedCompany(e.target.value);
  };

  const handleContinue = () => {
    if (!selectedCompany) {
      alert("Please select a company first!");
      return;
    }
    const selected = companies.find((c) => c.id === parseInt(selectedCompany));

    try {
      sessionStorage.setItem("selectedCompany", JSON.stringify(selected));
      sessionStorage.setItem("selectedBid", JSON.stringify(currentBid));
    } catch (e) {
      console.warn("sessionStorage write failed:", e);
    }

    navigate("/participation-form", {
      state: { company: selected, bid: currentBid },
    });
  };

  return (
    <div>
      {/* ===== Cards Section ===== */}
      <div className="bid-container">
        {currentCards.map((bid, index) => (
          <div key={index} className="bid-card">
            <div className="bid-header">
              <div>
                <strong>Bid No.:</strong>{" "}
                <a
                  href={bid.bidLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blue-text"
                >
                  {bid.bidNo}
                </a>
              </div>
            </div>

            <div className="bid-body">
              <div className="bid-left">
                <p>
                  <strong>Items:</strong>{" "}
                  <span className="neela-text">{bid.items}</span>
                </p>
                <p>
                  <strong>Quantity:</strong> {bid.quantity}
                </p>
              </div>

              <div className="bid-right">
                <p>
                  <strong>Department Name And Address:</strong>
                </p>
                <p>{bid.department}</p>
              </div>

              <div className="bid-dates">
                <p>
                  <strong>Start Date:</strong>{" "}
                  <span className="green-text">{bid.startDate}</span>
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  <span className="orange-text">{bid.endDate}</span>
                </p>
              </div>

              <button id="kalooo" onClick={() => handleParticipateClick(bid)}>
                Participate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Pagination ===== */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {getPageNumbers().map((num, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(num)}
            className={currentPage === num ? "active" : ""}
            disabled={num === "..."}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* ===== Popup Modal ===== */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Select Your Participating Company</h3>

            <select
              className="company-select"
              value={selectedCompany}
              onChange={handleCompanySelect}
            >
              <option value="">Select Company </option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>

            <div className="popup-buttons">
              <button onClick={() => setShowPopup(false)}>Cancel</button>
              <button onClick={handleContinue}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidCard;
