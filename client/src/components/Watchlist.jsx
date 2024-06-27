import React, { useState, useEffect } from "react";
import { stockWatchlistSearch, getStockOverview } from "../utils/helpers";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Button, Modal, Dropdown, DropdownButton } from "react-bootstrap";
import { addWatchList, getWatchlists, addStockToWatchList, deleteStockFromWatchList } from "../services/watchlists";
import { idbPromise } from "../utils/helpers";
import "../styles/Watchlist.css";
import decode from "jwt-decode";
import defaultStockImage from "../assets/default-stock.jpeg";

const Watchlist = ({ onUpdate }) => {
  const [watchlists, setWatchlists] = useState([""]);
  const [currentWatchlist, setCurrentWatchlist] = useState("");
  const [watchListObjects, setWatchListObjects] = useState({});
  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [show, setShow] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [stockSymbol, setStockSymbol] = useState("");
  const [watchlistName, setWatchlistName] = useState("");
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [error, setError] = useState("");



  const getWatchList = async () => {
    const token = localStorage.getItem("id_token");
    if (!token) return;
    const decoded = decode(token);
    const userId = decoded.data.id;
    const watchlists = await getWatchlists(userId);
    const watchlistNames = Object.keys(watchlists);
    setWatchlists(watchlistNames);
    const currentName = watchlistNames[0];
    const watchListObjects = {}


    for (let i = 0; i < watchlistNames.length; i++) {
      const watchListItems = watchlists[watchlistNames[i]].watches;
      const watchListArray = watchListItems.length ? await getStockOverview(watchListItems) : [];
      watchListObjects[watchlistNames[i]] = watchListArray; 
    }

    console.log(watchListObjects[currentName]); 
    setWatchListObjects(watchListObjects);
    setCurrentWatchlist(currentName);
    setWatchlistStocks(watchListObjects[currentName]);

  };



  useEffect(() => {
    // const storedWatchlists = JSON.parse(sessionStorage.getItem("watchlists")) || ["Default Watchlist"];
    // const storedCurrentWatchlist = sessionStorage.getItem("currentWatchlist") || "Default Watchlist";
    // const storedWatchlistStocks = JSON.parse(sessionStorage.getItem(storedCurrentWatchlist)) || [];
    
    getWatchList();
    // setWatchlists(storedWatchlists);
    // setCurrentWatchlist(storedCurrentWatchlist);
    // setWatchlistStocks(storedWatchlistStocks);
  }, []);



  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleShowCreate = () => setShowCreate(true);
  const handleCloseCreate = () => setShowCreate(false);

  const handleAddToWatchlist = async (stockSymbol, watchListId) => {
    try {
      const stockOverview = await getStockOverview(stockSymbol);
      const token = localStorage.getItem("id_token");
      if (!token) {
        return;
      }
      const decoded = decode(token);
      const userId = decoded.data.id;
      const addToWatchlist = await addStockToWatchList(userId, watchListId, stockSymbol);
      if (stockOverview) {
        const newStock = {
          stock_symbol: stockSymbol,
          stock_name: stockOverview.currentPrice,
          price: stockOverview.currentPrice,
          day_change: `${stockOverview.priceChange} ${stockOverview.priceChangePercent}`,
          after_hours_change: `${stockOverview.afterHoursChange} ${stockOverview.afterHoursChangePercent}`,
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

  const handleInputChange = async (event) => {
    setQuery(event.target.value);
    if (event.target.value.length > 0) {
      try {
        const data = await stockWatchlistSearch(event.target.value);
        const options = data.map((stock) => ({
          exchange: stock.exchange,
          image: stock.image ? `https://eodhd.com${stock.image}` : defaultStockImage,
          label: stock.code,
          open: stock.open.toFixed(2),
          close: stock.close.toFixed(2),
          change: ((stock.close - stock.open) / stock.open).toFixed(2),
          name: stock.name,
        }));
        setOptions(options);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    }
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
        <Button variant="primary" onClick={() => handleAddToWatchlist(option.label, watchListId)}>
          Add to Watchlist
        </Button>
      </div>
    </div>
  );

  const getStockClass = (change) => {
    if (typeof change === "string") {
      if (change.includes("+")) return "stock-positive";
      if (change.includes("-")) return "stock-negative";
    }
    return "stock-neutral";
  };

  return (
    <div className="watchlist">
      <h4>Watch List</h4>
      <DropdownButton id="dropdown-basic-button" title={currentWatchlist} classnName="m-2">
        {watchlists.map((watchlist, index) => (
          <Dropdown.Item key={index} onClick={() => setCurrentWatchlist(watchListObjects[watchlist])}>
            {watchlist}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      {error && <span className="text-danger">{error}</span>}
      <ul>
        {watchlistStocks.map((stock, index) => (
          <li key={index} className={`watchlist-stock card`}>
            <Link to={`/stocks/${stock.symbol}`}>
              {stock.symbol} <br />
              {stock.price} <br />
             <span className={stock.priceChange < 0 ? "text-danger" : "text-success"}>{stock.priceChange.toFixed(2)}</span> <span className={stock.priceChangePercent < 0 ? "text-danger" : "text-success"}> {stock.priceChangePercent.toFixed(2)}</span>
            </Link>
          </li>
        ))}
          {/* after_hours_change: `${stockOverview.afterHoursChange.toFixed(3)} ${stockOverview.afterHoursChangePercent.toFixed(3)}`, */}
              {/* {symbols: ["LW", "APA", "AMT", "AZO", "GEN", "COO", "CTAS", "CME", "INVH", "LYV"]} */}
        {/* {watchlistStocks.map((stock, index) => (
          <li key={index} className={`watchlist-stock card`}>
            <Link to={`/stocks/${stock.stock_symbol}`}>
              {stock.stock_symbol} <br />
              {stock.price} <br />
              <span className={typeof stock.day_change === "string" && stock.day_change.includes("+") ? "text-success" : "text-danger"}>
                {stock.day_change}
              </span>
            </Link>
          </li>
        ))} */}
      </ul>
      <div className="d-flex flex-direction-row">
      <Button variant="primary" onClick={handleShow} className="m-2">
        Add Stock
      </Button>
      <Button variant="secondary"  onClick={handleShowCreate} className="m-2">
        Create Watchlist
      </Button>
      </div>

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
                  {options.length > 0 ? options.map(renderOption) : <Dropdown.Item>No results found</Dropdown.Item>}
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
