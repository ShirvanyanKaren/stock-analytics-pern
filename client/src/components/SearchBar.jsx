import { Dropdown } from "react-bootstrap";
import AddPortfolio from "./AddPortfolio";
import { useEffect, useState, useCallback } from "react";
import { stockSearch } from "../utils/helpers";
import defaultStockImage from "../assets/default-stock.jpeg";
import { faCaretDown, faCaretUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, Link, useLocation } from "react-router-dom"
import { faArrowsToEye } from "@fortawesome/free-solid-svg-icons";
import "../App.scss";
import Button from "react-bootstrap/Button";

const SearchBar = ({ handleAddStock, watchlist, watchlistId }) => {
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (query.length > 0) {
        console.log(watchlistId)
        try {
          const data = await stockSearch(query);
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
    fetchData();
  }, [query]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (watchlist) return;
    if (query && options.length > 0) {
      const firstOption = options[0];
      const route = firstOption.exchange === "KO" 
        ? `/stockinfo/${firstOption.label}.KS`
        : `/stockinfo/${firstOption.label}`;
      navigate(route);
    }
  }, [query, options, navigate]);

  const handleInputChange = useCallback((event) => {
    setQuery(event.target.value);
  }, []);

  const renderOption = useCallback((option, index) => (
    <div key={option.label + index} className="list-group-item list-group-item-action active absolute search-list text-decoration-none">
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
        <div>
          {watchlist ? (
            <button
              title="Add to Watchlist"
              onClick={() => handleAddStock(option.label)} 
              className="add-watchlist-btn btn btn-primary d-flex justify-content-center"
            >
              <FontAwesomeIcon icon={faArrowsToEye} />
            </button>
          ) : (
            <AddPortfolio
              stockDetails={option}
              stockSymbol={option.label}
              longName={option.name}
              open={parseFloat(option.open)}
              page={false}
            />
          )}
        </div>
      </div>
    </div>
  ), [watchlist, handleAddStock]);
  

  return (
    <div className="drop-down-custom">
      <form onSubmit={handleSubmit } className="d-flex">
        <Dropdown>
          <Dropdown.Toggle variant="none" id="dropdown-search">
            <input
              className="search-bar-input me-3 mt-2 mb-2 text-center"
              placeholder={location.pathname.split('/')[1] === 'stockinfo' ? 'Search for other stock' : 'Search for a stock'}
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
  );
};

export default SearchBar;
