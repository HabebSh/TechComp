import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./outOfStockProducts.module.css";
import { useNavigate } from "react-router-dom";

function OutOfStockProducts() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State to track the current page
  const productsPerPage = 8; // Number of products per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/productOrders/low-stock"
        );

        const savedLowStockProducts =
          JSON.parse(localStorage.getItem("lowStockProducts")) || [];
        const orderedProducts =
          JSON.parse(localStorage.getItem("orderedProducts")) || [];

        const apiFilteredProducts = res.data.filter(
          (product) =>
            !orderedProducts.some((ordered) => ordered.id === product.id)
        );

        const isEqual =
          JSON.stringify(savedLowStockProducts.map((p) => p.id).sort()) ===
          JSON.stringify(apiFilteredProducts.map((p) => p.id).sort());

        if (!isEqual) {
          const allLowStockProducts = [
            ...apiFilteredProducts,
            ...savedLowStockProducts.filter(
              (saved) =>
                !apiFilteredProducts.some(
                  (apiProduct) => apiProduct.id === saved.id
                )
            ),
          ];

          const productsWithChecked = allLowStockProducts.map((product) => ({
            ...product,
            checked: false,
          }));

          localStorage.setItem(
            "lowStockProducts",
            JSON.stringify(productsWithChecked)
          );

          setLowStockProducts(productsWithChecked);
        } else {
          setLowStockProducts(savedLowStockProducts);
        }
      } catch (err) {
        console.error("Failed to fetch low stock products:", err);
      }
    };

    fetchLowStockProducts();
  }, []);

  // Function to calculate products to display on the current page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = lowStockProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(lowStockProducts.length / productsPerPage); // Total number of pages

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setLowStockProducts((prevProducts) =>
      prevProducts.map((product) => ({
        ...product,
        checked: newSelectAll,
      }))
    );
  };

  const handleCheckboxChange = (index) => {
    setLowStockProducts((prevProducts) =>
      prevProducts.map((product, i) =>
        i === index ? { ...product, checked: !product.checked } : product
      )
    );
  };

  const handleOrderButtonClick = () => {
    const selectedProducts = lowStockProducts.filter(
      (product) => product.checked
    );

    const currentOrders =
      JSON.parse(localStorage.getItem("orderedProducts")) || [];
    const updatedOrders = [...currentOrders, ...selectedProducts];
    localStorage.setItem("orderedProducts", JSON.stringify(updatedOrders));

    const remainingLowStockProducts = lowStockProducts.filter(
      (product) => !product.checked
    );
    setLowStockProducts(remainingLowStockProducts);
    localStorage.setItem(
      "lowStockProducts",
      JSON.stringify(remainingLowStockProducts)
    );

    navigate("/products/orders");
  };

  const handleClearLocalStorage = () => {
    localStorage.clear(); // This clears all data in localStorage
    setLowStockProducts([]); // Optionally reset your state as well
  };

  // Function to change pages
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.productsSaveContainer}>
            <div className={styles.header}>
              <h1>Low Stock Products</h1>
              <div className={styles.selectAllContainer}>
                <label className={styles.selectAllLabel}>Select All</label>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className={styles.selectAllCheckbox}
                />
              </div>
            </div>
            <button
              className={styles.clearbutton}
              onClick={handleClearLocalStorage}
            >
              Clear Local Storage
            </button>
            <button
              className={styles.orderButton}
              onClick={handleOrderButtonClick}
            >
              Order Selected Products
            </button>
            <div className={styles.productsList}>
              <table className={styles.productsTable}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Supplier</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Memory</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          src={`http://localhost:5000${product.image_path}`}
                          alt={product.product_name}
                          className={styles.productImage}
                        />
                      </td>
                      <td>{product.product_name}</td>
                      <td>{product.supplier}</td>
                      <td>{product.description}</td>
                      <td>${product.price}</td>
                      <td>{product.memory}</td>
                      <td>{product.type}</td>
                      <td>{product.category_name}</td>
                      <td>{product.quantity}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={product.checked}
                          onChange={() => handleCheckboxChange(index)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className={styles.paginationControls}>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? styles.activePage : ""}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutOfStockProducts;
