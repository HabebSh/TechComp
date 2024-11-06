import React from "react";

function FilterSidebar({ filters, setFilters }) {
  const handleCheckboxChange = (category, value) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (newFilters[category].includes(value)) {
        newFilters[category] = newFilters[category].filter(
          (item) => item !== value
        );
      } else {
        newFilters[category].push(value);
      }
      return newFilters;
    });
  };

  return (
    <div className="filter-sidebar">
      <FilterCategory
        title="Memory"
        options={["4GB", "8GB", "16GB", "32GB", "64GB", "128GB", "256GB"]}
        selectedOptions={filters.memory}
        onCheckboxChange={(value) => handleCheckboxChange("memory", value)}
      />
      <FilterCategory
        title="Computer Types"
        options={["MSI", "LENOVO", "ACER", "DELL", "APPLE", "ASUS"]}
        selectedOptions={filters.types}
        onCheckboxChange={(value) => handleCheckboxChange("types", value)}
      />
    </div>
  );
}

function FilterCategory({ title, options, selectedOptions, onCheckboxChange }) {
  return (
    <div className="filter-category">
      <h3>{title}</h3>
      {options.map((option) => (
        <div key={option}>
          <input
            type="checkbox"
            id={option}
            checked={selectedOptions.includes(option)}
            onChange={() => onCheckboxChange(option)}
          />
          <label htmlFor={option}>{option}</label>
        </div>
      ))}
    </div>
  );
}

export default FilterSidebar;
