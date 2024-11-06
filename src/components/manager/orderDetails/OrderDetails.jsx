

import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./orderDetails.module.css";

const OrderDetails = ({ userId, orderDate, status }) => {
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/user/${userId}`,
          {
            params: { status },
          }
        );
        console.log("Fetched Orders:", response.data); // Log full response
        const filteredOrders = response.data.filter(
          (order) => order.order_date === orderDate
        );
        console.log("Filtered Orders:", filteredOrders); // Log filtered orders
        const aggregatedOrders = aggregateOrders(filteredOrders);
        setOrderDetails(aggregatedOrders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      }
    };

    fetchUserOrders();
  }, [userId, orderDate, status]);

  const aggregateOrders = (orders) => {
    const grouped = orders.reduce((acc, order) => {
      const key = `${order.product_name}-${order.price}`;
      if (!acc[key]) {
        acc[key] = { ...order };
      } else {
        acc[key].quantity += order.quantity;
      }
      return acc;
    }, {});
    return Object.values(grouped);
  };

  if (orderDetails.length === 0) {
    return <div>No orders found for the selected date.</div>;
  }

  return (
    <div className={styles.orderDetailsContainer}>
      <h2>Order Details</h2>
      <table className={styles.orderDetailsTable}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Name</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {orderDetails.map((order) => (
            <tr key={order.order_id}>
              <td>
                <img
                  src={`http://localhost:5000${order.image_path}`}
                  alt={order.product_name}
                  className={styles.productImage}
                />
              </td>
              <td>{order.product_name}</td>
              <td>{order.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetails;