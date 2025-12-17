import React from "react";
import { useNavigate } from "react-router-dom";
import "./PlanDetails.css";

export default function PlanDetails() {
  const navigate = useNavigate(); // Initialize useNavigate inside the component

  return (
    <div className="plan-container">
      {/* Header */}
      <div className="plan-header">
        <h2 className="gradient-text">Plan Details</h2>
        <button onClick={() => navigate("/PlansModal")} className="purchase-btn">
          Purchase New Plan
        </button>
      </div>

      {/* Trial Plan Box */}
      <div className="trial-plan">
        <div className="trial-header">
          <h3>
            Trial Plan{" "}
            <span className="badge active">Active</span>
            <span className="badge trial">Trial</span>
          </h3>
          <span className="discount-badge">100% OFF</span>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="icon blue">📄</div>
            <p>Tenders</p>
            <h4>0</h4>
          </div>
          <div className="stat-card">
            <div className="icon green">💳</div>
            <p>Analysis Credits</p>
            <h4>10</h4>
          </div>
          <div className="stat-card">
            <div className="icon purple">⏱️</div>
            <p>Validity</p>
            <h4>1 month</h4>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="details-grid">
        <div className="details-card">
          <h4>Pricing Details</h4>
          <ul>
            <li>
              <span>Cost per Tender</span>
              <span>₹0</span>
            </li>
            <li>
              <span>Original Cost</span>
              <span>₹0</span>
            </li>
            <li className="green-text">
              <span>Discount Applied</span>
              <span>-₹0</span>
            </li>
            <li className="final">
              <span>Final Amount</span>
              <span>₹0</span>
            </li>
          </ul>
        </div>

        <div className="details-card">
          <h4>Subscription Period</h4>
          <ul>
            <li>
              <span>Start Date</span>
              <span>September 19, 2025</span>
            </li>
            <li>
              <span>End Date</span>
              <span>October 19, 2025</span>
            </li>
          </ul>
        </div>

        <div className="details-card">
          <h4>Account Info</h4>
          <ul>
            <li>
              <span>Created</span>
              <span>September 19, 2025</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}