import { getCompanyFinancials, idbPromise } from "../utils/helpers";
import { formatDate, formatNumber, titleCase } from "../utils/format";
import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import ToolTip from "./ToolTip";
import { useHighlight } from "../contexts/HighlightContext";
import { standardizeTerm } from "../utils/format";

const StockFinancials = ({ symbol }) => {
  const { helpMode, handleElementClick } = useOutletContext();
  const { addHighlight } = useHighlight();
  const [financials, setFinancials] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isQuarters, setIsQuarters] = useState(true);
  const [statement, setStatement] = useState("income");
  const categories = ["income", "balance", "cash"];

  const fetchFinancials = useCallback(async () => {
    try {
      let data;
      const cachedData = await idbPromise("financials", "get");

      if (cachedData?.symbol === symbol && cachedData?.quarters === isQuarters) {
        data = cachedData.data;
      } else {
        await idbPromise("financials", "delete");
        data = await getCompanyFinancials(symbol, isQuarters);
        await idbPromise("financials", "put", { symbol, quarters: isQuarters, data });
      }

      setFinancials(data);
      setIsLoaded(true);
    } catch (error) {
      console.error("Error fetching financial data:", error);
    }
  }, [symbol, isQuarters]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  const formatTable = (financials) => {
    if (!financials[statement] || financials[statement].length === 0) {
      return null;
    }
    const metrics = Object.keys(financials[statement][0]).slice(2);

    return (
      <tbody>
        {metrics.map((metric, index) => {
          const standardizedMetric = standardizeTerm(metric);
          return (
            <tr key={index}>
              <td
                className={`fw-bold ${helpMode ? "highlight" : ""}`}
                onClick={() => {
                  handleElementClick(standardizedMetric);
                  addHighlight(standardizedMetric);
                }}
              >
                <ToolTip info={titleCase(metric)}>{titleCase(metric)}</ToolTip>
              </td>
              {financials[statement].map((fin, idx) => (
                <td key={idx}>{formatNumber(fin[metric], 2)}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    );
  };

  const changeStatement = (statement) => setStatement(statement);

  return (
    <div className="container mt-5">
      {isLoaded && financials && (
        <div className="row card custom-card">
          <div className="card-header d-flex flex-direction-row justify-content-around">
            {categories.map((type) => (
              <h6
                key={type}
                onClick={() => changeStatement(type)}
                className={statement === type ? "info active-stat" : "info"}
              >
                {type === "income" ? "Income Statement" : type === "balance" ? "Balance Sheet" : "Cash Flow Statement"}
              </h6>
            ))}
          </div>
          <div className="card-body">
            <div className="row">
              <div className="d-flex flex-direction-row justify-content-center mb-2">
                <h6
                  className={`ms-3 fs-5 info ${!isQuarters && "active-stat"}`}
                  onClick={() => setIsQuarters(false)}
                >
                  Annual
                </h6>
                <h6
                  className={`ms-3 fs-5 info ${isQuarters && "active-stat"}`}
                  onClick={() => setIsQuarters(true)}
                >
                  Quarterly
                </h6>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <table className="table table-striped">
                  <thead>
                    <tr className="mt-2">
                      <th className="fs-6">Metrics</th>
                      {financials[statement] &&
                        financials[statement].map((fin, index) => (
                          <th key={index} className="fs-6">
                            {formatDate(fin.asOfDate)}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  {financials[statement] && formatTable(financials)}
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
