import React, { useState, useEffect } from "react";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import "../styles/StickyCard.css"; // Import the CSS file
import { generateFinancialsChartOptions } from "../utils/helpers";

const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const StickyCard = ({ data, stockOverview }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [options, setOptions] = useState({});

  useEffect(() => {
    if (data && data.length > 0) {
      const chartOptions = generateFinancialsChartOptions(data);
      setOptions(chartOptions);
    }
  }, [data]);

  const handleToggle = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`sticky-card ${isMinimized ? "minimized" : ""}`}>
      <div className="card-header" onClick={handleToggle}>
        <h3>{stockOverview.symbol} Overview</h3>
        <button className="toggle-btn">{isMinimized ? "+" : "-"}</button>
      </div>
      {!isMinimized && (
        <div className="card-content">
          <div className="chart-section">
            <CanvasJSStockChart
              containerProps={{ width: "100%", height: "200px", margin: "auto" }}
              options={options}
            />
          </div>
          <div className="overview-section">
            {stockOverview ? (
              <>
                <p>Current Price: ${stockOverview.price}</p>
                <p>Change: {stockOverview.priceChange} ({stockOverview.priceChangePercent}%)</p>
                <p>After Hours Price: ${stockOverview.afterHoursPrice}</p>
                <p>After Hours Change: {stockOverview.afterHoursChange} ({stockOverview.afterHoursChangePercent}%)</p>
                <p>At Close: {stockOverview.lastCloseTime}</p>
                <p>After Hours: {stockOverview.afterHoursTime}</p>
              </>
            ) : (
              <p>Stock overview data is not available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StickyCard;
