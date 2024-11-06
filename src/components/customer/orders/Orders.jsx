import React, { useState, useEffect } from "react";
import axios from "axios";
import style from "./orders.module.css";

const Orders = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/user/myorders/${customerId}`
        );
        const sortedOrders = response.data.sort(
          (a, b) => new Date(b.order_date) - new Date(a.order_date)
        );
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchOrders();
    }
  }, [customerId]);

  const handleCancelOrder = async (order) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/orders/cancel-order",
        {
          orderId: order.order_id,
          orderDate: order.order_date,
        }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.order_id === order.order_id ? { ...o, status: "canceled" } : o
          )
        );
        alert("Order canceled successfully.");
      } else {
        alert(response.data.error);
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      alert("There was an error canceling the order.");
    }
  };

  const handleDetailsClick = (order) => {
    setSelectedOrder(order);
  };

  const aggregateItems = (items) => {
    const aggregated = items.reduce((acc, item) => {
      if (!acc[item.product_name]) {
        acc[item.product_name] = { ...item, quantity: 0 };
      }
      acc[item.product_name].quantity += item.quantity;
      return acc;
    }, {});

    return Object.values(aggregated);
  };

  const calculateTotalPrice = (item) => {
    const price = parseFloat(item.price);
    const quantity = parseInt(item.quantity, 10);
    if (!isNaN(price) && !isNaN(quantity)) {
      return (price * quantity).toFixed(2);
    }
    return "N/A";
  };

  // Function to check if the order can be canceled (within 2 days)
  const canCancelOrder = (orderDate) => {
    const currentDate = new Date();
    const orderDateObj = new Date(orderDate);
    const differenceInTime = currentDate.getTime() - orderDateObj.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    return differenceInDays <= 2; // Check if 2 days or less
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div className={style.ordersContainer}>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <table className={style.orderTable}>
          <thead>
            <tr>
              <th>Order Date</th>
              <th>Total Items</th>
              <th>Total Cost</th>
              <th>Tax</th>
              <th>Total with Tax</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.order_id}
                className={
                  selectedOrder && selectedOrder.order_id === order.order_id
                    ? style.selectedOrderRow
                    : ""
                }
              >
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>{order.items.length}</td>
                <td>${(order.total - order.tax).toFixed(2)}</td>
                <td>${order.tax.toFixed(2)}</td>
                <td>${(order.totalWithTax - order.tax).toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <button onClick={() => handleDetailsClick(order)}>
                    Details
                  </button>
                  {order.status !== "canceled" &&
                    canCancelOrder(order.order_date) && (
                      <button onClick={() => handleCancelOrder(order)}>
                        Cancel Order
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className={style.orderDetails}>
          <h3>Order Details</h3>
          <p>Customer: {selectedOrder.customer_name}</p>
          <h4>Items:</h4>
          <ul className={style.orderItems}>
            {aggregateItems(selectedOrder.items).map((item, index) => (
              <li
                key={`${item.product_name}-${index}`}
                className={style.orderItem}
              >
                {item.image_path && (
                  <img
                    src={`http://localhost:5000${item.image_path}`}
                    alt={item.product_name}
                    className={style.productImage}
                  />
                )}
                {item.product_name} x {item.quantity} ($
                {calculateTotalPrice(item)})
              </li>
            ))}
          </ul>
          <div className={style.button}>
            <button onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
