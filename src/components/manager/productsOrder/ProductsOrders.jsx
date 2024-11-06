import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ProductsOrder.module.css";

function ProductsOrder() {
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const productsPerPage = 8; // Products to show per page
  const navigate = useNavigate();

  useEffect(() => {
    const storedOrders =
      JSON.parse(localStorage.getItem("orderedProducts")) || [];
    setOrderedProducts(storedOrders);
  }, []);

  // Calculate the products to display on the current page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = orderedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(orderedProducts.length / productsPerPage); // Total number of pages

  const handleQuantityChange = (productId, value) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: value,
    }));
  };

  const handleCheckboxChange = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleSendBack = (productId) => {
    const updatedOrders = orderedProducts.filter(
      (product) => product.id !== productId
    );
    const productToSendBack = orderedProducts.find(
      (product) => product.id === productId
    );

    localStorage.setItem("orderedProducts", JSON.stringify(updatedOrders));
    setOrderedProducts(updatedOrders);

    const lowStockProducts =
      JSON.parse(localStorage.getItem("lowStockProducts")) || [];

    const updatedLowStock = [...lowStockProducts, productToSendBack];
    localStorage.setItem("lowStockProducts", JSON.stringify(updatedLowStock));

    navigate("/products/OutOfStock");
  };

  const handleSubmitOrders = () => {
    const selectedOrders = orderedProducts.filter((product) =>
      selectedProducts.includes(product.id)
    );

    const supplierOrders = selectedOrders.reduce((acc, product) => {
      const quantity = parseInt(quantities[product.id] || 0);
      if (quantity > 0) {
        if (!acc[product.supplier]) {
          acc[product.supplier] = [];
        }
        acc[product.supplier].push({
          supplied_product: product.product_name,
          quantity,
          total_price: quantity * product.price,
          order_date: new Date().toISOString().split("T")[0],
        });
      }
      return acc;
    }, {});

    if (Object.keys(supplierOrders).length === 0) {
      alert("Please select valid quantities and products to order.");
      return;
    }

    Promise.all(
      Object.keys(supplierOrders).map((supplier) => {
        return axios.post(
          "http://localhost:5000/api/suppliersOrders/suppliers_orders",
          supplierOrders[supplier]
        );
      })
    )
      .then(() => {
        alert("Orders placed successfully!");

        const remainingProducts = orderedProducts.filter(
          (product) => !selectedProducts.includes(product.id)
        );

        setOrderedProducts(remainingProducts);
        localStorage.setItem(
          "orderedProducts",
          JSON.stringify(remainingProducts)
        );

        setQuantities({});
        setSelectedProducts([]);
      })
      .catch((err) => {
        console.error("Failed to place orders:", err);
        alert("Failed to place orders.");
      });
  };

  // Function to change pages
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.con}>
      <h1>Order Selected Products</h1>
      {orderedProducts.length > 0 ? (
        <>
          {selectedProducts.length > 0 && (
            <div>
              <button
                className={styles.submitButtonorders}
                onClick={handleSubmitOrders}
              >
                Submit Orders
              </button>
            </div>
          )}
          <table className={styles.productsTable}>
            <thead>
              <tr>
                <th>Select</th>
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
              {currentProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleCheckboxChange(product.id)}
                    />
                  </td>
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
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={quantities[product.id] || 0}
                      onChange={(e) =>
                        handleQuantityChange(product.id, e.target.value)
                      }
                      className={styles.quantityInput}
                    />
                  </td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleSendBack(product.id)}
                    >
                      Send Back
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
        </>
      ) : (
        <p className={styles.noProductsMessage}>No products selected.</p>
      )}
    </div>
  );
}

export default ProductsOrder;
