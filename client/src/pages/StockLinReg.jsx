import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { Dropdown } from "react-bootstrap";
import {
  linReg,
  generateScatterLineGraphOptions,
  idbPromise,
  indexOptions,
} from "../utils/helpers";
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
  const [stockSymbol, setStockSymbol] = useState(symbol || "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [useWeights, setUseWeights] = useState(false);
  const [stockWeights, setStockWeights] = useState({});
  const [searchParams, setSearchParams] = useState({
    symbol: "",
    index: "^GSPC",
  });
  const [options, setChartOptions] = useState({});
  const [regressionInfo, setRegressionInfo] = useState({});
  const [formula, setFormula] = useState({ coef: null, intercept: null });
  const [dates, setDates] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!symbol) return;
    const fetchAndSetData = async () => {
      const params = symbol.split("-");
      if (params[0] === "Portfolio") setUseWeights(true);
      const weights = await idbPromise("stockWeights", "get");
      const filteredWeights = weights.map(({ portfolio_id, ...rest }) => rest);
      setStockWeights(filteredWeights[0]);
      setSearchParams({ symbol: params[0], index: params[1] });
      await fetchLinRegData(params[0], params[1], filteredWeights[0]);
    };
    fetchAndSetData();
    setIsLoaded(true);
  }, []);

  const fetchLinRegData = async (symbol, index, weightsObject) => {
    if (dates.startDate > dates.endDate) {
      alert("Start date must be before end date");
      return;
    } else if (dates.startDate === dates.endDate) {
      alert("Start date cannot be the same as end date");
      return;
    }
    weightsObject = symbol === "Portfolio" ? JSON.stringify(weightsObject) : "";
    const data = await linReg(
      { symbol, index },
      dates.startDate,
      dates.endDate,
      weightsObject
    );
    const dataArray = JSON.parse(data[0]);
    const dps = dataArray.map((item) => ({
      x: Number(item[1]),
      y: Number(item[0]),
    }));
    const formula = { coef: data[1]["coef"], intercept: data[1]["intercept"] };
    setRegressionInfo(data[1]["model"]);
    setFormula(formula);
    setDataPoints(dps);
    const options = await generateScatterLineGraphOptions(
      "dark1",
      { symbol, index },
      dps,
      formula
    );
    setChartOptions(options);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSearchParams((prevParams) => ({ ...prevParams, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const symbol = useWeights ? "Portfolio" : searchParams.symbol;
    const transformedIndex = searchParams.index.replace(" ", "-");
    navigate(`/stocklinreg/${symbol}-${transformedIndex}`);
    if (!symbol && !useWeights) {
      alert("Please enter a stock symbol");
      return;
    } else if (!searchParams.index) {
      alert("Please select an index");
      return;
    }
    setSearchParams({ symbol, index: searchParams.index });
    await fetchLinRegData(symbol, searchParams.index, stockWeights);
  };

  const handleCheckbox = async (event) => {
    setUseWeights(event.target.checked);
    setSearchParams((prevParams) => ({ ...prevParams, symbol: "Portfolio" }));
  };

  return (
      <div className="linear-reg mt-3">
          <main>
            <div className="chart mt-4">
              <div className="d-flex justify-content-center">
                <div className="card lin-reg-card w-75 p-4">
                  <div className="container w-50 d-flex">
                    <div className="card p-4 w-100">
                      <h1 className="text-center card-header">
                        Linear Regression
                      </h1>
                      <form onSubmit={handleSubmit} className="form-container">
                        <div className="form-group text-center">
                          <label htmlFor="symbol">Symbol</label>
                          <div className="input-group mb-3 text-center w-100 d-flex justify-content-center">
                            <input
                              type="text"
                              name="symbol"
                              className={`form-control text-center ${
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
                      <div className="date-range mt-5">
                        <div className="row">
                          <div className="col-lg-6 mb-3">
                            <div className="form-group">
                              <label>Start Date</label>
                              <input
                                type="date"
                                className="form-control"
                                value={dates.startDate}
                                onChange={(e) =>
                                  setDates({
                                    ...dates,
                                    startDate: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="col-lg-6 mb-3">
                            <div className="form-group">
                              <label>End Date</label>
                              <input
                                type="date"
                                className="form-control"
                                value={dates.endDate}
                                onChange={(e) =>
                                  setDates({
                                    ...dates,
                                    endDate: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {(dataPoints.length > 0) && (
                  <div className="lin-reg-graph container card p-4 w-100">
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
