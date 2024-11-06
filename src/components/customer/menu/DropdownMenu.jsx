

import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DropdownMenu.module.css";

const DropdownMenu = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleMyOrders = () => {
    // Redirect to my orders page
    navigate("/my-orders");
  };

  const handleUpdateProfile = () => {
    // Redirect to update profile page
    navigate("/update-profile");
  };

  const handleLogout = () => {
    // Perform logout operation
    if (onLogout) {
      onLogout();
    }

    // Clear user authentication data (example: local storage)
    localStorage.removeItem("user");

    // Redirect to home page after logout
    navigate("/");
  };

  return (
    <div className={styles.dropdownMenu}>
      <ul>
        <li>
          <button onClick={handleMyOrders}>My Orders</button>
        </li>
        <li>
          <button onClick={handleUpdateProfile}>Update Profile</button>
        </li>
        <li>
          <button onClick={handleLogout}>Log Out</button>
        </li>
      </ul>
    </div>
  );
};

export default DropdownMenu;
