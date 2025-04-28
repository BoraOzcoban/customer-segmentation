import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import "./styles.css";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGoToRecommendations = () => {
    navigate("/recommendations");
  };

  const shoppingFrequencyData = {
    labels: ["High Frequency", "Medium Frequency", "Low Frequency"],
    datasets: [
      {
        label: "Shopping Frequency Segments",
        data: [40, 35, 25],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56"],
      },
    ],
  };

  // Trend Following Segments
  const trendFollowingSegmentsData = {
    labels: [
      "Trend Followers",
      "Average Trend Followers",
      "Non Trend Followers",
    ],
    datasets: [
      {
        label: "Trend Following Segments",
        data: [30, 40, 30],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56"],
      },
    ],
  };

  return (
    <div className="container">
      <h1 className="title">Customer Segmentation Analysis</h1>

      {/* Shopping Frequency Segments */}
      <div className="chart-container">
        <h2>Shopping Frequency Segments</h2>
        <Pie data={shoppingFrequencyData} options={{ responsive: true }} />
      </div>

      {/* Trend Following Segments */}
      <div className="chart-container">
        <h2>Trend Following Segments</h2>
        <Pie data={trendFollowingSegmentsData} options={{ responsive: true }} />
      </div>

      <div className="actions">
        <button
          className="go-to-recommendations-btn"
          onClick={handleGoToRecommendations}
        >
          Go to Product Recommendations
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
