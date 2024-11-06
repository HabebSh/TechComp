import React from "react";
import selectStyle from "./selectCategory.module.css";

const SelectCategory = ({ selectedCategory, handleCategoryChange }) => {
  return (
    <div className={selectStyle.selectCategory}>
      <select value={selectedCategory} onChange={handleCategoryChange}>
        <option value="">Select Category</option>
        <option value="cpu">CPU</option>
        <option value="motherboard">Motherboard</option>
        <option value="ram">RAM</option>
        <option value="gpu">GPU</option>
        <option value="power_supply">Power Supply</option>
        <option value="laptops">Laptops</option>
        <option value="computers">Computers</option>
      </select>
    </div>
  );
};

export default SelectCategory;
