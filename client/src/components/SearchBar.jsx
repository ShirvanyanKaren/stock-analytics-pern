import { Dropdown } from "react-bootstrap";
import AddPortfolio from "./AddPortfolio";
import { useEffect, useState, useCallback } from "react";
import { stockSearch } from "../utils/helpers";
import defaultStockImage from "../assets/default-stock.jpeg";
import { faCaretDown, faCaretUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, Link, useLocation } from "react-router-dom";


const SearchBar = () => {
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (query.length > 0) {
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
      }
    };
    fetchData();
  }, [query]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
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

  const renderOption = useCallback((option) => (
    <div className="list-group-item list-group-item-action active absolute search-list text-decoration-none">
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
          <AddPortfolio
            stockDetails={option}
            stockSymbol={option.label}
            longName={option.name}
            open={parseFloat(option.open)}
            page={false}
          />
        </div>
      </div>
    </div>
  ), []);

  return (
    <div className="drop-down-custom">
      <form onSubmit={handleSubmit} className="d-flex">
        <Dropdown

        >
          <Dropdown.Toggle variant="light" id="dropdown-search"
            
          >
            <input
              className="search-bar me-3 mt-2 mb-2 text-center "
              placeholder={ location.pathname.split('/')[1] === 'stockinfo' ? 'Search for other stock' : 'Search for a stock' }
              style={{ borderRadius: "15px" }}
              name="query"
              value={query}
              onChange={handleInputChange}
              // how to remove toggle icon from the dropdown

            />
            <FontAwesomeIcon icon={faSearch} />
          </Dropdown.Toggle>
          <Dropdown.Menu className="w-100 dropdown-menu">
            {options.length > 0 ? options.map(renderOption) : null}
          </Dropdown.Menu>
        </Dropdown>
      </form>
    </div>
  );
};

export default SearchBar;