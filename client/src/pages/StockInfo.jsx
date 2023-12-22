import { useEffect, useState } from "react";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { stockData } from "../utils/helpers";
import { stockInfo } from "../utils/helpers";
import StockDetails from "../components/StockDetails";
import { QUERY_ME } from "../utils/queries";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";



const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const StockInfo = () => {
  const { data } = useQuery(QUERY_ME);
  const { symbol } = useParams();
  const location = useLocation();
  const stockSymbol = location.pathname.split(("/"))[2];
  const [dataPoints1, setDataPoints1] = useState([]);
  const [dataPoints2, setDataPoints2] = useState([]);
  const [dataPoints3, setDataPoints3] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)
  );
  const [stockDetails, setStockDetails] = useState([]);
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));





 
  useEffect(() => {
    const getStockInfo = async () => {
      var startTime = performance.now();
      console.log("functionTime", startTime);
      try {
  
        console.log(startDate, endDate)
        const data = await stockData(stockSymbol, startDate, endDate);
        const stockDeets = await stockInfo(stockSymbol)
        const dataArr = JSON.parse(data);

        // setStockDetails(data[1][stockSymbol]);
        setStockDetails(stockDeets[stockSymbol] || {});
        // console.log("stockDeets", stockDeets);
            const dps1 = [];
            const dps2 = [];
            const dps3 = [];
            for (var i = 0; i < dataArr.length; i++) {
              dps1.push({
                x: new Date(dataArr[i].Date),
                y: [
                  Number(dataArr[i].Open),
                  Number(dataArr[i].High),
                  Number(dataArr[i].Low),
                  Number(dataArr[i].Close),
                ],
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
          } catch (err) {
            console.log(err);
          }
        };
        
        getStockInfo();

      }, [stockSymbol, startDate, endDate]);

  const options = {
    theme: "dark1",
    title: { text: `${stockDetails.longName} Stock Price and Volume`,
    },

    subtitles: [
      {
        text: "Price-Volume Trend",
      },
    ],
    charts: [
      {
        axisX: {
          lineThickness: 5,
          tickLength: 0,
          labelFormatter: function (e) {
            return "";
          },
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
            labelFormatter: function (e) {
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
        // 
      },
    },
  };
  const containerProps = {
    width: "%",
    height: "450px",
    margin: "auto",
  };

  return (
    <div>

        {isLoaded && (
          <div>
         <div className=" col-10 m-auto justify-center stock-volume mt-5">

          <CanvasJSStockChart
            containerProps={containerProps}
            options={options}
            /* onRef = {ref => this.chart = ref} */
          />
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


    </div>
  );
};




export default StockInfo; 