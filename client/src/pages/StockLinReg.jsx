import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

const CanvasJS = CanvasJSReact.CanvasJS;

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const StockLinReg = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState([]);
  const [stockSymbol, setStockSymbol] = useState();
  const [formulaB, setFormulaB] = useState();
  const [formulaY, setFormulaY] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)
  );
  const [searchSymbol, setSearchSymbol] = useState();
  const [searchIndex, setSearchIndex] = useState();
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  

  const indexoptions = {
    "SP500": "^GSPC",
    "Dow Jones": "^DJI",
    "Nasdaq": "^IXIC",
    "Russell 2000": "^RUT",
    "S&P 400 Mid Cap": "^MID",
    "S&P 600 Small Cap": "^SML",
    "S&P 100": "^OEX",
    "S&P 500 Growth": "^SGX",
    "S&P 500 Value": "^SVX",
    "S&P 500 High Beta": "^SPHB",
    "S&P 500 Low Volatility": "^SPLV",
    "S&P 500 High Quality": "^SPHQ",
    "Wilshire 5000": "^W5000",
    "NYSE Composite": "^NYA",
    "NYSE American Composite": "^XAX",
    "Unemployment Rate": "UNRATE",
    "Consumer Price Index": "CPIAUCSL",
    "Producer Price Index": "PPIACO",
    "Federal Funds Rate": "FEDFUNDS",
    "Volatile Index": "^VIX",
    "Economic Policy Uncertainty Index": "USEPUINDXD",
  };


  useEffect(() => {
    var symbol = location.pathname.split("/")[2];

    setStockSymbol(symbol);
  }, [stockSymbol]);

  const [searchParams, setSearchParams] = useState({
    symbol: "",
    index: "",
  });




  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(searchSymbol);
    const { symbol } = searchParams;
    searchParams.index = searchIndex
    fetch(
      `http://127.0.0.1:8000/${searchParams.symbol}/${searchIndex}/${startDate}/${endDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        var dataArray = JSON.parse(data[0]);
     
        // console.log(dataArray);
        var dps = [];
        for (var i = 0; i < dataArray.length; i++) {
          dps.push({
            x: Number(dataArray[i][1]),
            y: Number(dataArray[i][0]),
          });
        }

        setFormulaB(data[1]['coef']);
        setFormulaY(data[1]['intercept']);
        setIndex(dps);
      });
    event.preventDefault();
    setStockSymbol(symbol);
    if (symbol) {
      navigate(`/stocklinreg/${symbol}`);
    }
  };

  useEffect(() => {
    if (stockSymbol) {
      fetch(
        `http://127.0.0.1:8000/${stockSymbol}/${searchIndex}/${startDate}/${endDate}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          console.log(data[1]['coef'])
          var dataArray = JSON.parse(data[0]);
          // console.log(dataArray);
          var dps = [];
          for (var i = 0; i < dataArray.length; i++) {
            dps.push({
              x: Number(dataArray[i][1]),
              y: Number(dataArray[i][0]),
            });
          }

          setFormulaB(data[1]['coef']);
          setFormulaY(data[1]['intercept']);
          setIndex(dps);
        });
      setIsLoaded(true);
    }
  }, [index, formulaB, formulaY]);

  const regressionLine = index.map((point) => {
    return {
      x: point.x,
      y: formulaY + formulaB * point.x,
    };
  });
  
  const findIndexName = (index) => {
    for (const [key, value] of Object.entries(indexoptions)) {
      if (value === index) {
        return key;
      }
    }
  };

  const options = {
    theme: "dark2",
    title: {
      text: `${stockSymbol} vs ${findIndexName(searchParams.index)} Linear Regression`,
    },
    axisX: {
      title: `${stockSymbol}`,
    },
    axisY: {
      title: `${searchParams.index}`,
    },

    data: [
      {
        type: "scatter",
        showInLegend: true,
        legendText: `${stockSymbol}`,
        dataPoints: index.map((point) => ({
          x: point.x,
          y: point.y,
          toolTipContent: `${searchIndex}: ${point.x}, ${stockSymbol}: ${point.y}`,
        })),
        label: "Data Points",
      },
      {
        type: "line",
        showInLegend: true,
        legendText: "Linear Regression Line",
        dataPoints: regressionLine.map((point) => ({
          x: point.x,
          y: point.y,
          toolTipContent: `${searchIndex}: ${point.x}, ${stockSymbol}: ${point.y}`,
        })),
      },
    ],
  };



  return (
    <div className="linear-reg mt-3 ">
      <div className="container">
        <div className="row w-100">
          <div className="row text-center">
            <form
              onSubmit={handleSubmit}
              useref={searchParams}
              className="row justify-content-center"
            >
              <label htmlFor="symbol">Symbol</label>
              <input
                type="search-bar"
                name="symbol"
                className="text-center w-50"
                onChange={handleInputChange}
              />
              <label htmlFor="symbol">Index</label>
              {/* <input type="search-bar" name="index"  className="text-center w-50" onChange={handleInputChange}/> */}
              <Dropdown>
              <Dropdown.Toggle className="w-50" id="dropdown-index">
                Select Index
              </Dropdown.Toggle>

              <Dropdown.Menu className="w-50 text-center dropdown-menu">
                {Object.keys(indexoptions).map((option) => (
                  <Dropdown.Item
                    key={option}
                    name="index"
                    onClick={() => setSearchIndex(indexoptions[option])}
                  >
                    {option}
                  </Dropdown.Item>

                ))}
              </Dropdown.Menu>
             
              </Dropdown>
              <div>
                <button type="submit" className="btn w-50 mt-5 btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
          <div className="row text-center mt-5">
            <div className="col-lg d-flex justify-content-center">
              <div className="form-group text-center w-50">
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-control text-center"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="col-lg d-flex justify-content-center">
              <div className="form-group text-center w-50">
                <label>End Date</label>
                <input
                  type="date"
                  className="form-control text-center"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart mt-2">
        {isLoaded && index.length === 0 ? (
          <div className="text-center">
            <h1 className="text-center">No Data Found</h1>
          </div>
        ) : (
          <div></div>
        )}
        {isLoaded && index.length !== 0 ? (
          <CanvasJSChart options={options} className="mt-10" />
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default StockLinReg;
