import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { stockData, stockInfo, generateChartOptions, getStockOverview } from "../utils/helpers";
import StockDetails from "../components/StockDetails";
import StockFinancials from "../components/StockFinancials";
import ReminderPopup from "../components/ReminderPopup";
import StockStatisticsCard from "../components/StockStatisticsCard"; // Ensure the component is imported correctly
import Nav from "react-bootstrap/Nav";
import Loading from "../components/Loading";
import Navbar from "react-bootstrap/Navbar";
import Button from 'react-bootstrap/Button';
import StickyCard from "../components/StickyCard"; // Import StickyCard
import CanvasJSReact from "@canvasjs/react-stockcharts"; // Import CanvasJSReact
import StockChart from "../components/StockChart";

import '../styles/stock-info-page.css';

const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const StockInfo = () => {
  const { symbol } = useParams();
  const [dataPoints, setDataPoints] = useState([]);
  const [options, setOptions] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [stockDetails, setStockDetails] = useState({});
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [infoType, setInfoType] = useState("Financials");
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [stockOverview, setStockOverview] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getStockInfo = async () => {
      try {
        const stockInf = await stockInfo(symbol);

        setStockDetails(stockInf[symbol] || {});
        setLoaded(true);
      } catch (err) {
        setLoaded(true);
        console.log(err);
      }
    };
    getStockInfo();
  }, [symbol, startDate, endDate]);

  useEffect(() => {
    const fetchStockOverview = async () => {
      const overview = await getStockOverview([symbol], {
        ratios: {},
        financials: {},
        stockPerformance:{}
      } );
      if (overview) {
        setStockOverview(overview[0]);
      }
    };
    fetchStockOverview();
  }, [symbol]);

  useEffect(() => {
    setInfoType("Summary");
  }, [location]);

  const handleLinearRegressionClick = () => {
    navigate(`/linear-regression/${symbol}-SP500`);
  };

  return !loaded ? (
    <Loading/>
  ) : (
    <div className="stock-info-page">
      <Navbar
        expand="xxl"
        bg="light"
        data-bs-theme="light"
        className="col-12 d-flex justify-content-between container"
      >
        <Nav className="d-flex w-100 stock-info">
          <div
            className={`${infoType === "Summary" ? "active-nav" : ""} stock-category`}>
            <li
              // variant="primary"
              onClick={() => setInfoType("Summary")}
            >
            Summary
          </li>
          </div>
          <div
            className={`${infoType === "Profile" ? "active-nav" : ""} stock-category`}>
            <li
              // variant="primary"
              onClick={() => setInfoType("Profile")}
            >
            Profile
          </li>
          </div>
          <div
            className={`${infoType === "Financials" ? "active-nav" : ""} stock-category`}>
            <li
              // variant="primary"
              onClick={() => setInfoType("Financials")}
            >
            Financials
          </li>
          </div>
          <div
            className={`${infoType === "Linear" ? "active-nav" : ""} stock-category`}>
            <li
              // variant="primary"
              onClick={handleLinearRegressionClick}
            >
            Linear Regression
          </li>
          </div>
        </Nav>
      </Navbar> 

      {loaded && infoType === "Summary" && (
        <div className="summary-section">
          <div className="graph-card container d-flex flex-column">
          <div className="row">
            <div className=" d-flex">
            <h1 className="fs-4"
            >{stockDetails?.open}
            <span className="fs-6"> {stockDetails?.currency}
            </span> 
            <span className={`fs-6 ${stockDetails?.priceChange > 0 ? "text-success" : "text-danger"}`}> {stockDetails?.priceChange?.toFixed(2)} ({stockDetails?.priceChangePercent?.toFixed(2)}%)</span>
            </h1>
            </div>
          <div className="col-8">
              <StockChart symbol={symbol} /> 
          </div>
            <div className=" col-4">
            <div class="row quick-info">
          <div class="col-6">
            <div className="quick-info-card p-3">
              
              <div className="quick-info-title text-secondary">
                <h3>Current Price</h3>
              </div>
              <div className="quick-info-value">
                <p>{stockOverview?.price}</p>
              </div>
            </div>
            <div className="quick-info-card p-3 "
            >
              <div className="quick-info-title text-secondary">
                <h3>After Hours Price</h3>
              </div>
              <div className="quick-info-value">
                <p>{stockOverview?.afterHoursPrice}</p>
              </div>
            </div>
            <div className="quick-info-card p-3">
              <div className="quick-info-title text-secondary">
                <h3>At Close</h3>
              </div>
              <div className="quick-info-value">
                <p>{stockOverview?.lastCloseTime}</p>
              </div>
            </div>
          </div>
            <div className="col-6">
              <div className="quick-info-card p-3">
                
                <div className="quick-info-title text-secondary">
                  <h3>Change</h3>
                </div>
                <div className="quick-info-value">
                  <p>{stockOverview?.priceChange}</p>
                </div>
              </div>
              <div className="quick-info-card p-3">
                
                <div className="quick-info-title text-secondary">
                  <h3>After Hours Change</h3>
                </div>
                <div className="quick-info-value">
                  <p>{stockOverview?.afterHoursChange}</p>
                </div>
              </div>
              <div className="quick-info-card p-3">
                
                <div className="quick-info-title text-secondary">
                  <h3>After Hours</h3>
                </div>
                <div className="quick-info-value">
                  <p>{stockOverview?.afterHoursTime}</p>
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>
          </div>
          <div className="overview-section container mb-2">
          <StockDetails
              stockStats={stockDetails}
              stockInfo={true}
              longName={stockDetails.longName}
            />
          </div>
        </div>
      )}

      {loaded && infoType === "Profile" && (
                <div className="container p-0">
                  <StockStatisticsCard symbol={symbol} />
                </div>
          )}

      {loaded && infoType === "Financials" && (
        <div className="financials-section d-flex">
          <div className="financials-content">
            <StockFinancials symbol={symbol} />
          </div>
        </div>
      )}

      {showReminderPopup && (
        <ReminderPopup open={showReminderPopup} handleClose={() => setShowReminderPopup(false)} />
      )}
    </div>
  );
};

export default StockInfo;
