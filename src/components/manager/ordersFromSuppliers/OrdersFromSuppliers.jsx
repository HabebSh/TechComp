import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "../../customer/searchBar/SearchBar"; // Adjust the path if necessary
import styles from "./OrdersFromSuppliers.module.css";

const OrdersFromSuppliers = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchVal, setSearchVal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10; // Number of orders per page

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios
      .get("http://localhost:5000/api/ordersFromSuppliers/suppliers_orders")
      .then((res) => {
        const uniqueOrders = Array.from(
          new Set(res.data.map((order) => order.order_id))
        ).map((id) => res.data.find((order) => order.order_id === id));

        setOrders(uniqueOrders);
        setFilteredOrders(uniqueOrders);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
      });
  };

  const handleSort = (column) => {
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (a[column] < b[column]) return sortOrder === "asc" ? -1 : 1;
      if (a[column] > b[column]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredOrders(sortedOrders);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleReceiveOrder = (orderId) => {
    axios
      .post("http://localhost:5000/api/ordersFromSuppliers/receive_order", {
        order_id: orderId,
      })
      .then(() => {
        alert("Product quantity updated successfully!");
        setFilteredOrders(
          filteredOrders.map((order) =>
            order.order_id === orderId ? { ...order, received: "yes" } : order
          )
        );
      })
      .catch((err) => {
        console.error("Failed to receive order:", err);
        alert("Failed to receive order.");
      });
  };

  const handleSearch = (searchTerm) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = orders.filter((order) =>
      order.supplier_name.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredOrders(filtered);
  };

  // Get current orders for the current page
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  // Calculate total number of pages
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.container}>
      <h1>Supplier Orders</h1>

      <SearchBar
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        onSearch={handleSearch}
      />

      <table className={styles.ordersTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort("order_id")}>Order ID</th>
            <th onClick={() => handleSort("company_id")}>Company ID</th>
            <th onClick={() => handleSort("supplier_name")}>Supplier Name</th>
            <th onClick={() => handleSort("supplied_product")}>Product</th>
            <th onClick={() => handleSort("quantity")}>Quantity</th>
            <th onClick={() => handleSort("order_date")}>Order Date</th>
            <th onClick={() => handleSort("total_price")}>Total Price</th>
            <th>Received</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => {
            const backgroundColor =
              order.received === "yes" ? "lightgreen" : "lightcoral";
            return (
              <tr key={order.order_id}>
                <td style={{ backgroundColor }}>{order.order_id}</td>
                <td style={{ backgroundColor }}>{order.company_id}</td>
                <td style={{ backgroundColor }}>{order.supplier_name}</td>
                <td style={{ backgroundColor }}>{order.supplied_product}</td>
                <td style={{ backgroundColor }}>{order.quantity}</td>
                <td style={{ backgroundColor }}>
                  {new Date(order.order_date).toLocaleDateString()}
                </td>
                <td style={{ backgroundColor }}>
                  ${parseFloat(order.total_price).toFixed(2)}
                </td>
                <td style={{ backgroundColor }}>
                  {order.received === "yes" ? "Yes" : "No"}
                </td>
                <td style={{ backgroundColor }}>
                  {order.received !== "yes" && (
                    <button
                      className={styles.actionButton}
                      onClick={() => handleReceiveOrder(order.order_id)}
                    >
                      Receive Order
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className={styles.paginationControls}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={currentPage === index + 1 ? styles.activePage : ""}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrdersFromSuppliers;
