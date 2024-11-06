import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import styles from "./Dashboard.module.css";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const navigate = useNavigate(); // Initialize navigate for navigation

  const [startDate, setStartDate] = useState(""); // Leave blank initially
  const [endDate, setEndDate] = useState(formatDate(today)); // Default end date is today
  const [earliestOrderDate, setEarliestOrderDate] = useState(""); // Store earliest order date
  const [productData, setProductData] = useState([]);
  const [chartType, setChartType] = useState("revenue");
  const [maxQuantityProduct, setMaxQuantityProduct] = useState("");
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [receivedProductNames, setReceivedProductNames] = useState([]);
  const [lowStockProductNames, setLowStockProductNames] = useState([]);
  const [productLimit, setProductLimit] = useState("all");
  const [errorMessage, setErrorMessage] = useState(""); // To display error message

  // Fetch the earliest order date and set it as the start date
  const fetchEarliestOrderDate = useCallback(() => {
    axios
      .get("/api/dashboard/earliest") // Assuming this endpoint returns the earliest order date
      .then((response) => {
        const earliestOrderDate = response.data.earliest_order_date;
        if (earliestOrderDate) {
          const formattedEarliestDate = formatDate(new Date(earliestOrderDate));
          setEarliestOrderDate(formattedEarliestDate); // Save the earliest date
          setStartDate(formattedEarliestDate); // Set the start date to the earliest date
        } else {
          setErrorMessage("No earliest order date found");
        }
      })
      .catch(() => {
        setErrorMessage("Error fetching the earliest order date");
      });
  }, []);

  const fetchInitialData = useCallback(() => {
    axios
      .get(`/api/dashboard/stats?startDate=${startDate}&endDate=${endDate}`)
      .then((response) => {
        const {
          productData: apiProductData,
          maxQuantityProduct: apiMaxQuantityProduct,
          totalProductsSold: apiTotalProductsSold,
          totalRevenue: apiTotalRevenue,
          message,
        } = response.data;

        // If no product data was found
        if (apiProductData.length === 0) {
          setProductData([]); // Clear product data
          setMaxQuantityProduct(null);
          setTotalProductsSold(0);
          setTotalRevenue(0);
          setReceivedProductNames([]);
          setErrorMessage(
            message || "No orders found for the selected date range."
          ); // Display message
          return; // Exit the function early
        }

        const combinedProductData = apiProductData.reduce((acc, product) => {
          const existingProduct = acc.find(
            (p) => p.product_name === product.product_name
          );

          if (existingProduct) {
            existingProduct.quantity_sold += product.quantity_sold;
            existingProduct.totalRevenue +=
              product.price * product.quantity_sold;
          } else {
            acc.push({
              ...product,
              totalRevenue: product.price * product.quantity_sold,
            });
          }

          return acc;
        }, []);

        const receivedNames = combinedProductData
          .filter((product) => product.status === "received")
          .map((product) => product.product_name);

        setProductData(combinedProductData);
        setMaxQuantityProduct(apiMaxQuantityProduct);
        setTotalProductsSold(apiTotalProductsSold);
        setTotalRevenue(apiTotalRevenue);
        setReceivedProductNames(receivedNames);
        setErrorMessage(""); // Clear any previous error message
      })
      .catch((error) => {
        setErrorMessage("Error fetching product data.");
      });
  }, [startDate, endDate]);

  const fetchLowStockProducts = useCallback(() => {
    axios
      .get("/api/dashboard/low-stock-products")
      .then((response) => {
        const lowStockNames = response.data.map(
          (product) => product.product_name
        );
        setLowStockProductNames(lowStockNames);
      })
      .catch(() => {
        setErrorMessage("Error fetching low stock products");
      });
  }, []);

  useEffect(() => {
    // Fetch the earliest date when the component mounts
    fetchEarliestOrderDate();
    fetchLowStockProducts();
  }, [fetchEarliestOrderDate, fetchLowStockProducts]);

  useEffect(() => {
    if (startDate) {
      fetchInitialData(); // Fetch data only when the startDate is set
    }
  }, [startDate, fetchInitialData]);

  // Handle changing the start date
  const handleStartDateChange = (event) => {
    const selectedStartDate = event.target.value;

    if (new Date(selectedStartDate) < new Date(earliestOrderDate)) {
      setErrorMessage(
        `Start date cannot be earlier than ${earliestOrderDate}.`
      );
    } else if (new Date(selectedStartDate) >= new Date(endDate)) {
      setErrorMessage(
        "Start date must be earlier than the end date by at least one day."
      );
    } else {
      setStartDate(selectedStartDate);
      setErrorMessage(""); // Clear the error if valid
    }
  };

  // Ensure that the end date is always greater than the start date by one day
  const handleEndDateChange = (event) => {
    const selectedEndDate = event.target.value;
    const startDateObj = new Date(startDate);
    const todayFormatted = formatDate(today);

    // Calculate the minimum end date (startDate + 1 day)
    const minEndDate = new Date(startDateObj);
    minEndDate.setDate(startDateObj.getDate() + 1);

    if (new Date(selectedEndDate) <= startDateObj) {
      setErrorMessage(
        "End date must be at least one day greater than the start date."
      );
    } else if (new Date(selectedEndDate) > new Date(todayFormatted)) {
      setErrorMessage("End date cannot be in the future.");
    } else {
      setEndDate(selectedEndDate);
      setErrorMessage(""); // Clear error if date is valid
    }
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const handleProductLimitChange = (event) => {
    setProductLimit(event.target.value);
  };

  const handleLowStockClick = () => {
    navigate("/products/OutOfStock");
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const colors = productData.map(() => getRandomColor());

  const chartData = () => {
    if (chartType === "revenue") {
      return {
        labels: productData.map((product) => product.product_name),
        datasets: [
          {
            label: "Revenue",
            data: productData.map((product) => product.totalRevenue),
            backgroundColor: colors,
          },
        ],
      };
    }

    if (chartType === "showProductsAndQuantity") {
      let displayData = productData;

      if (productLimit !== "all") {
        const limit = parseInt(productLimit);
        displayData = [...productData]
          .sort((a, b) => b.quantity_sold - a.quantity_sold)
          .slice(0, limit);
      }

      return {
        labels: displayData.map((product) => product.product_name),
        datasets: [
          {
            label: "Quantity",
            data: displayData.map((product) => product.quantity_sold),
            backgroundColor: colors,
          },
        ],
      };
    }
  };

  const pieChartData = () => {
    const categoryData = productData.reduce((acc, product) => {
      const category = product.category_name || "Uncategorized";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += product.totalRevenue;
      return acc;
    }, {});

    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);

    return {
      labels: labels,
      datasets: [
        {
          label: "Revenue by Category",
          data: values,
          backgroundColor: labels.map(() => getRandomColor()),
        },
      ],
    };
  };

  const chartTitle = () => {
    switch (chartType) {
      case "revenue":
        return "Money Distribution";
      case "pie":
        return "Pie Chart (Revenue by Category)";
      case "showProductsAndQuantity":
        return "Products and Quantity";
      default:
        return "Product Sales";
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Customer Analytics Dashboard</h1>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
          <h3>Max Quantity Product</h3>
          <p>{maxQuantityProduct}</p>
        </div>
        <div className={styles.statBox}>
          <h3>Total Products Sold</h3>
          <p>{totalProductsSold}</p>
        </div>
        <div className={styles.statBox}>
          <h3>Total Revenue (with Tax)</h3>
          <p>${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
          <h3>Received Products</h3>
          <p>{receivedProductNames.join(", ")}</p>
        </div>
        <button
          className={`${styles.statBox} ${styles.clickableBox}`}
          onClick={handleLowStockClick}
        >
          <h3>Low Stock Products</h3>
          <p>{lowStockProductNames.join(", ")}</p>
        </button>
      </div>

      <div className={styles.dateSelector}>
        <label htmlFor="startDate">Start Date: </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={handleStartDateChange}
          min={earliestOrderDate} // Set the min attribute to the earliest order date
        />

        <label htmlFor="endDate">End Date: </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={handleEndDateChange}
          min={formatDate(new Date(new Date(startDate).getTime() + 86400000))} // Ensures end date is at least 1 day after start date
          max={formatDate(today)} // Prevents selecting a future date
        />
      </div>

      <div className={styles.chartTypeSelector}>
        <label htmlFor="chartType">Select Chart Type: </label>
        <select
          id="chartType"
          value={chartType}
          onChange={handleChartTypeChange}
        >
          <option value="revenue">Money Distribution</option>
          <option value="pie">Pie Chart (Revenue by Category)</option>
          <option value="showProductsAndQuantity">
            Show Products and Quantity
          </option>
        </select>
      </div>

      {chartType === "showProductsAndQuantity" && (
        <div className={styles.productLimitSelector}>
          <label htmlFor="productLimit">Number of Products to Show: </label>
          <select
            id="productLimit"
            value={productLimit}
            onChange={handleProductLimitChange}
          >
            {productData.map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
            <option value="all">Show All Products</option>
          </select>
        </div>
      )}

      <div className={styles.chartContainer}>
        <h2>{chartTitle()}</h2>
        <div className={styles.chartWrapper}>
          {chartType === "pie" ? (
            <Pie data={pieChartData()} />
          ) : (
            <Bar data={chartData()} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
