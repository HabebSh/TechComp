import React, { useState } from "react";
import styles from "./productDetailsModal.module.css";

function ProductDetailsModal({
  product,
  quantities,
  onQuantityChange,
  onAddToCart,
  onClose,
}) {
  const [cartMessage, setCartMessage] = useState(""); // State for cart message
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  if (!product) return null;

  const {
    product_name,
    description,
    supplier,
    memory,
    type,
    quantity,
    price,
    image_path,
    discount_percentage,
    start_date,
    end_date,
  } = product;

  const getDiscountedPrice = () => {
    const today = new Date();
    const originalPrice = parseFloat(price);
    let discountedPrice = originalPrice;

    if (
      discount_percentage &&
      new Date(start_date) <= today &&
      new Date(end_date) >= today
    ) {
      discountedPrice =
        originalPrice - originalPrice * (discount_percentage / 100);
    }

    return { originalPrice, discountedPrice };
  };

  const { originalPrice, discountedPrice } = getDiscountedPrice();
  const hasDiscount = originalPrice !== discountedPrice;

  const handleAddToCart = () => {
    const selectedQuantity = quantities[product.id] || 0;

    if (selectedQuantity > product.quantity) {
      // Show error message if the quantity exceeds available stock
      setErrorMessage("You cannot buy more than the available quantity.");
      setTimeout(() => {
        setErrorMessage(""); // Hide the error message after 3 seconds
      }, 3000);
    } else if (selectedQuantity === 0) {
      setErrorMessage("Please select at least 1 item.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    } else {
      onAddToCart(product, selectedQuantity);

      // Show success message when product is added to the cart
      setCartMessage(`"${product_name}" added to cart!`);
      setTimeout(() => {
        setCartMessage(""); // Hide the message after 3 seconds
      }, 3000);
    }
  };

  // Prevent quantity change if it exceeds available stock
  const handleQuantityChange = (productId, amount) => {
    const currentQuantity = quantities[productId] || 0;
    const newQuantity = currentQuantity + amount;

    if (newQuantity > product.quantity) {
      setErrorMessage("You cannot add more than the available quantity.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    } else if (newQuantity < 0) {
      setErrorMessage("Quantity cannot be less than zero.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    } else {
      onQuantityChange(productId, amount);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <img
          src={`http://localhost:5000${image_path}`}
          alt={product_name}
          className={styles.productImage}
        />
        <div className={styles.details}>
          <h2>{product_name}</h2>
          <p>{description}</p>
          <p>Supplier: {supplier}</p>
          <p>Memory: {memory}</p>
          <p>Type: {type}</p>
          <p>Quantity available: {quantity}</p>

          {/* Display price, showing original and discounted price if applicable */}
          <p>
            Price:{" "}
            {hasDiscount ? (
              <>
                <span className={styles.originalPrice}>
                  ${originalPrice.toFixed(2)}
                </span>
                <span className={styles.discountedPrice}>
                  ${discountedPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span>${originalPrice.toFixed(2)}</span>
            )}
          </p>

          <div className={styles.quantityControl}>
            <button onClick={() => handleQuantityChange(product.id, -1)}>
              -
            </button>
            <span>{quantities[product.id] || 0}</span>
            <button onClick={() => handleQuantityChange(product.id, 1)}>
              +
            </button>
          </div>

          <button
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={(quantities[product.id] || 0) === 0}
          >
            Add to Cart
          </button>

          {/* Cart Message */}
          {cartMessage && (
            <div className={styles.cartMessage}>{cartMessage}</div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsModal;
