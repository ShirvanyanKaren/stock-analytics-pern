
import React, { useState, useEffect } from "react";
import { Form, FormControl } from "react-bootstrap";
import "./GraphController.css";

const ExpirationsTutorial = () => {
  const [price, setPrice] = useState(100);
  const [daysToExpiration, setDaysToExpiration] = useState(30);
  const [strikePrice, setStrikePrice] = useState(100);
  const [optionType, setOptionType] = useState("call");
  const [buySell, setBuySell] = useState("buy");
  const [feedback, setFeedback] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });

  useEffect(() => {
    const calculateFeedback = () => {
      let result = "";
      let isProfitable = false;

      if (optionType === "call") {
        isProfitable = price > strikePrice;
      } else {
        isProfitable = price < strikePrice;
      }

      if (daysToExpiration <= 0) {
        if (buySell === "buy") {
          result = isProfitable ? "High chance of profit" : "High chance of loss";
        } else {
          result = isProfitable ? "High chance of loss" : "High chance of profit";
        }
      } else {
        if (buySell === "buy") {
          result = isProfitable ? "High chance of profit" : "High chance of loss";
        } else {
          result = isProfitable ? "High chance of loss" : "High chance of profit";
        }
      }

      if (price === strikePrice) {
        result = "High chance of breaking even";
      }

      setFeedback(result);
    };
    calculateFeedback();
  }, [price, daysToExpiration, strikePrice, optionType, buySell]);

  const handlePriceChange = (e) => {
    setPrice(parseInt(e.target.value));
  };

  const handleDaysChange = (e) => {
    setDaysToExpiration(parseInt(e.target.value));
  };

  const handleStrikePriceChange = (e) => {
    const newStrikePrice = parseInt(e.target.value);
    setStrikePrice(newStrikePrice);
    setPriceRange({ min: newStrikePrice - 100, max: newStrikePrice + 100 });
    setPrice(newStrikePrice);
  };

  const handleOptionTypeChange = (e) => {
    setOptionType(e.target.value);
  };

  const handleBuySellChange = (e) => {
    setBuySell(e.target.value);
  };

  return (
    <div className="graph-controller-container">
      <h4>Expirations</h4>
      <Form.Group controlId="daysToExpiration">
        <Form.Label>Days till Expiration</Form.Label>
        <Form.Control
          type="range"
          min="0"
          max="90"
          value={daysToExpiration}
          onChange={handleDaysChange}
        />
        <Form.Text className="text-muted">Days till Expiration: {daysToExpiration}</Form.Text>
      </Form.Group>
      <Form.Group controlId="price">
        <Form.Label>Price</Form.Label>
        <Form.Control
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          value={price}
          onChange={handlePriceChange}
        />
        <Form.Text className="text-muted">Price: {price}</Form.Text>
      </Form.Group>
      <Form.Group controlId="strikePrice">
        <Form.Label>Strike Price</Form.Label>
        <FormControl
          type="number"
          value={strikePrice}
          onChange={handleStrikePriceChange}
          className="mb-3"
        />
      </Form.Group>
      <Form.Group>
        <Form.Check
          type="radio"
          label="Call Option"
          value="call"
          checked={optionType === "call"}
          onChange={handleOptionTypeChange}
          inline
        />
        <Form.Check
          type="radio"
          label="Put Option"
          value="put"
          checked={optionType === "put"}
          onChange={handleOptionTypeChange}
          inline
        />
      </Form.Group>
      <Form.Group>
        <Form.Check
          type="radio"
          label="Buy"
          value="buy"
          checked={buySell === "buy"}
          onChange={handleBuySellChange}
          inline
        />
        <Form.Check
          type="radio"
          label="Sell"
          value="sell"
          checked={buySell === "sell"}
          onChange={handleBuySellChange}
          inline
        />
      </Form.Group>
      <div className="bar-container">
        <div
          className="bar"
          style={{
            height: feedback.includes("profit") ? "100%" : feedback.includes("loss") ? "50%" : "50%",
            backgroundColor: feedback.includes("profit") ? "green" : feedback.includes("loss") ? "red" : "gray",
            marginTop: feedback.includes("profit") ? "0" : feedback.includes("loss") ? "50%" : "50%",
          }}
        ></div>
      </div>
      <p>{feedback}</p>
    </div>
  );
};

export default ExpirationsTutorial;