import { getCompanyFinancials, idbPromise, } from "../utils/helpers";
import { formatDate, formatNumber, titleCase, } from "../utils/format";
import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import ToolTip from "./ToolTip";
import { useHighlight } from "/src/contexts/HighlightContext";
import { standardizeTerm } from "../utils/format";

const StockFinancials = ({ symbol: initialSymbol }) => {
  const { helpMode, handleElementClick } = useOutletContext();
  const { addHighlight } = useHighlight();
  const [financials, setFinancials] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isQuarters, setIsQuarters] = useState(true);
  const [statement, setStatement] = useState("income");
  const [symbol, setSymbol] = useState(initialSymbol);
  const categories = ["Income Statement", "Balance Sheet", "Cash Flow Statement"];

  const fetchFinancials = useCallback(async () => {
    let data;
    const cachedData = await idbPromise("financials", "get");

    if (cachedData?.data?.symbol === symbol && cachedData?.data?.quarters === isQuarters) {
      data = cachedData.data;
    } else {
      await idbPromise("financials", "delete");
      data = await getCompanyFinancials(symbol, isQuarters);
      await idbPromise("financials", "put", { symbol, quarters: isQuarters, data });
    }

    setFinancials(data);
    setIsLoaded(true);
  }, [symbol, isQuarters]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  const formatTable = (financials) => {
    if (!financials[statement] || financials[statement].length === 0) {
      return null;
    }
    const metrics = Object.keys(financials[statement][0]).slice(2);

    return metrics.map((metric, index) => {
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
          {financials[statement].map((fin, index) => (
            <td key={index}>{formatNumber(fin[metric])}</td>
          ))}
        </tr>
      );
    });
  };

  const changeStatement = (statement) => setStatement(statement);

  return (
    <div className="container mt-5">
      {isLoaded && (
        <div className="row card custom-card">
          <div className="card-header d-flex flex-direction-row justify-content-around">
            {categories.map((type) => (
              <h6
                key={type}
                onClick={() => changeStatement(type)}
                className={statement === type ? "info active-stat" : "info"}
              >
                {type}
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
                      {financials[statement].map((fin, index) => (
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
