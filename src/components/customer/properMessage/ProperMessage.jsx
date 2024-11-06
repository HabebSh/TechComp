import React from "react";

function ProperMessage({ message, type, clearMessage }) {
  const messageStyles = {
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const successStyle = {
    ...messageStyles,
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  };

  const errorStyle = {
    ...messageStyles,
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  };

  return (
    <div style={type === "success" ? successStyle : errorStyle}>
      <span>{message}</span>
      <button onClick={clearMessage} style={{ marginLeft: "10px" }}>
        X
      </button>
    </div>
  );
}

export default ProperMessage;
