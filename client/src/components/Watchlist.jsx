// src/components/Watchlist.jsx
import React, { useState, useEffect, useCallback } from "react";
import { stockWatchlistSearch, getStockOverview } from "../utils/helpers";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Button, Modal, Dropdown, DropdownButton } from "react-bootstrap";
import defaultStockImage from "../assets/default-stock.jpeg";
import "../styles/Watchlist.css";

const Watchlist = ({ onUpdate }) => {
  const [watchlists, setWatchlists] = useState(["Default Watchlist"]);
  const [currentWatchlist, setCurrentWatchlist] = useState("Default Watchlist");
  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [show, setShow] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [stockSymbol, setStockSymbol] = useState("");
  const [watchlistName, setWatchlistName] = useState("");
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedWatchlists = JSON.parse(sessionStorage.getItem("watchlists")) || ["Default Watchlist"];
    const storedCurrentWatchlist = sessionStorage.getItem("currentWatchlist") || "Default Watchlist";
    const storedWatchlistStocks = JSON.parse(sessionStorage.getItem(storedCurrentWatchlist)) || [];

    setWatchlists(storedWatchlists);
    setCurrentWatchlist(storedCurrentWatchlist);
    setWatchlistStocks(storedWatchlistStocks);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("currentWatchlist", currentWatchlist);
    const storedWatchlistStocks = JSON.parse(sessionStorage.getItem(currentWatchlist)) || [];
    setWatchlistStocks(storedWatchlistStocks);
    onUpdate(currentWatchlist, storedWatchlistStocks);
  }, [currentWatchlist]);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleShowCreate = () => setShowCreate(true);
  const handleCloseCreate = () => setShowCreate(false);

  const handleAddToWatchlist = async (stockSymbol) => {
    try {
      const stockOverview = await getStockOverview(stockSymbol);
      if (stockOverview) {
        const newStock = {
          stock_symbol: stockSymbol,
          stock_name: stockOverview.name || stockSymbol,
          price: stockOverview.currentPrice || 0,
          day_change: stockOverview.priceChangePercent || 0,
          after_hours_change: stockOverview.afterHoursChangePercent || 0,
        };
        const newWatchlistStocks = [...watchlistStocks, newStock];
        setWatchlistStocks(newWatchlistStocks);
        sessionStorage.setItem(currentWatchlist, JSON.stringify(newWatchlistStocks));
        onUpdate(currentWatchlist, newWatchlistStocks);
        setStockSymbol("");
        handleClose();
      } else {
        setError("Failed to fetch stock overview.");
      }
    } catch (e) {
      console.error("Error adding to watchlist:", e);
      setError(e.message);
    }
  };

  const handleCreateWatchlist = () => {
    try {
      const newWatchlists = [...watchlists, watchlistName];
      setWatchlists(newWatchlists);
      sessionStorage.setItem("watchlists", JSON.stringify(newWatchlists));
      sessionStorage.setItem(watchlistName, JSON.stringify([]));
      setWatchlistName("");
      handleCloseCreate();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const renderOption = (option) => (
    <div className="list-group-item list-group-item-action active absolute search-list text-decoration-none" key={option.label}>
      <img src={option.image} alt={option.name} />
      <div className="search-items justify-content-around align-items-center">
        <li>
          <Link to={`/stockinfo/${option.label}`} className="text-decoration-underline text-dark">
            {`${option.label}.${option.exchange}`}
          </Link>
        </li>
        <li>{option.open}</li>
        <li>{option.close}</li>
        <li>
          <FontAwesomeIcon
            icon={option.change > 0 ? faCaretUp : faCaretDown}
            className={option.change > 0 ? "text-success me-1" : "text-danger me-1"}
          />
          {(option.change * 100).toFixed(2)}%
        </li>
        <Button variant="primary" onClick={() => handleAddToWatchlist(option.label)}>
          Add to Watchlist
        </Button>
      </div>
    </div>
  );

  const getStockClass = (change) => {
    if (change > 0) return "stock-positive";
    if (change < 0) return "stock-negative";
    return "stock-neutral";
  };

  return (
    <div className="watchlist">
      <DropdownButton id="dropdown-basic-button" title={currentWatchlist}>
        {watchlists.map((watchlist, index) => (
          <Dropdown.Item key={index} onClick={() => setCurrentWatchlist(watchlist)}>
            {watchlist}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      <h4>Watch List</h4>
      {error && <span className="text-danger">{error}</span>}
      <ul>
        {watchlistStocks.map((stock, index) => (
          <li key={index} className={`watchlist-stock ${getStockClass(stock.day_change)}`}>
            <Link to={`/stocks/${stock.stock_symbol}`}>
              {stock.stock_symbol} {stock.day_change > 0 ? "▲" : stock.day_change < 0 ? "▼" : ""} {stock.day_change}%
            </Link>
          </li>
        ))}
      </ul>
      <Button variant="primary" onClick={handleShow} className="mt-2">
        Add Stock
      </Button>
      <Button variant="secondary" onClick={handleShowCreate} className="mt-2">
        Create Watchlist
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Stock to Watchlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="drop-down-custom">
            <form className="d-flex">
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-search">
                  <input
                    className="search-bar-input me-3 mt-2 mb-2 text-center"
                    placeholder="Search for a stock"
                    style={{ borderRadius: "15px" }}
                    name="query"
                    value={query}
                    onChange={handleInputChange}
                  />
                  <FontAwesomeIcon icon={faSearch} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100 dropdown-menu">
                  {options.length > 0 ? options.map(renderOption) : null}
                </Dropdown.Menu>
              </Dropdown>
            </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreate} onHide={handleCloseCreate}>
        <Modal.Header closeButton>
          <Modal.Title>Create Watchlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="Watchlist Name"
            value={watchlistName}
            onChange={(e) => setWatchlistName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreate}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateWatchlist}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Watchlist;
