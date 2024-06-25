// src/components/StockCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import "../styles/StockCard.css";

const StockCard = ({ stock }) => {
  return (
    <div className="stock-card">
      <h3>{stock.stock_symbol}</h3>
      <div className="stock-card-content">
        <div className="snapshot">
          <p>Snapshot</p>
          <div className="snapshot-image">{/* Replace with actual image if available */}</div>
        </div>
        <div className="metrics">
          <p>Metrics</p>
          <p>Price: {stock.price}</p>
          <p>Day Change: {stock.day_change}%</p>
          <p>After Hours Change: {stock.after_hours_change}%</p>
        </div>
        <div className="ratios">
          <p>Ratios</p>
          {/* Add actual ratios here */}
        </div>
      </div>
      <div className="stock-card-footer">
        <button>Show more</button>
      </div>
    </div>
  );
};

StockCard.propTypes = {
  stock: PropTypes.shape({
    stock_symbol: PropTypes.string.isRequired,
    stock_name: PropTypes.string,
    price: PropTypes.number,
    day_change: PropTypes.number,
    after_hours_change: PropTypes.number,
    // Add other necessary prop types here
  }).isRequired,
};

export default StockCard;
