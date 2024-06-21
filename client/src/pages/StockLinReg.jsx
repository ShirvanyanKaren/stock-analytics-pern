import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { Dropdown } from "react-bootstrap";
import { linReg, idbPromise, indexOptions, generateChartOptions, } from "../utils/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLineChart } from "@fortawesome/free-solid-svg-icons";
import StockDetails from "../components/StockDetails";

const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const StockLinReg = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [dataPoints, setDataPoints] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useWeights, setUseWeights] = useState(false);
  const [stockWeights, setStockWeights] = useState({});
  const [searchParams, setSearchParams] = useState({symbol: "", index: "SP500",});
  const [options, setChartOptions] = useState({});
  const [regressionInfo, setRegressionInfo] = useState({
    longName: "Linear Regression",
  });
  const [formula, setFormula] = useState({ coef: null, intercept: null });
  const [dates, setDates] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!symbol) return;
    const fetchAndSetData = async () => {
      const params = symbol.split("-");
      params[1] = params[1].replace("_", " ");
      setSearchParams({ symbol: params[0], index: params[1] });
      await fetchLinRegData(params[0], params[1]);
    };
    fetchAndSetData();
    setIsLoaded(true);
  }, []);

  const fetchStockWeights = async () => {
    if(Object.keys(stockWeights).length === 0 || !stockWeights){
      const weights = await idbPromise("stockWeights", "get");
      const weightsObject = await weights.map(({ portfolio_id, ...rest }) => rest)[0];
      setStockWeights(weightsObject);
      return weightsObject;
    } else {
      return stockWeights;
    }
  }

  const fetchLinRegData = async (symbol, index) => {
    if (dates.startDate > dates.endDate) {
      alert("Start date must be before end date");
      return;
    } else if (dates.startDate === dates.endDate) {
      alert("Start date cannot be the same as end date");
      return;
    }
    let weightsObject = await fetchStockWeights();
    weightsObject = useWeights || symbol === "Portfolio" ? JSON.stringify(weightsObject) : "";
    const data = await linReg({ symbol, index }, dates.startDate, dates.endDate, weightsObject);
    const dataArray = JSON.parse(data[0]);
    const dps = dataArray.map((item) => ({ x: Number(item[1]), y: Number(item[0])}));
    const formula = { coef: data[1]["coef"], intercept: data[1]["intercept"] };
    setRegressionInfo(data[1]["model"]);
    setFormula(formula);
    setDataPoints(dps);
    const options = generateChartOptions("regression", {
      theme: "dark1",
      index: dps,
      searchParams: { symbol, index },
      formula: formula,
    });
    setChartOptions(options);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    const symbol = useWeights ? "Portfolio" : searchParams.symbol;
    const transformedIndex = searchParams.index.replace(" ", "_");
    navigate(`/linear-regression/${symbol}-${transformedIndex}`);
    if (!symbol && !useWeights) {
      alert("Please enter a stock symbol");
      return;
    } else if (!searchParams.index) {
      alert("Please select an index");
      return;
    }
    setSearchParams({ symbol, index: searchParams.index });
    await fetchLinRegData(symbol, searchParams.index);
  };

  const handleCheckbox = async (event) => {
    setUseWeights(event.target.checked);
    setSearchParams((prevParams) => ({ ...prevParams, symbol: event.target.checked ? "Portfolio" : "" }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSearchParams((prevParams) => ({ ...prevParams, [name]: value }));
  };

  return (
      <div className="linear-reg mt-3">
          <main>
            <div className="chart mt-4">
              <div className="d-flex justify-content-center">
                <div className="card w-75 align-items-center lin-reg-card">
                  <div className="container w-75 d-flex">
                    <div className="w-100 m-3">
                      <h1 className="text-center">
                        Linear Regression
                      </h1>
                      <form onSubmit={handleSubmit} className="form-container">
                        <div className="form-group text-center">
                        <div className="input-group mb-3 text-center w-100 d-flex flex-column align-items-center">
                          <label htmlFor="symbol">Symbol</label>
                            <input
                              type="text"
                              name="symbol"
                              className={`form-control text-center w-25 mt-2 ${
                                useWeights ? "disabled-input" : ""
                              }`}
                              value={searchParams.symbol}
                              onChange={handleInputChange}
                              disabled={useWeights}
                            />
                          </div>
                        </div>
                        <div className="form-group text-center">
                          <label htmlFor="index">Index</label>
                          <Dropdown
                            onSelect={(eventKey) =>
                              setSearchParams((prev) => ({
                                ...prev,
                                index: eventKey,
                              }))
                            }
                          >
                            <Dropdown.Toggle
                              className="w-75"
                              id="dropdown-index"
                            >
                              {searchParams.index}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="w-75 text-center">
                              {Object.keys(indexOptions).map((option) => (
                                <Dropdown.Item key={option} eventKey={option}>
                                  {option}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                        <div className="form-group form-check form-switch mt-3 d-flex justify-content-center">
                          <input
                            className="form-check-input me-2"
                            type="checkbox"
                            defaultChecked={useWeights}
                            id="flexSwitchCheckDefault"
                            onChange={handleCheckbox}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="flexSwitchCheckDefault"
                          >
                            Compare Portfolio
                          </label>
                        </div>
                        <div className="form-group d-flex justify-content-center">
                          <button
                            type="submit"
                            className="btn btn-primary w-50 mt-4"
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                      <div className="date-range mt-5 text-center d-flex flex-direction-row justify-content-around">
                        {
                          Object.keys(dates).map((date, index) => (
                            <div key={index} className="form-group">
                              <label>{date === "startDate" ? "Start Date" : "End Date"}</label>
                              <input
                                type="date"
                                className="form-control text-center"
                                value={dates[date]}
                                max={new Date().toISOString().slice(0, 10)}
                                min={date === "startDate" ? "2010-01-01" : dates.startDate}
                                onChange={(e) =>
                                  setDates({
                                    ...dates,
                                    [date]: e.target.value,
                                  })
                                }
                              />
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  {(dataPoints.length > 0) && (
                  <div className="lin-reg-graph container card w-100">
                    <div className="card-header text-center">
                      <FontAwesomeIcon icon={faLineChart} size="3x" />
                    </div>
                    <div className="stock-volume mt-3 mb-3">
                      <CanvasJSChart options={options} />
                    </div>
                  </div>
                  )}
                </div>
              </div>
              { (dataPoints.length > 0) && (
              <StockDetails
                stockStats={regressionInfo}
                stockInfo={false}
                longName="Linear Regression" 
              />
              )}
            </div>
          </main>
      </div>
  );
};

export default StockLinReg;
