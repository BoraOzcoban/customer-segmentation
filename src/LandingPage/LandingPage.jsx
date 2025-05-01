import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import "./styles.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/filtered_dataset_output.json")
      .then((res) => res.text())
      .then((txt) => {
        const arr = txt
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line));
        setUsers(arr);
      });
  }, []);

  const ageBuckets = { "<25": 0, "25-34": 0, "35-44": 0, "45+": 0 };
  const heightBuckets = { "<5'4\"": 0, "5'4-5'6": 0, "5'7-5'9": 0, ">5'9": 0 };
  const sizeCounts = {};

  const bustCounts = {};
  const bodyTypeCounts = {};

  users.forEach((u) => {
    if (u["bust size"]) {
      bustCounts[u["bust size"]] = (bustCounts[u["bust size"]] || 0) + 1;
    }
    if (u["body type"]) {
      bodyTypeCounts[u["body type"]] =
        (bodyTypeCounts[u["body type"]] || 0) + 1;
    }
    const age = parseInt(u.age, 10);
    if (!isNaN(age)) {
      if (age < 25) ageBuckets["<25"]++;
      else if (age < 35) ageBuckets["25-34"]++;
      else if (age < 45) ageBuckets["35-44"]++;
      else ageBuckets["45+"]++;
    }
    const hMatch = u.height?.match(/(\d+)'[\s]*(\d+)"/);
    if (hMatch) {
      const inches = parseInt(hMatch[1], 10) * 12 + parseInt(hMatch[2], 10);
      if (inches < 64) heightBuckets["<5'4\""]++;
      else if (inches <= 66) heightBuckets["5'4-5'6"]++;
      else if (inches <= 69) heightBuckets["5'7-5'9"]++;
      else heightBuckets[">5'9"]++;
    }
    const sz = u.size;
    if (!isNaN(sz)) sizeCounts[sz] = (sizeCounts[sz] || 0) + 1;
  });

  const makePie = (counts) => ({
    labels: Object.keys(counts),
    datasets: [
      {
        data: Object.values(counts),
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#ffcd56",
          "#4bc0c0",
          "#9966ff",
          "#ff9f40",
        ],
      },
    ],
  });

  const makeBar = (counts) => ({
    labels: Object.keys(counts),
    datasets: [{ label: "", data: Object.values(counts) }],
  });

  return (
    <div className="container">
      <h1 className="title">User Demographics Analysis</h1>

      <div className="chart-container">
        <h2>Bust Size</h2>
        <Pie data={makePie(bustCounts)} options={{ responsive: true }} />
      </div>

      <div className="chart-container">
        <h2>Body Type</h2>
        <Pie data={makePie(bodyTypeCounts)} options={{ responsive: true }} />
      </div>

      <div className="chart-container">
        <h2>Age</h2>
        <Bar data={makeBar(ageBuckets)} options={{ responsive: true }} />
      </div>

      <div className="chart-container">
        <h2>Height</h2>
        <Bar data={makeBar(heightBuckets)} options={{ responsive: true }} />
      </div>

      <div className="chart-container">
        <h2>Size</h2>
        <Bar data={makeBar(sizeCounts)} options={{ responsive: true }} />
      </div>

      <div className="actions">
        <button
          className="go-to-recommendations-btn"
          onClick={() => navigate("/recommendations")}
        >
          Go to Product Reccomendations
        </button>
      </div>
    </div>
  );
}
