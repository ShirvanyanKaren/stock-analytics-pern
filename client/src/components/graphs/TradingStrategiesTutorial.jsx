

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

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Profit/Loss calculation function
const calculateProfitLoss = (futurePrice, strategy, strikePrice) => {
  const longPremium = 10;   // Example premium paid for a long position
  const shortPremium = 8;   // Example premium received for a short position
  let upperStrike, lowerStrike;

  switch (strategy) {
    case "longCall":
      return Math.max(0, futurePrice - strikePrice) - longPremium;
    case "shortCall":
      return shortPremium - Math.max(0, futurePrice - strikePrice);
    case "ironCondor":
      upperStrike = strikePrice + 10;
      lowerStrike = strikePrice - 10;
      return (futurePrice > lowerStrike && futurePrice < upperStrike) ? 5 : -5;
    case "verticalSpreadCall":
      upperStrike = strikePrice + 10;
      return Math.max(0, futurePrice - strikePrice) - longPremium - (Math.max(0, futurePrice - upperStrike) - shortPremium);
    case "verticalSpreadPut":
      lowerStrike = strikePrice - 10;
      return Math.max(0, strikePrice - futurePrice) - longPremium - (Math.max(0, lowerStrike - futurePrice) - shortPremium);
    default:
      return 0;  // Handles any unrecognized strategy
  }
};

const TradingStrategiesTutorial = () => {
  const [strikePrice, setStrikePrice] = useState(50);
  const [strategy, setStrategy] = useState("longCall");
  const [chartData, setChartData] = useState({
    labels: Array.from({ length: 101 }, (_, i) => i),
    datasets: [
      {
        label: "Profit/Loss",
        data: Array(101).fill(0),
        fill: false,
        borderColor: "blue",
        tension: 0.1,
      },
      {
        label: "Peaks",
        data: [],
        fill: false,
        borderColor: "red",
        pointBackgroundColor: "red",
        pointRadius: 5,
        showLine: false
      }
    ],
  });
  const [chartOptions, setChartOptions] = useState({
    scales: {
      y: {
        title: {
          display: true,
          text: 'Profit or Loss',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Future Stock Price',
        },
      },
    },
  });

  useEffect(() => {
    const updateChartData = () => {
      const newLabels = Array.from({ length: 101 }, (_, i) => i);
      const newData = newLabels.map(price => calculateProfitLoss(price, strategy, strikePrice));
      const maxProfit = Math.max(...newData);
      const minProfit = Math.min(...newData);
      const peakIndices = [newData.indexOf(maxProfit), newData.indexOf(minProfit)];
      const peakData = peakIndices.map(index => ({ x: newLabels[index], y: newData[index] }));

      setChartData(prevData => ({
        ...prevData,
        labels: newLabels,
        datasets: [
          {
            ...prevData.datasets[0],
            data: newData
          },
          {
            ...prevData.datasets[1],
            data: peakData
          }
        ],
      }));

      setChartOptions(prevOptions => ({
        ...prevOptions,
        scales: {
          ...prevOptions.scales,
          y: {
            ...prevOptions.scales.y,
            min: minProfit - 10,
            max: maxProfit + 10
          }
        }
      }));
    };
    updateChartData();
  }, [strikePrice, strategy]);

  const handleStrikePriceChange = e => setStrikePrice(parseInt(e.target.value));
  const handleStrategyChange = e => setStrategy(e.target.value);

  return (
    <div className="graph-controller-container">
      <h4>Trading Strategies</h4>
      <Form.Group controlId="strikePrice">
        <Form.Label>Strike Price</Form.Label>
        <Form.Control type="range" min="0" max="100" value={strikePrice} onChange={handleStrikePriceChange} />
        <Form.Text className="text-muted">Strike Price: {strikePrice}</Form.Text>
      </Form.Group>
      <Form.Group controlId="strategy">
        <Form.Label>Select Strategy</Form.Label>
        <Form.Control as="select" value={strategy} onChange={handleStrategyChange}>
          <option value="longCall">Long Call</option>
          <option value="shortCall">Short Call</option>
          <option value="ironCondor">Iron Condor</option>
          <option value="verticalSpreadCall">Vertical Spread Call</option>
          <option value="verticalSpreadPut">Vertical Spread Put</option>
        </Form.Control>
      </Form.Group>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default TradingStrategiesTutorial;
