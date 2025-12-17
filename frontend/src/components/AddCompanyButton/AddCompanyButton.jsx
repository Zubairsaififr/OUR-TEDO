import React, { useEffect, useState } from "react";
import "./AddCompanyButton.css";
import { useNavigate } from "react-router-dom";
import BusinessQuotes from "../BusinessQuotes/BusinessQuotes";
import { updateSubscriptionStatus } from "../../utils/subscription";
import Side from '../Side/side'

export default function AddCompanyButton() {
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const active = await updateSubscriptionStatus();
      setIsSubscribed(active);
    };
    fetchStatus();
  }, []);

  const gotoCompany = () => {
    if (isSubscribed) {
      navigate("/CompanyForm");
    } else {
      alert("You currently do not have an active subscription plan.");
    }
  };

  const gotoPlans = () => {
    navigate("/PlansModal");
  };

  return (
    <>
    <div id="nobita">
    <div className="hehew">
      <Side/>
    </div>
      <div className="company-container">
        <div className="company-header">
          <h2 className="company-title">
            Registered <span>Companies</span>
          </h2>
          <button onClick={gotoPlans} className="btn-gradient">
            View Plans
          </button>
        </div>

        <div className="company-card">
          <p className="company-empty">No Company documents found</p>
          <p className="company-subtext">
            Add new company to get started or try a different search
          </p>
          <button onClick={gotoCompany} className="btn-gradient">
            Add New Company
          </button>
        </div>
        &nbsp;
        
        <div id="gwan">
        <BusinessQuotes />

        </div>
      </div>
      
      </div>
    </>
  );
}
