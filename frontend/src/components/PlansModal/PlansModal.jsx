import React from "react";
import "./PlansModal.css";

const plans = [
  {
    title: "Starter",
    icon: "👤",
    tenders: "1-4 tenders/month",
    price: "₹1,500",
    per: "/tender",
    features: ["Basic processing", "Email support", "Standard analysis"],
    color: "#ffe6e6",
  },
  {
    title: "Growth",
    icon: "📈",
    tenders: "5-15 tenders/month",
    price: "₹1,350",
    per: "/tender",
    features: ["Priority processing", "Chat support", "Advanced analysis"],
    save: "Save 10%",
    color: "#fff3e0",
  },
  {
    title: "Scale",
    icon: "⚡",
    tenders: "16-99 tenders/month",
    price: "₹1,000",
    per: "/tender",
    features: [
      "Fast processing",
      "Phone support",
      "AI Powered analysis report",
    ],
    save: "Save 33%",
    tag: "Most Popular",
    color: "#e6f0ff",
  },
  {
    title: "Enterprise",
    icon: "🚀",
    tenders: "100+ tenders/month",
    price: "₹700",
    per: "/tender",
    features: ["Instant processing", "Dedicated manager", "Custom solutions"],
    save: "Save 53%",
    color: "#e6ffee",
  },
];

export default function PlansModal() {
  const handleClick = (plan) => {
    alert(`You clicked on ${plan.title} plan`);
  };

  return (
    <section className="pricing-wrapper">
      <div className="pricing-header">
        <h1 className="title">
          <span className="gradient-badge">Our Plans</span>
        </h1>
        <p>
          Create your perfect tender processing package with intelligent pricing,
          powerful features, and flexible customization options
        </p>
        <div className="icons-row">
          <span>🔒 Secure Processing</span>
          <span>⏰ 24/7 Support</span>
          <span>🏆 Best Value Guarantee</span>
        </div>
      </div>

      <h2 className="section-subtitle">📈 Pricing Tiers & Savings</h2>

      <div className="pricing-grid">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className="pricing-card"
            style={{ backgroundColor: plan.color }}
            onClick={() => handleClick(plan)}
          >
            {plan.tag && <span className="tag">{plan.tag}</span>}
            <h3>
              <span className="icon">{plan.icon}</span> {plan.title}
            </h3>
            <p className="tenders">{plan.tenders}</p>
            <p className="price">
              <strong>{plan.price}</strong>
              <span className="per">{plan.per}</span>
            </p>
            {plan.save && <div className="save">{plan.save}</div>}
            <ul>
              {plan.features.map((f, i) => (
                <li key={i}>✔ {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
