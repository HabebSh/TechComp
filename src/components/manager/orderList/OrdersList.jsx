
import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderDetails from "../orderDetails/OrderDetails";
import SearchBar from "../../customer/searchBar/SearchBar"; // Import the SearchBar component
import styles from "./ordersList.module.css";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [category, setCategory] = useState("buying");
  const [searchVal, setSearchVal] = useState("");
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders", {
          params: { status: category },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [category]);

  const handleUserClick = (userId, orderDate) => {
    if (
      selectedOrder &&
      selectedOrder.userId === userId &&
      selectedOrder.orderDate === orderDate
    ) {
      setSelectedOrder(null);
      setShow(false);
    } else {
      setSelectedOrder({ userId, orderDate });
      setShow(true);
    }
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (userId, confirm = false) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/update-status-by-user/${userId}`,
        { status: "received", confirm }
      );
      if (response.data.confirmationRequired) {
        const confirmUpdate = window.confirm(response.data.message);
        if (confirmUpdate) {
          await handleStatusUpdate(userId, true);
        }
      } else if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.user_id === userId ? { ...order, status: "received" } : order
          )
        );
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortConfig.key) {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "totalWithTax") {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (sortConfig.key === "order_date") {
        valA = new Date(a.order_date);
        valB = new Date(b.order_date);
      }

      if (valA < valB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    }
    return 0;
  });

  const filteredOrders = sortedOrders
    .filter((order) =>
      order.customer_name.toLowerCase().includes(searchVal.toLowerCase())
    )
    .filter((order) => {
      if (category === "buying") {
        return order.status === "buying";
      } else if (category === "received") {
        return order.status === "received";
      } else if (category === "canceled") {
        return order.status === "canceled";
      }
      return true;
    });

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderOrderList = (orders) => (
    <table className={styles.ordersTable}>
      <thead>
        <tr>
          <th>User ID</th>
          <th onClick={() => handleSort("customer_name")}>Customer Name</th>
          <th onClick={() => handleSort("order_date")}>Order Date & Time</th>
          <th>Total (Excl. Taxes)</th>
          <th>Total Taxes</th>
          <th onClick={() => handleSort("totalWithTax")}>Total with Taxes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.length > 0 ? (
          orders.map((order) => {
            const orderDate = new Date(order.order_date);
            const formattedDate = orderDate.toLocaleDateString();
            const formattedTime = orderDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isSelected =
              selectedOrder &&
              selectedOrder.userId === order.user_id &&
              selectedOrder.orderDate === order.order_date;

            return (
              <tr
                key={`${order.user_id}-${order.order_date}`}
                className={isSelected ? styles.selectedOrderRow : ""}
              >
                <td>{order.user_id}</td>
                <td>{order.customer_name}</td>
                <td>{`  ${formattedDate} - ${formattedTime}`}</td>
                <td>${Number(order.total - order.tax).toFixed(2)}</td>
                <td>${Number(order.tax).toFixed(2)}</td>
                <td>${Number(order.totalWithTax -order.tax).toFixed(2)}</td>
                <td>
                  <button
                    onClick={() =>
                      handleUserClick(order.user_id, order.order_date)
                    }
                  >
                    {isSelected && show ? "Hide Orders" : "View Orders"}
                  </button>
                  {category === "buying" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(order.user_id, order.order_date)
                      }
                      style={{ marginLeft: "10px" }}
                    >
                      Received
                    </button>
                  )}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="7">No orders found for the given search criteria.</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className={styles.ordersListContainer}>
      <h1 className={styles.header}>Orders List</h1>
      <SearchBar
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        onSearch={() => {}}
      />
      <div className={styles.categoryButtons}>
        <button
          className={category === "buying" ? styles.active : ""}
          onClick={() => handleCategoryChange("buying")}
        >
          Customer Orders
        </button>
        <button
          className={category === "received" ? styles.active : ""}
          onClick={() => handleCategoryChange("received")}
        >
          Received Orders
        </button>
        <button
          className={category === "canceled" ? styles.active : ""}
          onClick={() => handleCategoryChange("canceled")}
        >
          Canceled Orders
        </button>
      </div>

      {renderOrderList(currentOrders)}

      {selectedOrder && show && (
        <OrderDetails
          userId={selectedOrder.userId}
          orderDate={selectedOrder.orderDate}
          status={category}
        />
      )}
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

export default OrdersList;
