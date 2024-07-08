import React, { useMemo } from "react";
import { returnInfo } from "../utils/helpers";
import { formatNumber, titleCase } from "../utils/format";
import AddPortfolio from "./AddPortfolio";
import ToolTip from "./ToolTip";

const StockDetails = ({ stockStats, stockInfo, longName }) => {
  const entries = useMemo(() => {
    return Object.entries(stockStats).filter(([key]) => returnInfo[titleCase(key)]);
  }, [stockStats]);

  const renderStockDetails = (items) =>
    items.map(([key, value]) => (
      <li className="list-group-item" key={key}>
        <ToolTip info={titleCase(key)} />
        <span className="float-end fw-bold">
          {formatNumber(value, 2)}
        </span>
      </li>
    ));

  return (
    <div className="container mt-5">
      <div className="row card custom-card">
        <div className="card-header">
          <h3 className="text-left ms-2 mt-3">
            {longName} Overview
          </h3>
        </div>
        <div className="col-12 card-items-custom d-flex">
          <ul className="list-group list-group-flush col-6">
            {renderStockDetails(entries.slice(0, entries.length / 2))}
          </ul>
          <ul className="list-group list-group-flush col-6">
            {renderStockDetails(entries.slice(entries.length / 2))}
          </ul>
        </div>
        {stockInfo && (
          <form>
            <AddPortfolio
              stockSymbol={stockStats.stockSymbol}
              page={Boolean(true)}
              longName={stockStats.longName}
              open={stockStats.open}
            />
          </form>
        )}
      </div>
    </div>
  );
};

export default StockDetails;
