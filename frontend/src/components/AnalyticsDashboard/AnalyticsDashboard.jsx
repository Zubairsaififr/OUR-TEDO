import React, { useEffect } from "react";
import "./AnalyticsDashboard.css";
import Chart from "chart.js/auto";

const AnalyticsDashboard = () => {
  useEffect(() => {
    // Line Chart
    const lineCtx = document.getElementById("lineChart").getContext("2d");
    const lineChart = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Website Visits",
            data: [12000, 19000, 15000, 18000, 22000, 25000],
            borderColor: "#4facfe",
            backgroundColor: "rgba(79, 172, 254, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });

    // Doughnut Chart
    const doughnutCtx = document.getElementById("doughnutChart").getContext("2d");
    const doughnutChart = new Chart(doughnutCtx, {
      type: "doughnut",
      data: {
        labels: ["Ongoing", "Currently","Upcoming"],
        datasets: [
          {
            data: [60, 30, 10],
            backgroundColor: ["#4facfe", "#00f2fe", "#a6c1ee"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });

    // ✅ Cleanup on unmount (destroy old charts)
    return () => {
      lineChart.destroy();
      doughnutChart.destroy();
    };
  }, []);

  const progressData = [
    { label: "Conversion Rate", value: 75 },
    { label: "Bounce Rate", value: 30 },
    { label: "New Users", value: 60 },
    { label: "Returning Users", value: 45 },
  ];

  return (
    <div className="analytics-container">
      <div className="dashboard-header">
        <h1>Tedo Dashboard</h1>
      </div>

      <div className="graphs-container">
        <div className="graph-card">
          <h2 className="graph-title">Analyzed Tenders</h2>
          <canvas id="lineChart"></canvas>
        </div>

        <div className="graph-card">
          <h2 className="graph-title">Pricing Details</h2>
          <canvas id="doughnutChart"></canvas>
        </div>

        <div className="graph-card">
          <h2 className="graph-title">Performance Metrics</h2>
          <div className="progress-container">
            {progressData.map((item, index) => (
              <div key={index} className="progress-item">
                <div className="progress-label">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
