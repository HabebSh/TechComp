

import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Discounts.module.css"; // Import CSS module

const Discounts = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/discounts/products/categories"
        );
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories.");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/discounts/products`,
            {
              params: { category: selectedCategory },
            }
          );
          setProducts(response.data);
        } catch (err) {
          console.error("Error fetching products:", err);
          setError("Failed to load products.");
        }
      };
      fetchProducts();
    }
  }, [selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!discountPercentage || !startDate || !endDate) {
      setError("Discount percentage, start date, and end date are required.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/discounts/add-discount",
        {
          productId: selectedProductId,
          category: selectedCategory,
          discountPercentage,
          startDate,
          endDate,
        }
      );
      if (response.data.success) {
        setMessage(response.data.message);
        setError(null);
        // Reset form fields
        setSelectedCategory("");
        setSelectedProductId("");
        setDiscountPercentage("");
        setStartDate("");
        setEndDate("");
        setProducts([]); // Clear the products list
      } else {
        setError(response.data.error || "Failed to add discount.");
      }
    } catch (err) {
      console.error("Error adding discount:", err);
      setError("An error occurred while adding the discount.");
    }
  };

  // Function to calculate the minimum end date
  const calculateMinEndDate = (startDate) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split("T")[0];
  };

  return (
    <div className={styles.container}>
      <h2>Manage Discounts</h2>
      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.message}>{message}</p>}
      <form onSubmit={handleSubmit} className={styles.formDiscount}>
        <div className={styles.option}>
          <label htmlFor="category">Select Category:</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedProductId(""); // Reset product selection
            }}
          >
            <option value="">-- Select a Category --</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {selectedCategory && (
          <div>
            <label htmlFor="product">Select Product (Optional):</label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">-- Apply to All Products in Category --</option>
              {products.map((product) => {
                const price =
                  product.discounted_price !== null &&
                  product.discounted_price !== undefined
                    ? Number(product.discounted_price)
                    : Number(product.price);

                return (
                  <option key={product.id} value={product.id}>
                    {product.product_name} - ${price.toFixed(2)}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="discount">Discount Percentage:</label>
          <input
            id="discount"
            type="number"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
            min="0"
            max="100"
          />
        </div>
        <div className={styles.start}>
          <label htmlFor="start-date">Start Date:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setEndDate(""); // Reset the end date
            }}
            min={new Date().toISOString().split("T")[0]} // Ensure start date is today or later
          />
        </div>
        <div className={styles.end}>
          <label htmlFor="end-date">End Date:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={
              startDate
                ? calculateMinEndDate(startDate)
                : new Date().toISOString().split("T")[0]
            } // Ensure end date is after start date
          />
        </div>
        <div className={styles["button-container"]}>
          <button type="submit">Add Discount</button>
        </div>
      </form>
    </div>
  );
};

export default Discounts;
