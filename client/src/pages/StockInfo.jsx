import { useEffect, useState } from "react";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const StockInfo = () => {
  const { symbol } = useParams();

  const location = useLocation();
  const stockSymbol = location.pathname.split(("/"))[2];
  console.log("stockSymbol", stockSymbol);
  const [dataPoints1, setDataPoints1] = useState([]);
  const [dataPoints2, setDataPoints2] = useState([]);
  const [dataPoints3, setDataPoints3] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  console.log("startDate", startDate);  
  console.log("endDate", endDate);
  console.log("stockSymbol", stockSymbol);
 

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/${stockSymbol}/${startDate}/${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        const dataArray = JSON.parse(data);
        var dps1 = [],
          dps2 = [],
          dps3 = [];
        for (var i = 0; i < dataArray.length; i++) {
          dps1.push({
            x: new Date(dataArray[i].Date),
            y: [
              Number(dataArray[i].Open),
              Number(dataArray[i].High),
              Number(dataArray[i].Low),
              Number(dataArray[i].Close),
            ],
          });
          dps2.push({
            x: new Date(dataArray[i].Date),
            y: Number(dataArray[i].Volume),
          });
          dps3.push({
            x: new Date(dataArray[i].Date),
            y: Number(dataArray[i].Close),
          });
        }
        setDataPoints1(dps1);
        setDataPoints2(dps2);
        setDataPoints3(dps3);
        setIsLoaded(true);
      });
  }, [symbol, startDate, endDate]);

  const options = {
    theme: "dark2",
    title: {
      text: `${symbol} StockChart with Date-Time Axis`,
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
          dataPoints: dataPoints3,
        },
      ],
      slider: {
        minimum: new Date("2022-05-01"),
        maximum: new Date("2022-07-01"),
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
      <div>
        {isLoaded && (
          <CanvasJSStockChart
            containerProps={containerProps}
            options={options}
            /* onRef = {ref => this.chart = ref} */
          />
        )}
      </div>
    </div>
  );
};





//   componentDidMount() {


//     // useEffect(() => {
//     //   const searchParams = new URLSearchParams(location.search);
//     //   const symbol = searchParams.get("symbol");
//     //   if (symbol) {
//     //     setStockSymbol(symbol);
//     //     // Fetch stock information based on the symbol here
//     //   }
//     // }, [location.search]);


//     //Reference: https://reactjs.org/docs/faq-ajax.html#example-using-ajax-results-to-set-local-state
//     // fetch("https://canvasjs.com/data/docs/ltcusd2018.json")
//     fetch(`http://127.0.0.1:8000/TSLA/${this.state.startDate}/${this.state.endDate}`)
//       .then(res => res.json())
//       .then(
//         (data) => {
//           const dataArray = JSON.parse(data);
//           var dps1 = [], dps2 = [], dps3 = [];
//           for (var i = 0; i < dataArray.length; i++) {
//             dps1.push({
//               x: new Date(dataArray[i].Date),
//               y: [
//                 Number(dataArray[i].Open),
//                 Number(dataArray[i].High),
//                 Number(dataArray[i].Low),
//                 Number(dataArray[i].Close)
//               ]
//             });
//             dps2.push({x: new Date(dataArray[i].Date), y: Number(dataArray[i].Volume)});
//             dps3.push({x: new Date(dataArray[i].Date), y: Number(dataArray[i].Close)});
//           }
//           this.setState({
//             isLoaded: true,
//             dataPoints1: dps1,
//             dataPoints2: dps2,
//             dataPoints3: dps3
//           });
//         }
//       )
//   }

//   render() {
    
//     const options = {
//       theme: "light2",
//       title:{
//         text:"Test StockChart with Date-Time Axis"
//       },
//       subtitles: [{
//         text: "Price-Volume Trend"
//       }],
//       charts: [{
//         axisX: {
//           lineThickness: 5,
//           tickLength: 0,
//           labelFormatter: function(e) {
//             return "";
//           },
//           crosshair: {
//             enabled: true,
//             snapToDataPoint: true,
//             labelFormatter: function(e) {
//               return "";
//             }
//           }
//         },
//         axisY: {
//           title: "Stock Price",
//           prefix: "$",
//           tickLength: 0
//         },
//         toolTip: {
//           shared: true
//         },
//         data: [{
//           name: "Price (in USD)",
//           yValueFormatString: "$#,###.##",
//           type: "candlestick",
//           dataPoints : this.state.dataPoints1
//         }]
//       },{
//         height: 100,
//         axisX: {
//           crosshair: {
//             enabled: true,
//             snapToDataPoint: true
//           }
//         },
//         axisY: {
//           title: "Volume",
//           prefix: "$",
//           tickLength: 0
//         },
//         toolTip: {
//           shared: true
//         },
//         data: [{
//           name: "Volume",
//           yValueFormatString: "$#,###.##",
//           type: "column",
//           dataPoints : this.state.dataPoints2
//         }]
//       }],
//       navigator: {
//         data: [{
//           dataPoints: this.state.dataPoints3
//         }],
//         slider: {
//           minimum: new Date("2022-05-01"),
//           maximum: new Date("2022-07-01")
//         }
//       }
//     };
//     const containerProps = {
//       width: "%",
//       height: "450px",
//       margin: "auto"
//     };
//     return (
//       <div> 
//         <div>
//           {
//             // Reference: https://reactjs.org/docs/conditional-rendering.html#inline-if-with-logical--operator
//             this.state.isLoaded && 
//             <CanvasJSStockChart containerProps={containerProps} options = {options}
//               /* onRef = {ref => this.chart = ref} */
//             />
//           }
//         </div>
//       </div>
//     );
//   }
// }


export default StockInfo; 