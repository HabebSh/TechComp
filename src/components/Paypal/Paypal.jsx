import React from "react"; // Ensure React is imported only once
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import styles from "./PayPal.module.css";

const PayPal = ({ email, cartItems, clearCart, onPaymentSuccess }) => {
  const initialOptions = {
    "client-id":
      "AVzh_WX20rGoaw38dsdEe9SVltxEWg-zqQrYs-uROzkAbOwpzxGYBkNVwmWzc_A5xgFsufKdEixw-JnJ",
    currency: "USD",
    intent: "capture",
  };

  const createOrder = async (data, actions) => {
    const totalAmount = cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0) // Fix the syntax error
      .toFixed(2);

    if (isNaN(totalAmount) || totalAmount <= 0) {
      // Fix the condition
      console.error("Invalid total amount:", totalAmount);
      throw new Error("Invalid total amount");
    }

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: totalAmount,
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    console.log("Processing checkout with details:", data);
    try {
      const details = await actions.order.capture();
      alert("Payment Successful");

      onPaymentSuccess(details); // Only trigger the success callback
    } catch (error) {
      console.error("Error capturing order:", error);
    }
  };

  const onError = (err) => {
    console.error("Error with PayPal transaction:", err);
    alert("An error occurred with your PayPal transaction. Please try again.");
  };

  return (
    <div className={styles.PayPal}>
      <PayPalScriptProvider options={initialOptions}>
        <div className={styles.PayPalButtonsContainer}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            style={{
              shape: "rect",
              layout: "vertical",
            }}
          />
        </div>
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPal;
