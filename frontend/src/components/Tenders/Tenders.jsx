import React, { useState, useEffect, useMemo } from 'react';
import './Tenders.css';
import Side from '../Side/side';
import { IoSearchCircle } from "react-icons/io5";
import { FaFilter } from "react-icons/fa";
import BidCard from '../BidCard/BidCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

function Tenders() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companies, setCompanies] = useState([]);
  const [cards, setCards] = useState([]);
  const [query, setQuery] = useState(""); // Search keyword (visible in inputs)
  const [companyKeywords, setCompanyKeywords] = useState(""); // Hidden keywords for company filter
  const [selectedState, setSelectedState] = useState(""); // Selected state for filtering
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch companies
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

  // Fetch cards
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://127.0.0.1:5000/api/data")
      .then((res) => setCards(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Handle company selection
  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);

    if (companyId) {
      const selected = companies.find((c) => c.id === parseInt(companyId));

      if (selected && selected.nature_of_business) {
        const { products = [], services = [] } = selected.nature_of_business;
        const keywords = [...products, ...services].join(" ").trim();
        setCompanyKeywords(keywords);
      }
    } else {
      setCompanyKeywords("");
    }
  };

  // Filter cards based on companyKeywords, query, and selectedState
  const filteredCards = useMemo(() => {
    let result = cards;

    const applyKeywordFilter = (keywordString) => {
      if (!keywordString.trim()) return;
      const terms = keywordString.split(/\s+/).filter(term => term);
      if (!terms.length) return;
      const lowerTerms = terms.map(t => t.toLowerCase());
      result = result.filter(card =>
        Object.values(card).some(value => {
          const val = String(value).toLowerCase();
          return lowerTerms.some(term => val.includes(term));
        })
      );
    };

    // Apply company filter first
    applyKeywordFilter(companyKeywords);

    // Then apply search query filter
    applyKeywordFilter(query);

    // Then apply state filter (flexible match on any field containing the state name)
    if (selectedState) {
      const lowerState = selectedState.toLowerCase();
      result = result.filter(card =>
        Object.values(card).some(value => {
          const val = String(value).toLowerCase();
          return val.includes(lowerState);
        })
      );
    }

    return result;
  }, [cards, query, companyKeywords, selectedState]);

  // Handle download
  const handleDownload = () => {
    if (filteredCards.length === 0) {
      alert("No data to download.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredCards);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bids");
    XLSX.writeFile(wb, "bids.xlsx");
  };

  return (
    <div className="Cont">
      <div className="sidemenu">
        <Side />
      </div>

      <div className="page">
        {/* Search bar */}
        <div className="Search">
          <form action="" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Bid Number/Item Name/ Department"
              id="sbox"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span id="sbtn">
              <IoSearchCircle className="size-[45px] transform translate-x-227 -translate-y-11.5" />
            </span>
          </form>
        </div>

        {/* Filters Section */}
        <div className="card1">
          <div id="icons">
            <FaFilter />
            Filters
          </div>
          <div>
            State
            <select
              name=""
              id="drop"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Delhi">Delhi</option>
              <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Lakshadweep">Lakshadweep</option>
              <option value="Puducherry">Puducherry</option>
              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
              <option value="Ladakh">Ladakh</option>
            </select>
          </div>
          <div>
            Search Keyword <br />
            <input style={{ border: "1px solid white" }}
              type="text"
              id="sb"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <br />
          </div>
          <div>
            <button id="add">Add+</button>
          </div>
          <div id="depart">
            Department <br />
            <input style={{ border: "1px solid white" }} type="text" id="dep" />
            <br />
            <button
              style={{ border: "1px solid black", padding: "3px" }}
              id="deps"
            >
              Search
            </button>
          </div>

          <div>
            <div className="company-select">
              <label></label>
              <select value={selectedCompany} onChange={handleCompanyChange}>
                <option value=""> Search by company </option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>
            <button id='uhuhu'>Search</button>
          </div>
        </div>

        {/* Cards Section */}
        <div id="card2">
          {loading ? <div>Loading...</div> : <BidCard cards={filteredCards} />}
          {/* Download Button */}
          <div id='gfgf' style={{ cursor: "pointer" }}>
            <button onClick={handleDownload}>Download Bids</button>
          </div>
        </div>


      </div>
    </div>
  );
}

export default Tenders;