import { getCompanyFinancials } from "../utils/helpers";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ToolTip from "./ToolTip";
import { useHighlight } from '/src/contexts/HighlightContext'; // Correctly import useHighlight
import { standardizeTerm } from '../utils/termFormatter'; // Import termFormatter
import { idbPromise } from '../utils/helpers'; // Import idbPromise

const StockFinancials = (props) => {
  const { helpMode, handleElementClick } = useOutletContext();
  const { addHighlight } = useHighlight();
  const [financials, setFinancials] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isQuarters, setIsQuarters] = useState(true);
  const [statement, setStatement] = useState("income");
  const [symbol, setSymbol] = useState(props.symbol);

  useEffect(() => {   
    const getFinancials = async () => {
      let data;
      const cachedData = await idbPromise("financials", "get");
  
      const cachedFinancial = cachedData?.data?.symbol === symbol && cachedData?.data?.quarters === isQuarters ? cachedData : null;
      if (cachedFinancial) {
        console.log("No new data, using cached data");
        data = cachedFinancial.data;
      } else {
        console.log("Fetching new data");
        await idbPromise("financials", "delete");
        data = await getCompanyFinancials(symbol, isQuarters);
        console.log(data, symbol)
        await idbPromise("financials", "put", { symbol, quarters: isQuarters, data });
      }   
      setFinancials(data); 
      setIsLoaded(true);
    };
   
    getFinancials(); 
  }, [isQuarters, symbol]);
  

  const formatDate = (date) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  const titleCase = (str) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) {
      return "------";
    }
    if (Math.abs(num) > 1000000000) {
      return (num / 1000000000).toFixed(2) + ' B';
    } else if (Math.abs(num) > 1000000) {
      return (num / 1000000).toFixed(2) + ' M';
    } else if (Math.abs(num) > 1000) {
      return (num / 1000).toFixed(2) + ' K';
    } else {
      return typeof num === 'number' ? num.toFixed(2) : num;
    }
  };

  const formatTable = (financials) => {
    if (!financials[statement] || financials[statement].length === 0) {
      return null;
    }
    let metrics = Object.keys(financials[statement][0]);
    metrics.shift();
    metrics.shift();
    return metrics.map((metric, index) => {
      const standardizedMetric = standardizeTerm(metric);
      return (
        <tr key={index}>
          <td
            className={`fw-bold ${helpMode ? 'highlight' : ''}`}
            onClick={() => {
              handleElementClick(standardizedMetric);
              addHighlight(standardizedMetric);
            }}
          >
            <ToolTip info={titleCase(metric)}>{titleCase(metric)}</ToolTip>
          </td>
          {(financials[statement] || []).map((fin, index) => (
            <td key={index}>{formatNumber(fin[metric])}</td>
          ))}
        </tr>
          // {financials.map((fin, index) => (
          //   <td key={index}>{formatNumber(fin[metric])}</td>
          // ))}
        // </tr>
      );
    });
  };
  

  const changeStatement = (statement) => {
    setStatement(statement);
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
                  className={isQuarters ? "ms-3 fs-5 info" : "ms-3 fs-5 info active-stat"}
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
