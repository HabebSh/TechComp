import React, { useState } from "react";
import axios from "axios";
import styles from "./settings.module.css"; // Assume you have a CSS module for styling

const Settings = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    city: "",
    zipCode: "",
    isManager: 0, // Default to 0 (not a manager)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "isManager" ? parseInt(value, 10) : value,
    });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/users/registerManager", formData)
      .then((response) => {
        console.log("User added:", response.data);
        alert("User added successfully!");
      })
      .catch((error) => {
        console.error("Error adding user:", error);
        alert("Error adding user. Please try again.");
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    axios
      .put("http://localhost:5000/api/users/updateUser", formData) // Assuming correct endpoint for updating user
      .then((response) => {
        console.log("User updated:", response.data);
        alert("User updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        alert("Error updating user. Please try again.");
      });
  };

  return (
    <div className={styles.settingsContainer}>
      <h2>Settings Page</h2>
      <form>
        <label>
          First Name:
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        <label>
          Phone Number:
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </label>
        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>
        <label>
          City:
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </label>
        <label>
          Zip Code:
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
          />
        </label>
        <label>
          Is Manager:
          <select
            name="isManager"
            value={formData.isManager}
            onChange={handleChange}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </label>
        <div className={styles.buttonGroup}>
          <button onClick={handleAdd}>Add</button>
          <button onClick={handleUpdate}>Update</button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
