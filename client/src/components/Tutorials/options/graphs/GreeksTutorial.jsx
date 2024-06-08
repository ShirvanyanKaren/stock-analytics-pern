import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Form } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import "./GraphController.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const calculateDelta = (stockPrice, strikePrice) => {
  const normalizedPrice = (stockPrice - strikePrice + 100) / 200;
  return Math.min(Math.max(normalizedPrice, 0), 1);
};

const calculateTheta = (daysToExpiration) => {
  const maxTimeValue = 1;
  const decayFactor = 0.05;
  return maxTimeValue * Math.exp(-decayFactor * daysToExpiration);
};

const calculateGamma = (stockPrice, strikePrice) => {
  const distanceToATM = Math.abs(stockPrice - strikePrice);
  return Math.min(Math.exp(-0.1 * distanceToATM), 1);
};

const calculateVega = (iv) => {
  const baseVega = 0.1;
  return baseVega * iv;
};

const calculateOptionPrice = (stockPrice, strikePrice) => {
  return Math.exp(0.05 * (stockPrice - strikePrice));
};

const GreeksTutorial = () => {
  const [greek, setGreek] = useState("Theta");
  const [daysToExpiration, setDaysToExpiration] = useState(120);
  const [strikePrice, setStrikePrice] = useState(50);
  const [iv, setIV] = useState(20);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        fill: false,
        borderColor: "blue",
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    let newLabels, newData, deltaData, optionPriceData;
    if (greek === "Theta") {
      newLabels = Array.from({ length: daysToExpiration + 1 }, (_, i) => i);
      newData = newLabels.map(day => calculateTheta(day));
    } else if (greek === "Delta") {
      const stockPriceRange = Array.from({ length: 101 }, (_, i) => strikePrice - 50 + i);
      newLabels = stockPriceRange;
      newData = newLabels.map(price => calculateDelta(price, strikePrice));
      optionPriceData = newLabels.map(price => calculateOptionPrice(price, strikePrice));
    } else if (greek === "Gamma") {
      const stockPriceRange = Array.from({ length: 101 }, (_, i) => strikePrice - 50 + i);
      newLabels = stockPriceRange;
      newData = newLabels.map(price => calculateGamma(price, strikePrice));
      deltaData = newLabels.map(price => calculateDelta(price, strikePrice));
      optionPriceData = newLabels.map(price => calculateOptionPrice(price, strikePrice));
    } else if (greek === "Vega") {
      newLabels = Array.from({ length: 101 }, (_, i) => i);
      newData = newLabels.map(iv => calculateVega(iv));
    }
    setChartData({
      labels: newLabels,
      datasets: [
        {
          label: greek,
          data: newData,
          fill: false,
          borderColor: greek === "Theta" ? "blue" : greek === "Delta" ? "green" : greek === "Gamma" ? "orange" : "purple",
          tension: 0.1,
          pointBackgroundColor: newLabels.map(price => (greek === "Delta" && price === strikePrice) ? 'red' : 'transparent'),
          pointBorderColor: newLabels.map(price => (greek === "Delta" && price === strikePrice) ? 'red' : 'transparent'),
          pointRadius: newLabels.map(price => (greek === "Delta" && price === strikePrice) ? 5 : 0),
        },
        ...(greek === "Gamma" ? [{
          label: "Delta",
          data: deltaData,
          fill: false,
          borderColor: "green",
          borderDash: [5, 5],
          tension: 0.1,
        }] : []),
        ...(greek === "Delta" || greek === "Gamma" ? [{
          label: "Option Price",
          data: optionPriceData,
          fill: false,
          borderColor: "red",
          borderDash: [10, 5],
          tension: 0.1,
        }] : [])
      ],
    });
  }, [greek, daysToExpiration, strikePrice, iv]);

  const handleGreekChange = (e) => setGreek(e.target.value);
  const handleDaysToExpirationChange = (e) => setDaysToExpiration(parseInt(e.target.value));
  const handleStrikePriceChange = (e) => setStrikePrice(parseInt(e.target.value));
  const handleIVChange = (e) => setIV(parseInt(e.target.value));

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: `${greek} Value`,
        },
        beginAtZero: true,
        max: greek === "Gamma" || greek === "Delta" ? 1 : undefined,
      },
      x: {
        title: {
          display: true,
          text: greek === "Theta" ? 'Days till Expiration' : greek === "Vega" ? 'Implied Volatility (IV)' : 'Stock Price',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: function (item, chart) {
            return item.text !== undefined;
          },
        },
      },
    },
  };

  const renderStrikePriceIndicator = () => {
    return (
      <div className="strike-price-indicator">
        <span style={{ left: `${(strikePrice / 100) * 100}%` }} className="strike-price-marker">▲</span>
      </div>
    );
  };

  return (
    <div className="graph-controller-container">
      <h4>The Greeks and Factors Affecting Option Prices</h4>
      <Form.Group controlId="greek">
        <Form.Label>Select Greek</Form.Label>
        <Form.Control as="select" value={greek} onChange={handleGreekChange}>
          <option value="Theta">Theta (Time Decay)</option>
          <option value="Delta">Delta (Change in Price)</option>
          <option value="Gamma">Gamma (Rate of Delta Change)</option>
          <option value="Vega">Vega (Volatility Impact)</option>
        </Form.Control>
      </Form.Group>
      {greek === "Theta" && (
        <Form.Group controlId="daysToExpiration">
          <Form.Label>Days till Expiration</Form.Label>
          <Form.Control type="range" min="0" max="120" value={daysToExpiration} onChange={handleDaysToExpirationChange} />
          <Form.Text className="text-muted">Days till Expiration: {daysToExpiration}</Form.Text>
        </Form.Group>
      )}
      {greek === "Delta" && (
        <>
          <Form.Group controlId="strikePrice">
            <Form.Label>Strike Price</Form.Label>
            <Form.Control type="range" min="0" max="100" value={strikePrice} onChange={handleStrikePriceChange} />
            <Form.Text className="text-muted">Strike Price: {strikePrice}</Form.Text>
            {renderStrikePriceIndicator()}
          </Form.Group>
        </>
      )}
      {greek === "Gamma" && (
        <>
          <Form.Group controlId="strikePrice">
            <Form.Label>Strike Price</Form.Label>
            <Form.Control type="range" min="0" max="100" value={strikePrice} onChange={handleStrikePriceChange} />
            <Form.Text className="text-muted">Strike Price: {strikePrice}</Form.Text>
            {renderStrikePriceIndicator()}
          </Form.Group>
        </>
      )}
      {greek === "Vega" && (
        <Form.Group controlId="iv">
          <Form.Label>Implied Volatility (IV)</Form.Label>
          <Form.Control type="range" min="0" max="100" value={iv} onChange={handleIVChange} />
          <Form.Text className="text-muted">Implied Volatility: {iv}</Form.Text>
        </Form.Group>
      )}
      <Line data={chartData} options={options} />
      {greek === "Delta" && (
        <div className="legend-container">
          <p><span style={{ color: 'red' }}>●</span> User's Strike Price</p>
        </div>
      )}
    </div>
  );
};

export default GreeksTutorial;
