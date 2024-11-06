import React, { useState } from "react";
import axios from "axios";
import styles from "./sendMessage.module.css"; // Corrected import statement



const SendMessage = ({ onClose }) => {
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMessage = { userName, phone, message };

    axios
      .post(`/api/messages/sendMessage`, newMessage) // Ensure the route matches the backend
      .then((response) => {
        console.log("Message sent:", response.data);
        onClose();
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };

  return (
    <div className={styles.sendMessageContainer}>
      <form onSubmit={handleSubmit}>
        <div>
          <label>User Name:</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Phone:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Message</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default SendMessage;
