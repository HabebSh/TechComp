
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./messages.module.css"; // Assuming you have a CSS module for styling

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const messagesPerPage = 5; // Define how many messages per page

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = () => {
    axios
      .get("/api/messages/SendMessage")
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  };

  // Pagination Logic
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(
    indexOfFirstMessage,
    indexOfLastMessage
  );
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.messagesContainer}>
      <h2>Messages</h2>
      <table className={styles.messagesTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>User Name</th>
            <th>Phone</th>
            <th>Message</th>
            <th>Connected At</th>
          </tr>
        </thead>
        <tbody>
          {currentMessages.map((message) => (
            <tr key={message.id}>
              <td>{message.id}</td>
              <td>{message.userName}</td>
              <td>{message.phone}</td>
              <td>{message.message}</td>
              <td>
                {new Date(message.connected_at).toLocaleDateString()}{" "}
                {new Date(message.connected_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
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

export default Messages;
