// src/components/StockInfo.jsx
import { useEffect, useState } from "react";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useSelector } from "react-redux";
import { setGraphOptions, stockData, stockInfo } from "../utils/helpers";
import StockDetails from "../components/StockDetails";
import StockFinancials from "../components/StockFinancials";
import SideBar from "../components/SideBar";
import ReminderPopup from "../components/ReminderPopup";
import { QUERY_ME } from "../utils/queries";

const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const StockInfo = () => {
  const { data } = useQuery(QUERY_ME); 
  const { symbol } = useParams();
  const location = useLocation();
  const stockSymbol = symbol;
  const [dataPoints, setDataPoints] =  useState([]);
  const [options, setOptions] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [stockDetails, setStockDetails] = useState({});
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [infoType, setInfoType] = useState("summary");
  const [showReminderPopup, setShowReminderPopup] = useState(false);

  useEffect(() => {
    const getStockInfo = async () => {
      try {
        const data = await stockData(stockSymbol, startDate, endDate);
        const stockDeets = await stockInfo(stockSymbol);
        const dataArr = JSON.parse(data);

        setStockDetails(stockDeets[stockSymbol] || {});
        console.log(stockDetails);
        // stockDetails['stockSymbol'] = stockSymbol;
        setDataPoints(dataArr);
        const options = await setGraphOptions("dark1", stockDeets[stockSymbol].longName, dataArr, stockSymbol);
        setOptions(options);
        setIsLoaded(true);
      } catch (err) {
        console.log(err);
      }
    };

    getStockInfo();
  }, [stockSymbol, startDate, endDate]);

  useEffect(() => {
    setInfoType("summary");
  }, [location]);

  const containerProps = {
    width: "100%",
    height: "450px",
    margin: "auto",
  };

  return (
    <div>
      <Navbar
        expand="xxl"
        bg="light"
        data-bs-theme="light"
        className="nav-bar nav-bar-custom justify-content-center"
      >
        <Nav className="d-flex justify-content-around w-100 stock-info">
          {["summary", "financials", "linreg", "analytics"].map((type) => (
            <h3
              key={type}
              onClick={() => setInfoType(type)}
              className={infoType === type ? "active-stat info" : "info"}
            >
              {`${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </h3>
          ))}
        </Nav>
      </Navbar>

      {isLoaded && infoType === "summary" && (
        <div className="col-10 m-auto justify-center stock-volume mt-5">
          <CanvasJSStockChart
            containerProps={containerProps}
            options={options}
          />
          <StockDetails
            {...stockDetails}
            date={new Date().toISOString().slice(0, 10)}
            stockInfo={true}
          />
        </div>
      )}

      {infoType === "financials" && (
        <StockFinancials symbol={stockSymbol} />
      )}

      {showReminderPopup && (
        <ReminderPopup open={showReminderPopup} handleClose={() => setShowReminderPopup(false)} />
      )}

      {infoType === "linear regression" && (
        <div className="container">
          <SideBar />
        </div>
      )}
    </div>
  );
};

export default StockInfo;
