import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import styles from "./PieChart.module.css"; // Import the CSS module

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const PieChart = () => {
  const [data, setData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetch("/api/revenue/revenue-by-category")
      .then((response) => response.json())
      .then((data) => {
        const labels = data.map((item) => item.Category);
        const values = data.map((item) => item.Total_Revenue);

        setData({
          labels: labels,
          datasets: [
            {
              label: "Revenue by Category",
              data: values,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const options = {
    maintainAspectRatio: false, // Prevent the chart from maintaining aspect ratio
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Revenue by Category",
      },
    },
  };

  return (
    <div className={styles.pieChartContainer}>
      <h2 className={styles.pieChartTitle}>Revenue Distribution by Category</h2>
      <div className={styles.chartWrapper}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default PieChart;
