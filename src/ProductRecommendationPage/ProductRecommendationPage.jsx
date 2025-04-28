import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./styles.css";

const allProducts = [
  {
    id: 123373,
    name: "Product 123373",
    category: "Clothing",
    price: 99,
    rating: 4,
  },
  {
    id: 137585,
    name: "Product 137585",
    category: "Electronics",
    price: 199,
    rating: 5,
  },
  {
    id: 822724,
    name: "Product 822724",
    category: "Accessories",
    price: 49,
    rating: 3,
  },
  {
    id: 1427750,
    name: "Product 1427750",
    category: "Home Goods",
    price: 75,
    rating: 4,
  },
  {
    id: 222318,
    name: "Product 222318",
    category: "Clothing",
    price: 129,
    rating: 5,
  },
  {
    id: 296430,
    name: "Product 296430",
    category: "Electronics",
    price: 249,
    rating: 4,
  },
  {
    id: 206536,
    name: "Product 206536",
    category: "Accessories",
    price: 79,
    rating: 5,
  },
  {
    id: 555063,
    name: "Product 555063",
    category: "Clothing",
    price: 99,
    rating: 3,
  },
  {
    id: 955151,
    name: "Product 955151",
    category: "Home Goods",
    price: 60,
    rating: 4,
  },
  {
    id: 468314,
    name: "Product 468314",
    category: "Electronics",
    price: 129,
    rating: 3,
  },
];

const allCustomers = [
  {
    id: 9,
    name: "Customer 9",
    shoppingFrequency: "High Frequency",
    trendFollowing: "Trend Followers",
  },
  {
    id: 25,
    name: "Customer 25",
    shoppingFrequency: "Medium Frequency",
    trendFollowing: "Non Trend Followers",
  },
  {
    id: 35,
    name: "Customer 35",
    shoppingFrequency: "Low Frequency",
    trendFollowing: "Average Trend Followers",
  },
  {
    id: 44,
    name: "Customer 44",
    shoppingFrequency: "High Frequency",
    trendFollowing: "Trend Followers",
  },
  {
    id: 47,
    name: "Customer 47",
    shoppingFrequency: "Medium Frequency",
    trendFollowing: "Non Trend Followers",
  },
];

const filters = {
  priceRange: ["Under $50", "$50 - $100", "$100 - $200", "$200+"],
  shoppingFrequency: ["High Frequency", "Medium Frequency", "Low Frequency"],
  trendFollowing: [
    "Trend Followers",
    "Average Trend Followers",
    "Non Trend Followers",
  ],
};

export default function ProductRecommendationsPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: null,
    shoppingFrequency: null,
    trendFollowing: null,
  });
  const [recommendations, setRecommendations] = useState({});

  useEffect(() => {
    Papa.parse("/item_item_recommendations.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) {
          console.error("CSV errors:", errors);
          return;
        }
        const recs = {};
        data.forEach(({ user_id, item_id }) => {
          const uid = Number(user_id),
            iid = Number(item_id);
          if (!recs[uid]) recs[uid] = [];
          recs[uid].push(iid);
        });
        setRecommendations(recs);
      },
    });
  }, []);

  const getProductById = (id) => allProducts.find((p) => p.id === id);

  const handleFilterChange = (cat, val) =>
    setSelectedFilters((prev) => ({
      ...prev,
      [cat]: prev[cat] === val ? null : val,
    }));

  // Apply priceRange filter to a list of itemIds
  const applyProductFilters = (itemIds) => {
    const { priceRange } = selectedFilters;
    return itemIds.filter((iid) => {
      const p = getProductById(iid);
      if (!p) return false;
      if (priceRange) {
        if (
          (priceRange === "Under $50" && p.price >= 50) ||
          (priceRange === "$50 - $100" && (p.price < 50 || p.price > 100)) ||
          (priceRange === "$100 - $200" && (p.price <= 100 || p.price > 200)) ||
          (priceRange === "$200+" && p.price <= 200)
        )
          return false;
      }
      return true;
    });
  };

  const filteredUserEntries = Object.entries(recommendations)
    .map(([uidStr, items]) => {
      const uid = Number(uidStr);
      const cust = allCustomers.find((c) => c.id === uid);
      if (!cust) return null;
      const { shoppingFrequency, trendFollowing } = selectedFilters;
      if (shoppingFrequency && cust.shoppingFrequency !== shoppingFrequency)
        return null;
      if (trendFollowing && cust.trendFollowing !== trendFollowing) return null;
      const userItems = applyProductFilters(items);
      return userItems.length ? [uid, userItems] : null;
    })
    .filter(Boolean);

  const sendCsvAsMail = async () => {
    try {
      const res = await fetch("/item_item_recommendations.csv");
      const txt = await res.text();
      window.location.href = `mailto:?subject=Recommendations CSV&body=${encodeURIComponent(
        txt
      )}`;
    } catch {
      alert("Failed to load CSV for emailing.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">User-Based Recommendations</h1>

      <div className="filters-section">
        <h2>Filters</h2>

        <div
          className="filter-category price-range"
          data-selected-count={selectedFilters.priceRange ? 1 : 0}
        >
          <h3>Price Range</h3>
          <div className="filter-buttons-container">
            {filters.priceRange.map((pr) => (
              <button
                key={pr}
                className={`filter-btn ${
                  selectedFilters.priceRange === pr ? "selected" : ""
                }`}
                onClick={() => handleFilterChange("priceRange", pr)}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>

        <div
          className="filter-category shopping-frequency"
          data-selected-count={selectedFilters.shoppingFrequency ? 1 : 0}
        >
          <h3>Shopping Frequency</h3>
          <div className="filter-buttons-container">
            {filters.shoppingFrequency.map((sf) => (
              <button
                key={sf}
                className={`filter-btn ${
                  selectedFilters.shoppingFrequency === sf ? "selected" : ""
                }`}
                onClick={() => handleFilterChange("shoppingFrequency", sf)}
              >
                {sf}
              </button>
            ))}
          </div>
        </div>

        <div
          className="filter-category trend-following"
          data-selected-count={selectedFilters.trendFollowing ? 1 : 0}
        >
          <h3>Trend Following</h3>
          <div className="filter-buttons-container">
            {filters.trendFollowing.map((tf) => (
              <button
                key={tf}
                className={`filter-btn ${
                  selectedFilters.trendFollowing === tf ? "selected" : ""
                }`}
                onClick={() => handleFilterChange("trendFollowing", tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Email CSV button */}
      <div style={{ textAlign: "right", margin: "1rem 0" }}>
        <button className="send-csv-btn" onClick={sendCsvAsMail}>
          📧 Email CSV
        </button>
      </div>

      {/* User-Based Recommendations */}
      <div className="recommendations-section">
        {filteredUserEntries.length ? (
          filteredUserEntries.map(([uid, items]) => (
            <div className="user-recommendation-block" key={uid}>
              <h3>User ID: {uid}</h3>
              <div className="recommendations-list">
                {items.map((iid, i) => {
                  const p = getProductById(iid);
                  return (
                    <div className="product-item" key={i}>
                      <h4 className="product-name">{p.name}</h4>
                      <p className="product-category">{p.category}</p>
                      <p className="product-price">${p.price}</p>
                      <p className="product-rating">Rating: {p.rating} stars</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p>No users match your filters.</p>
        )}
      </div>
    </div>
  );
}
