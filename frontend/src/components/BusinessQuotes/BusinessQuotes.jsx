import React from "react";
import "./BusinessQuotes.css";
import { FaCheckCircle } from "react-icons/fa";

const BusinessQuotes = () => {
  return (
    <div className="quotes-containerk">
      <h1>Grow your business with Lowest Quotes</h1>
      <p>
        Smart Procurement for SMEs - Get Best Prices for your Raw Material
        requirements
      </p>

      <div className="quotes-grid">
        <div className="quote-cardk">
          <FaCheckCircle className="icon" />
          Lowest Quotations for all Raw Materials
        </div>
        <div className="quote-cardk">
          <FaCheckCircle className="icon" />
          Credit Facilities Available for Purchases
        </div>
        <div className="quote-cardk">
          <FaCheckCircle className="icon" />
          Widest Range of Raw Materials
        </div>
        <div className="quote-cardk">
          <FaCheckCircle className="icon" />
          Stringent Quality Assurance of Deliveries
        </div>
        <div className="quote-cardk full-width">
          <FaCheckCircle className="icon" />
          Logistic support available for deliveries across India
        </div>
      </div>

      {/* <button className="cta-btn">View GEM Tenders</button> */}
    </div>
  );
};

export default BusinessQuotes;
