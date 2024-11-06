

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PayPal from "../../Paypal/Paypal"; // Import PayPal component
import styles from "./cart.module.css";

function Cart({
  cart,
  updateCartQuantity,
  clearCart,
  isAuthenticated,
  handleLogin,
}) {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [error, setError] = useState(""); // Add error state for quantity check

  async function fetchUserId(email) {
    try {
      if (!email) {
        throw new Error("Email is required to fetch user ID");
      }

      const response = await axios.get(
        `http://localhost:5000/api/users/user-id/${isAuthenticated.email}`
      );

      if (response.data && response.data.userId) {
        console.log("Fetched user ID:", response.data.userId);
        return response.data.userId;
      } else {
        throw new Error("Failed to fetch user ID");
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  }

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tax/tax-rate")
      .then((response) => {
        setTaxRate(response.data.tax_rate);
      })
      .catch((error) => console.error("Error fetching tax rate:", error));
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAuthenticated.email) {
      fetchUserEmail(isAuthenticated.email); // Pass the user's email
    }
  }, [isAuthenticated]);

  const calculateDiscountedPrice = (product) => {
    const currentDate = new Date();

    if (product.discount_percentage && product.start_date && product.end_date) {
      const startDate = new Date(product.start_date);
      const endDate = new Date(product.end_date);

      if (currentDate >= startDate && currentDate <= endDate) {
        return parseFloat(
          (product.price * (1 - product.discount_percentage / 100)).toFixed(2)
        );
      }
    }

    return parseFloat(product.price);
  };

  const subtotal = cart.reduce((acc, item) => {
    if (item.product && item.product.price) {
      const discountedPrice = calculateDiscountedPrice(item.product);
      return acc + discountedPrice * item.quantity;
    }
    return acc;
  }, 0);

  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const fetchUserEmail = async (email) => {
    console.log("Fetching user email:", email); // Debugging log
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          params: { email },
        }
      );
      console.log("User email fetched:", response.data.email); // Debugging log
    } catch (error) {
      console.error("Error fetching user email:", error);
    }
  };

  const handleCheckout = () => {
    if (isCheckingOut) {
      console.log("Checkout already initiated, skipping...");
      return;
    }
    if (isAuthenticated) {
      setIsCheckingOut(true); // Start checkout process
      fetchUserEmail(isAuthenticated.email); // Fetch the user's email
      console.log("User email:", isAuthenticated.email); // Debugging
    } else {
      alert("Please log in first to proceed with the checkout.");
      navigate("/login");
    }
  };

  const processCheckout = async (details) => {
    console.log("Processing checkout with details:", details);

    // Check cart validity before sending it to the backend
    const invalidItems = cart.filter(
      (item) => !item.product || !item.product.product_name
    );
    if (invalidItems.length > 0) {
      alert(
        "Error: Some items in your cart are missing product details. Please review your cart."
      );
      return;
    }
    if (!isAuthenticated || !isAuthenticated.email) {
      console.error(
        "User is not authenticated or email is missing:",
        isAuthenticated
      );
      alert("Error: User is not authenticated or email is missing.");
      return;
    }

    const userEmail = isAuthenticated.email;

    try {
      const userId = await fetchUserId(userEmail);
      console.log("User ID retrieved:", userId);

      if (!userId) {
        console.error("Failed to fetch user ID for email:", userEmail);
        alert("Error: Missing user ID.");
        return;
      }

      if (!cart || cart.length === 0) {
        console.error("Cart is empty or not defined:", cart);
        alert("Error: Cart is empty.");
        return;
      }

      // Prepare cart items with discounted prices (if applicable) to send to the backend
      const cartItemsWithPrices = cart.map((item) => {
        const price = calculateDiscountedPrice(item.product); // Calculate discounted price (if applicable)
        return {
          productId: item.product.id,
          name: item.product.product_name,
          quantity: item.quantity,
          price, // Use the calculated price, which could be the discounted price
        };
      });

      console.log("Cart items being sent with prices:", cartItemsWithPrices);

      const response = await axios.post(
        "http://localhost:5000/api/orders/checkout",
        { cartItems: cartItemsWithPrices, paymentDetails: details, userId },
        { withCredentials: true }
      );
      console.log("Response is:", response);

      if (response.data.success) {
        console.log("Order processed successfully:", response.data);
        alert("Your order has been purchased!");
        setTimeout(() => {
          clearCart();
        }, 3000);
        navigate("/");
      } else {
        console.error("Order processing failed. Response data:", response.data);
        alert("Failed to process the order. Please try again.");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(
          "Bad Request - possibly missing product name or other required data:",
          error.response.data
        );
        alert(`Error processing the checkout: ${error.response.data.error}`);
      } else {
        console.error(
          "Error processing the checkout:",
          error.message,
          "Details:",
          error.response?.data || error
        );
        alert("There was an issue processing your checkout. Please try again.");
      }
    } finally {
      console.log("Checkout process finished. Setting isCheckingOut to false.");
      setIsCheckingOut(false);
    }
  };

  const handleQuantityChange = (productId, amount) => {
    const product = cart.find((item) => item.product.id === productId);
    const newQuantity = (product.quantity || 0) + amount;

    if (newQuantity < 0) {
      setError("Quantity cannot be less than zero.");
      return;
    }

    if (newQuantity > product.product.quantity) {
      setError("You cannot buy more than the available quantity.");
      return;
    }

    setError(""); // Clear error message
    updateCartQuantity(productId, amount);
  };

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartHeader}>Cart</h1>
      {cart.length === 0 ? (
        <p className={styles.emptyCart}>Your cart is empty</p>
      ) : (
        <div>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <ul className={styles.cartItems}>
            {cart.map((item, index) => (
              <li key={index} className={styles.cartItem}>
                <img
                  src={`http://localhost:5000${item.product.image_path}`}
                  alt={item.product.product_name}
                />
                <div className={styles.cartItemDetails}>
                  <h2>
                    {item.product?.product_name || "Product Name Missing"}
                  </h2>
                  <p>
                    Description:{" "}
                    {item.product?.description || "Product Description Missing"}
                  </p>
                  <p>
                    Price: $
                    {calculateDiscountedPrice(item.product).toFixed(2) ||
                      "Product Price Missing"}
                  </p>
                  <p>Supplier: {item.product.supplier}</p>
                  <p>Memory: {item.product.memory}</p>
                  <p>Type: {item.product.type}</p>
                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => handleQuantityChange(item.product.id, -1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.cartSummary}>
            <h2>Subtotal: ${(subtotal - tax).toFixed(2)}</h2>
            <h2>Tax: ${tax.toFixed(2)}</h2>
            <h2>Total: ${(total - tax).toFixed(2)}</h2>
          </div>
          <button className={styles.clearCartButton} onClick={clearCart}>
            Clear Cart
          </button>
          <button
            className={styles.checkoutButton}
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? "Processing..." : "Check Out"}
          </button>
          {isCheckingOut && (
            <div className={styles.paypalContainer}>
              <PayPal
                email={isAuthenticated.email}
                cartItems={cart.map((item) => ({
                  name: item.product.product_name, // Correctly referencing product_name
                  price: calculateDiscountedPrice(item.product), // Include price with potential discount
                  quantity: item.quantity,
                }))}
                clearCart={clearCart}
                onPaymentSuccess={processCheckout}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Cart;


