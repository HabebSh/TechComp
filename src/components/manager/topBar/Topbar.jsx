import styles from "./topBar.module.css";
const Topbar = ({ managerName }) => {
  return (
    <div className={styles.topBar}>
      <h1>Welcome {managerName}</h1>
    </div>
  );
};

export default Topbar;
