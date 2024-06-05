// src/components/StockInfo.jsx
import { useEffect, useState } from "react";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { stockData, stockInfo } from "../utils/helpers";
import StockDetails from "../components/StockDetails";
import { QUERY_ME } from "../utils/queries";
import { useQuery } from "@apollo/client";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useSelector } from "react-redux";
import StockFinancials from "../components/StockFinancials";
import SideBar from "../components/SideBar";
import ReminderPopup from "../components/ReminderPopup"; // Import ReminderPopup

const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const StockInfo = () => {
  const { data } = useQuery(QUERY_ME);
  const { symbol } = useParams();
  const location = useLocation();
  const stockSymbol = location.pathname.split("/")[2];
  const [dataPoints1, setDataPoints1] = useState([]);
  const [dataPoints2, setDataPoints2] = useState([]);
  const [dataPoints3, setDataPoints3] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [stockDetails, setStockDetails] = useState([]);
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [infoType, setInfoType] = useState("summary");
  const [showReminderPopup, setShowReminderPopup] = useState(false); // Add state for ReminderPopup

  useEffect(() => {
    const getStockInfo = async () => {
      var startTime = performance.now();
      console.log("functionTime", startTime);
      try {
        console.log(startDate, endDate);
        const data = await stockData(stockSymbol, startDate, endDate);
        const stockDeets = await stockInfo(stockSymbol);
        const dataArr = JSON.parse(data);

        setStockDetails(stockDeets[stockSymbol] || {});
        const dps1 = [];
        const dps2 = [];
        const dps3 = [];
        for (var i = 0; i < dataArr.length; i++) {
          dps1.push({
            x: new Date(dataArr[i].Date),
            y: [Number(dataArr[i].Open), Number(dataArr[i].High), Number(dataArr[i].Low), Number(dataArr[i].Close)],
          });
          dps2.push({
            x: new Date(dataArr[i].Date),
            y: Number(dataArr[i].Volume),
          });
          dps3.push({
            x: new Date(dataArr[i].Date),
            y: Number(dataArr[i].Close),
          });
        }
        setDataPoints1(dps1);
        setDataPoints2(dps2);
        setDataPoints3(dps3);
        var endTime = performance.now();
        var functionTimeStart = endTime - startTime;
        console.log("functionTime", functionTimeStart);
        setIsLoaded(true);
        // Show the ReminderPopup after a delay
        setTimeout(() => {
          setShowReminderPopup(true);
        }, 3000); // 3000 milliseconds = 3 seconds delay
      } catch (err) {
        console.log(err);
      }
    };

    getStockInfo();
  }, [stockSymbol, startDate, endDate]);

  useEffect(() => {
    setInfoType("summary");
  }, [location]);

  const options = {
    theme: "dark1",
    title: { text: `${stockDetails.longName} Stock Price and Volume` },
    subtitles: [{ text: "Price-Volume Trend" }],
    charts: [
      {
        axisX: {
          lineThickness: 5,
          tickLength: 0,
          labelFormatter: function () {
            return "";
          },
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
            labelFormatter: function () {
              return "";
            },
          },
        },
        axisY: {
          title: "Stock Price",
          prefix: "$",
          tickLength: 0,
        },
        toolTip: {
          shared: true,
        },
        data: [
          {
            name: "Price (in USD)",
            yValueFormatString: "$#,###.##",
            type: "candlestick",
            color: "#049C",
            dataPoints: dataPoints1,
          },
        ],
      },
      {
        height: 100,
        axisX: {
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
          },
        },
        axisY: {
          title: "Volume",
          prefix: "$",
          tickLength: 0,
        },
        toolTip: {
          shared: true,
        },
        data: [
          {
            color: "#049C",
            name: "Volume",
            yValueFormatString: "$#,###.##",
            type: "column",
            dataPoints: dataPoints2,
          },
        ],
      },
    ],
    navigator: {
      data: [
        {
          color: "white",
          fillOpacity: 0.4,
          indexLabel: "",
          dataPoints: dataPoints3,
          type: "area",
        },
      ],
      slider: {
        minimum: new Date("2022-05-01"),
        maximum: new Date("2022-07-01"),
        fontColor: "white",
        indexLabelFontColor: "white",
      },
    },
  };
  const containerProps = {
    width: "100%",
    height: "450px",
    margin: "auto",
  };

  return (
    <div>
      <Navbar expand="xxl" bg="light" data-bs-theme="light" className="nav-bar nav-bar-custom justify-content-center">
        <Nav className="d-flex justify-content-around w-100 stock-info">
          <h3 onClick={() => setInfoType("summary")} className={infoType === "summary" ? "active-stat info" : "info"}>
            Stock Summary
          </h3>
          <h3 onClick={() => setInfoType("financials")} className={infoType === "financials" ? "active-stat info" : "info"}>
            Stock Financials
          </h3>
          <h3 onClick={() => setInfoType("linreg")} className={infoType === "linreg" ? "active-stat info" : "info"}>
            Stock Linear Regression
          </h3>
          <h3 onClick={() => setInfoType("analytics")} className={infoType === "analytics" ? "active-stat info" : "info"}>
            Stock Analytics
          </h3>
        </Nav>
      </Navbar>
      <div className={infoType === "linreg" ? "" : "inactive"}>
        <div className="container">
          <SideBar />
        </div>
      </div>
      {isLoaded && (
        <div className={infoType === "summary" ? "" : "inactive"}>
          <div className="col-10 m-auto justify-center stock-volume mt-5">
            <CanvasJSStockChart containerProps={containerProps} options={options} />
          </div>
          <div>
            <StockDetails
              stockSymbol={stockSymbol}
              previousClose={stockDetails.previousClose}
              open={stockDetails.open}
              high={stockDetails.dayHigh}
              low={stockDetails.dayLow}
              forwardPE={stockDetails.forwardPE}
              sharesOutstanding={stockDetails.sharesOutstanding}
              date={new Date().toISOString().slice(0, 10)}
              marketCap={stockDetails.marketCap}
              longName={stockDetails.longName}
              beta={stockDetails.beta}
              dividendYield={stockDetails.dividendYield}
              dividendRate={stockDetails.dividendRate}
              volume={stockDetails.volume}
              week52High={stockDetails.fiftyTwoWeekHigh}
              week52Low={stockDetails.fiftyTwoWeekLow}
              stockInfo={Boolean(true)}
            />
          </div>
        </div>
      )}
      <div className={infoType === "financials" ? "" : "d-none"}>
        <StockFinancials symbol={stockSymbol} />
      </div>
      {showReminderPopup && <ReminderPopup open={showReminderPopup} handleClose={() => setShowReminderPopup(false)} />}
    </div>
  );
};

export default StockInfo;
