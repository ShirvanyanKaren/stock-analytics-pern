import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import { stockData, stockInfo, generateChartOptions, getStockOverview } from "../utils/helpers";
import StockDetails from "../components/StockDetails";
import StockFinancials from "../components/StockFinancials";
import ReminderPopup from "../components/ReminderPopup";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import Button from 'react-bootstrap/Button'; // Import Button

import '../styles/stock-info-page.css';  // Ensure the CSS is imported

const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const StockInfo = () => {
  const { symbol } = useParams();
  const [dataPoints, setDataPoints] = useState([]);
  const [options, setOptions] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [stockDetails, setStockDetails] = useState({});
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [infoType, setInfoType] = useState("Summary");
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [stockOverview, setStockOverview] = useState({});
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate
  const stockSymbol = symbol;

  useEffect(() => {
    const getStockInfo = async () => {
      try {
        const data = await stockData(stockSymbol, startDate, endDate);
        const stockInf = await stockInfo(stockSymbol);
        const dataArr = JSON.parse(data);
        const options = generateChartOptions("stock", {
          theme: "dark1",
          stockName: stockInf[stockSymbol].longName,
          data: dataArr,
          stockSymbol: stockSymbol,
        });
        setOptions(options);
        setStockDetails(stockInf[stockSymbol] || {});
        setDataPoints(dataArr);
        setIsLoaded(true);
      } catch (err) {
        console.log(err);
      }
    };

    getStockInfo();
  }, [stockSymbol, startDate, endDate]);

  useEffect(() => {
    const fetchStockOverview = async () => {
      const overview = await getStockOverview(stockSymbol);
      setStockOverview(overview);
    };

    fetchStockOverview();
  }, [stockSymbol]);

  useEffect(() => {
    setInfoType("Summary");
  }, [location]);

  const containerProps = {
    width: "100%",
    height: "100%",
    margin: "auto",
  };

  const handleLinearRegressionClick = () => {
    navigate(`/linear-regression/${symbol}-SP500`);
  };

  return (
    <div className="stock-info-page">
      <Navbar
        expand="xxl"
        bg="light"
        data-bs-theme="light"
        className="nav-bar nav-bar-custom justify-content-center"
      >
        <Nav className="d-flex justify-content-around w-100 stock-info">
          <Button
            variant="primary"
            className={infoType === "Summary" ? "active" : ""}
            onClick={() => setInfoType("Summary")}
          >
            Summary
          </Button>
          <Button
            variant="primary"
            className={infoType === "Financials" ? "active" : ""}
            onClick={() => setInfoType("Financials")}
          >
            Financials
          </Button>
          <Button
            variant="primary"
            onClick={handleLinearRegressionClick}
          >
            Linear Regression
          </Button>
        </Nav>
      </Navbar>

      {isLoaded && infoType === "Summary" && (
        <div className="summary-section">
          <div className="chart-section">
            <CanvasJSStockChart
              containerProps={containerProps}
              options={options}
            />
          </div>
          <div className="details-section">
            <StockDetails
              stockStats={stockDetails}
              stockInfo={true}
              name={stockDetails.longName}
            />
          </div>
        </div>
      )}

      {isLoaded && infoType === "Financials" && (
        <div className="financials-section">
          <div className="chart-section">
            <CanvasJSStockChart
              containerProps={containerProps}
              options={options}
            />
          </div>
          <div className="overview-section">
            <h2>{stockSymbol} Overview</h2>
            {stockOverview ? (
              <>
                <p>Current Price: ${stockOverview.currentPrice}</p>
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
          <StockFinancials symbol={stockSymbol} />
        </div>
      )}

      {showReminderPopup && (
        <ReminderPopup open={showReminderPopup} handleClose={() => setShowReminderPopup(false)} />
      )}
    </div>
  );
};

export default StockInfo;
