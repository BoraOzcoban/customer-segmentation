// src/ProductRecommendationsPage.jsx
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./styles.css";

export default function ProductRecommendationsPage() {
  const [users, setUsers] = useState([]);
  const [recs, setRecs] = useState({});
  const [filters, setFilters] = useState({
    bustSize: null,
    bodyType: null,
    heightRange: null,
    ageRange: null,
    size: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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

  useEffect(() => {
    Papa.parse("/item_item_recommendations.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const map = {};
        data.forEach(({ user_id, item_id }) => {
          const uid = Number(user_id),
            iid = Number(item_id);
          if (!map[uid]) map[uid] = [];
          map[uid].push(iid);
        });
        setRecs(map);
      },
    });
  }, []);

  const unique = (arr, key) => [
    ...new Set(arr.map((u) => u[key]).filter(Boolean)),
  ];
  const bustOpts = unique(users, "bust size");
  const bodyOpts = unique(users, "body type");
  const sizeOpts = unique(users, "size").sort((a, b) => a - b);
  const ageBuckets = ["<25", "25–34", "35–44", "45+"];
  const heightBuckets = ["<5'4\"", "5'4–5'6", "5'7–5'9", ">5'9"];

  const inAge = (age, bucket) => {
    const n = Number(age);
    if (bucket === "<25") return n < 25;
    if (bucket === "25–34") return n >= 25 && n < 35;
    if (bucket === "35–44") return n >= 35 && n < 45;
    return n >= 45;
  };
  const inHeight = (h, bucket) => {
    const m = h?.match(/(\d+)'[\s]*(\d+)"/);
    if (!m) return false;
    const inches = +m[1] * 12 + +m[2];
    if (bucket === "<5'4\"") return inches < 64;
    if (bucket === "5'4–5'6") return inches >= 64 && inches <= 66;
    if (bucket === "5'7–5'9") return inches >= 67 && inches <= 69;
    return inches > 69;
  };

  const noFilter = Object.values(filters).every((f) => !f);

  const filtered = Object.entries(recs)
    .map(([uidStr, items]) => {
      const uid = Number(uidStr);
      const u = users.find((x) => Number(x.user_id) === uid);
      if (!noFilter) {
        if (u) {
          if (filters.bustSize && u["bust size"] !== filters.bustSize)
            return null;
          if (filters.bodyType && u["body type"] !== filters.bodyType)
            return null;
          if (filters.ageRange && !inAge(u.age, filters.ageRange)) return null;
          if (filters.heightRange && !inHeight(u.height, filters.heightRange))
            return null;
          if (filters.size && Number(u.size) !== Number(filters.size))
            return null;
        } else {
          return null;
        }
      }
      return [uid, items];
    })
    .filter(Boolean);

  const handleSearch = () => {
    const id = Number(searchTerm);
    if (isNaN(id)) {
      setSearchResults([]);
      return;
    }
    const res = Object.entries(recs)
      .filter(([_, items]) => items.includes(id))
      .map(([uid]) => Number(uid));
    setSearchResults(res);
  };

  return (
    <div className="container">
      <h1 className="title">Product Recommendations</h1>

      <div className="filters-section">
        <h2>Filters</h2>
        <label>
          Bust Size:
          <select
            onChange={(e) =>
              setFilters((f) => ({ ...f, bustSize: e.target.value || null }))
            }
          >
            <option value="">All</option>
            {bustOpts.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>

        <label>
          Body Type:
          <select
            onChange={(e) =>
              setFilters((f) => ({ ...f, bodyType: e.target.value || null }))
            }
          >
            <option value="">All</option>
            {bodyOpts.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>

        <label>
          Age Range:
          <select
            onChange={(e) =>
              setFilters((f) => ({ ...f, ageRange: e.target.value || null }))
            }
          >
            <option value="">All</option>
            {ageBuckets.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>

        <label>
          Height Range:
          <select
            onChange={(e) =>
              setFilters((f) => ({ ...f, heightRange: e.target.value || null }))
            }
          >
            <option value="">All</option>
            {heightBuckets.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </label>

        <label>
          Size:
          <select
            onChange={(e) =>
              setFilters((f) => ({ ...f, size: e.target.value || null }))
            }
          >
            <option value="">All</option>
            {sizeOpts.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="recommendations-section">
        {filtered.length ? (
          filtered.map(([uid, items]) => (
            <div className="user-recommendation-block" key={uid}>
              <h3>User {uid}</h3>
              <div className="recommendations-list">
                {items.map((iid, idx) => (
                  <div className="product-item" key={idx}>
                    <p>Product ID: {iid}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>There are no users that match the selected criteria.</p>
        )}
      </div>

      <div className="search-section" style={{ marginTop: "2rem" }}>
        <h2>Search by Product ID</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter product ID"
        />
        <button onClick={handleSearch}>Search</button>
        {searchResults.length > 0 ? (
          <p>
            Product {searchTerm} is recommended to users:{" "}
            {searchResults.join(", ")}
          </p>
        ) : (
          searchTerm && <p>No users found for Product ID {searchTerm}.</p>
        )}
      </div>
    </div>
  );
}
