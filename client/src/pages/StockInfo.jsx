import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { setGraphOptions, stockData, stockInfo } from "../utils/helpers";
import { QUERY_ME } from "../utils/queries";
import StockDetails from "../components/StockDetails";
import StockFinancials from "../components/StockFinancials";
import SideBar from "../components/SideBar";
import ReminderPopup from "../components/ReminderPopup";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import CanvasJSReact from "@canvasjs/react-stockcharts";

const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const StockInfo = () => {
  const { data } = useQuery(QUERY_ME); 
  const { symbol } = useParams();
  const [dataPoints, setDataPoints] =  useState([]);
  const [options, setOptions] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [stockDetails, setStockDetails] = useState({});
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [infoType, setInfoType] = useState("Summary");
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const categories = ["Summary", "Financials", "Linear Regression", "Analysis"];
  const location = useLocation();
  const stockSymbol = symbol;


  useEffect(() => {
    const getStockInfo = async () => {
      try {
        const data = await stockData(stockSymbol, startDate, endDate);
        const stockInf = await stockInfo(stockSymbol);
        const dataArr = JSON.parse(data);
        const options = await setGraphOptions("dark1", stockInf[stockSymbol].longName, dataArr, stockSymbol);
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
    setInfoType("Summary");
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
          {categories.map((type) => (
            <h3
              key={type}
              onClick={() => setInfoType(type)}
              className={infoType === type ? "active-stat info" : "info"}
            >
              {type}
            </h3>
          ))}
        </Nav>
      </Navbar>

      {isLoaded && infoType === "Summary" && (
        <div className="col-10 m-auto justify-center stock-volume mt-5">
          <CanvasJSStockChart
            containerProps={containerProps}
            options={options}
          />
          <StockDetails
            stockStats={stockDetails}
            stockInfo={true}
            name={stockDetails.longName}
          />
        </div>
      )}

      {infoType === "Financials" && (
        <StockFinancials symbol={stockSymbol} />
      )}
      

      {showReminderPopup && (
        <ReminderPopup open={showReminderPopup} handleClose={() => setShowReminderPopup(false)} />
      )}

      {infoType === "Linear Regression" && (
        <div className="container">
          <h2>Linear Regression</h2>
          <SideBar />
        </div>
      )}
    </div>
  );
};


export default StockInfo;
