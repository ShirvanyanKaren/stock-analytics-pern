import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { linReg } from "../utils/helpers";
import { indexOptions } from "../utils/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLineChart, faRssSquare } from "@fortawesome/free-solid-svg-icons";
import { idbPromise } from "../utils/helpers";
import RegressionTool from "../components/RegressionTool";

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
  const [useWeights, setUseWeights] = useState(false);
  const [stockWeights, setStockWeights] = useState({});

  const [searchSymbol, setSearchSymbol] = useState();
  const [searchIndex, setSearchIndex] = useState("^GSPC");
 
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [searchParams, setSearchParams] = useState({
    symbol: "",
    index: "",
  });



  const getLinReg = async (stockSymbol) => {

    if (startDate > endDate) {
      alert("Start date must be before end date");
      return;
    } else if (startDate === endDate) {
      alert("Start date cannot be the same as end date");
      return;
    } 
    else {
    let weights = ""
    if (useWeights){
      weights = JSON.stringify(stockWeights);
      setStockSymbol("Portfolio");
    } 

    const data = await linReg(stockSymbol, searchIndex, startDate, endDate, weights);
    const dataArray = JSON.parse(data[0]);
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

    setIsLoaded(true);
    }

  }
  useEffect(() => {
    var symbol = location.pathname.split("/")[2];

    setStockSymbol(symbol);
  }, [stockSymbol]);




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
    try {
      let symbol
      if (!useWeights) {
       symbol  = searchParams.symbol;
      } else {
        symbol = "Portfolio";
        setSearchSymbol("Portfolio");
      }
    if (symbol === "" && !useWeights) {
      alert("Please enter a stock symbol");
      return;
    } else if (searchIndex === "") {
      alert("Please select an index");
      return;
    }
    searchParams.index = searchIndex
    setStockSymbol(symbol);

  getLinReg(searchParams.symbol);

    navigate(`/stocklinreg/${symbol}`);
  }
  catch (err) {
    console.log(err);
  }
  };



  const regressionLine = index.map((point) => {
    return {
      x: point.x,
      y: formulaY + formulaB * point.x,
    };
  });
  
  const findIndexName = (index) => {
    for (const [key, value] of Object.entries(indexOptions)) {
      if (value === index) {
        return key;
      }
    }
  };

  const options = {
    theme: "dark1",
    title: {
      text: `${stockSymbol} vs ${findIndexName(searchParams.index)} Linear Regression`,
    },
    axisX: {
      title: `${searchParams.index}`,
    },
    axisY: {
      title: `${stockSymbol}`,
      margin: 0,
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
        legendText: `${searchIndex}`,
      //  center the legend
        margin: 10,
        padding: 10,
        legendMarkerType: "none",
        dataPoints: regressionLine.map((point) => ({
          x: point.x,
          y: point.y,
          toolTipContent: `${searchIndex}: ${point.x}, ${stockSymbol}: ${point.y}`,
        })),
      },
    ],
  };
  const handleCheckbox = async (event) => {
    let weights = await idbPromise("stockWeights", "get");
    weights = weights.map(({ portfolio_id, ...rest }) => rest);
    setStockWeights(weights[0]);
    setUseWeights(event.target.checked);

  }



  return (
    <div className="linear-reg mt-3 ">
      <div className="container">
        <div className="row w-100 card">
          <div className="row text-center">
            <h1 className="mt-3 card-header">Linear Regression</h1>
            <form
              onSubmit={handleSubmit}
              useref={searchParams}
              className="row justify-content-center"
            >
              <label htmlFor="symbol">Symbol</label>
              <div className=" d-flex flex-column justify-content-center">
                <div>
              
              <input
                type="search-bar"
                name="symbol"
                className={useWeights ? "disabled-input input-bar" : "input-bar"}
                onChange={handleInputChange}
              />
              </div>
              <div className="form-check form-switch d-flex justify-content-center align-items-center mt-2 mb-2">
                <div className="">
                <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" onChange={handleCheckbox}/>
                <label className="form-check-label align-items-center" for="flexSwitchCheckDefault">Compare Portfolio</label>
                </div>
              </div>
              </div>
              <label htmlFor="symbol">Index</label>
              <Dropdown>
              <Dropdown.Toggle className="w-50" id="dropdown-index">
                Select Index
              </Dropdown.Toggle>

              <Dropdown.Menu className="w-50 text-center dropdown-menu">
                {Object.keys(indexOptions).map((option) => (
                  <Dropdown.Item
                    key={option}
                    name="index"
                    className={searchIndex === indexOptions[option] ? "active fw-bold" : ""}
                    onClick={() => setSearchIndex(indexOptions[option])}
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
          <div className="d-flex justify-content-center">
            <div className="card lin-reg-card w-50 ">
            <div className="col-10 m-auto justify-center stock-volume mt-5">
          <RegressionTool stockSymbol={stockSymbol} searchParams={searchParams} index={index} formulaB={formulaB} formulaY={formulaY} indexName={findIndexName(searchParams.index)} searchIndex={searchIndex}/>
          </div>
          <div className="col-lg d-flex justify-content-center">
              <div className="form-group inline text-center w-50">
                <FontAwesomeIcon icon={faLineChart} size="1x" />
                <input
                  type="text"
                  className="form-control text-center"
                  value={`y = ${(formulaY).toFixed(2)} + ${(formulaB.toFixed(4))}x`}
                  readOnly
                />

              </div>
              </div>
          </div>
          </div>

        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default StockLinReg;
