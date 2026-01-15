import React, { useState, useEffect } from "react";
import ingredientService from "../../services/ingredient";

function IngredientSearch({ onSelect }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      setShow(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        console.log("Searching for:", search);
        const res = await ingredientService.getByName(search);
        console.log("Results:", res);

        const data = Array.isArray(res.data)
          ? res.data
          : res.data
          ? [res.data]
          : [];

        setResults(data);
        setShow(true);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (ing) => {
    onSelect(ing);
    setSearch("");
    setResults([]);
    setShow(false);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search ingredient... (type at least 2 characters)"
        className="form-input"
      />

      {loading && (
        <div
          style={{ padding: "0.5rem", textAlign: "center", color: "#6b7280" }}
        >
          Searching...
        </div>
      )}

      {show && results.length > 0 && (
        <div className="search-results">
          {results.map((ing) => (
            <div
              key={ing.productId}
              onClick={() => handleSelect(ing)}
              className="search-result-item"
            >
              <div className="search-result-name">{ing.name}</div>
              <div className="search-result-info">
                Unit: {ing.sizeUnit} | ${ing.price}
              </div>
            </div>
          ))}
        </div>
      )}

      {show && results.length === 0 && !loading && search.length >= 2 && (
        <div className="search-results">
          <div style={{ padding: "0.75rem", color: "#6b7280" }}>
            No ingredients found
          </div>
        </div>
      )}
    </div>
  );
}

export default IngredientSearch;
