import styles from "./searchBar.module.css"; // Adjust the path if necessary

const SearchBar = ({ searchVal, setSearchVal, onSearch }) => {
  const handleChangeInput = (e) => {
    const value = e.target.value;
    setSearchVal(value);
    onSearch(value); // Trigger search on input change
  };

  return (
    <div className={styles.coverInput}>
      <input
        onChange={(e) => handleChangeInput(e)}
        type="text"
        placeholder="Search..."
        value={searchVal}
        className={styles.input}
      />
      <button
        type="button"
        onClick={() => onSearch(searchVal)}
        className={styles.button}
      >
        Find
      </button>
    </div>
  );
};

export default SearchBar;