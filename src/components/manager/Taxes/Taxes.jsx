import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Taxes.module.css";

const Taxes = () => {
  const [taxRate, setTaxRate] = useState("0"); // Initialize with a default value

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tax/tax-rate")
      .then((response) => {
        setTaxRate(response.data.taxRate || "0"); // Ensure taxRate is a string
      })
      .catch((error) => console.error("Error fetching tax rate:", error));
  }, []);

  const handleTaxChange = (e) => {
    setTaxRate(e.target.value);
  };

  const handleTaxSubmit = () => {
    axios
      .post("http://localhost:5000/api/tax/tax-rate", { taxRate })
      .then((response) => {
        alert("Tax rate updated successfully!");
        setTaxRate("0"); // Reset taxRate to 0 after successful update
      })
      .catch((error) => {
        console.error("Error updating tax rate:", error);
        alert("Failed to update tax rate. Please try again.");
      });
  };

  return (
    <div className={styles.taxesContainer}>
      <h2>Set Tax Rate</h2>
      <div>
        <label>
          Tax Rate (%):
          <input
            type="number"
            value={taxRate}
            onChange={handleTaxChange}
            min="0"
            max="100"
            step="0.01"
          />
        </label>
        <button onClick={handleTaxSubmit}>Set Tax Rate</button>
      </div>
    </div>
  );
};

export default Taxes;
