import { getCompanyFinancials } from "./fetchFinanceData";
import { useEffect, useState } from "react";
import ToolTip from "./ToolTip"; // Import the ToolTip component

const StockFinancials = (props) => {
  const [financials, setFinancials] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isQuarters, setIsQuarters] = useState(true);
  const [statement, setStatementType] = useState("income");
  const [symbol, setSymbol] = useState(props.symbol);

  useEffect(() => {
    const getFinancials = async () => {
      try {
        let data = await getCompanyFinancials(symbol, statement, isQuarters);
        data = JSON.parse(data);
        for (let row in data) {
          if (data[row].asOfDate === data[row - 1]?.asOfDate) data.splice(row, 1);
        }
        data.sort((a, b) => new Date(b.asOfDate) - new Date(a.asOfDate));
        setFinancials(data);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching financials:", error);
      }
    };
    getFinancials();
  }, [isQuarters, statement, symbol]);

  const formatDate = (date) => {
    let newDate = new Date(date).toISOString().slice(0, 10);
    return newDate;
  };

  const titleCase = (str) => {
    return str
      .split(/(?=[A-Z])/)
      .join(" ")
      .replace(/\b\w/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) {
      return "------"; // or any default value for null or undefined
    }
    if (Math.abs(num) > 1000000000) {
      return (num / 1000000000).toFixed(2) + " B";
    } else if (Math.abs(num) > 1000000) {
      return (num / 1000000).toFixed(2) + " M";
    } else if (Math.abs(num) > 1000) {
      return (num / 1000).toFixed(2) + " K";
    } else {
      return num;
    }
  };

  const formatTable = (financials) => {
    let metrics = Object.keys(financials[0]);
    metrics.shift();
    metrics.shift();
    return metrics.map((metric, index) => (
      <tr key={index}>
        <td className="fw-bold">
          <ToolTip info={titleCase(metric)} /> {/* Display the metric name only */}
        </td>
        {financials.map((fin, index) => (
          <td key={index}>{formatNumber(fin[metric])}</td>
        ))}
      </tr>
    ));
  };

  const changeStatement = (statement) => {
    setStatementType(statement);
  };

  return (
    <div className="container mt-5">
      {isLoaded && (
        <div className="row card custom-card">
          <div className="card-header d-flex flex-direction-row justify-content-around">
            <h3
              onClick={() => changeStatement("income")}
              className={statement === "income" ? "active-stat statement" : "statement"}
            >
              Income Statement
            </h3>
            <h3
              onClick={() => changeStatement("balance")}
              className={statement === "balance" ? "active-stat statement" : "statement"}
            >
              Balance Sheet
            </h3>
            <h3
              onClick={() => changeStatement("cash")}
              className={statement === "cash" ? "active-stat statement" : "statement"}
            >
              Cash Flow Statement
            </h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="d-flex flex-direction-row justify-content-center mb-2">
                <h6
                  className={isQuarters ? "ms-3 fs-5 info" : "ms-3 fs-5 info active-stat "}
                  onClick={() => setIsQuarters(false)}
                >
                  Annual
                </h6>
                <h6
                  className={isQuarters ? "ms-3 fs-5 info active-stat" : "ms-3 fs-5 info"}
                  onClick={() => setIsQuarters(true)}
                >
                  Quarterly
                </h6>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <table className="table table-hover">
                  <thead>
                    <tr className="mt-2">
                      <th className="fs-6">Metrics</th>
                      {financials.map((fin, index) => (
                        <th key={index} className="fs-6">
                          {formatDate(fin.asOfDate)}
                        </th>
                      ))}
                    </tr>
                    {formatTable(financials)}
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockFinancials;
