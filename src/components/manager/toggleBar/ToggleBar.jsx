import React from "react";
import styles from "./toggleBar.module.css";

const ToggleBar = ({ isActive, onToggle }) => {
  const handleToggle = () => {
    onToggle(!isActive);
  };

  return (
    <div
      className={`${styles.toggleBar} ${isActive ? styles.active : ""}`}
      onClick={handleToggle}
    >
      <div className={styles.toggleThumb}></div>
    </div>
  );
};
export default ToggleBar;
