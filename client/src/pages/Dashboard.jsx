// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import StockCard from "../components/StockCard";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [watchlists, setWatchlists] = useState(JSON.parse(sessionStorage.getItem("watchlists")) || ["Default Watchlist"]);
  const [currentWatchlist, setCurrentWatchlist] = useState(sessionStorage.getItem("currentWatchlist") || "Default Watchlist");
  const [watchlistStocks, setWatchlistStocks] = useState(JSON.parse(sessionStorage.getItem(currentWatchlist)) || []);

  useEffect(() => {
    const storedWatchlists = JSON.parse(sessionStorage.getItem("watchlists")) || ["Default Watchlist"];
    const storedCurrentWatchlist = sessionStorage.getItem("currentWatchlist") || "Default Watchlist";
    const storedWatchlistStocks = JSON.parse(sessionStorage.getItem(storedCurrentWatchlist)) || [];

    setWatchlists(storedWatchlists);
    setCurrentWatchlist(storedCurrentWatchlist);
    setWatchlistStocks(storedWatchlistStocks);
  }, []);

  useEffect(() => {
    const storedWatchlistStocks = JSON.parse(sessionStorage.getItem(currentWatchlist)) || [];
    setWatchlistStocks(storedWatchlistStocks);
  }, [currentWatchlist]);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <DropdownButton id="dropdown-basic-button" title={currentWatchlist}>
        {watchlists.map((watchlist, index) => (
          <Dropdown.Item key={index} onClick={() => setCurrentWatchlist(watchlist)}>
            {watchlist}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      <div className="watchlist-stocks">
        {watchlistStocks.map((stock, index) => (
          <StockCard key={index} stock={stock} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
