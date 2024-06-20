import { Dropdown } from "react-bootstrap";
import AddPortfolio from "./AddPortfolio";
import { useEffect, useState } from "react";
import { stockSearch } from "../utils/helpers";
import defaultStockImage from "../assets/default-stock.jpeg";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation, Link } from "react-router-dom";

const SearchBar = (props) => {
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [fromPortfolio, setFromPortfolio] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (props.fromPortfolio) {
      setFromPortfolio(true);
    }
  });


  useEffect(() => {
    if (query.length > 0) {
      const fetchData = async () => {
        const data = await stockSearch(query);
        const options = data.map((stock) => ({
          exchange: stock.exchange,
          image: "https://eodhd.com".concat(stock.image),
          label: stock.code,
          open: stock.open,
          close: stock.close,
          change: (stock.close - stock.open) / stock.open.toFixed(2),
          name: stock.name,
        }));
        setOptions(options);
      };
      fetchData();
    }
  }, [query]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (query) {
      if (options[0].exchange == "KO") {
        navigate(`/stockinfo/${options[0].label}.KS`);
      } else {
        navigate(`/stockinfo/${options[0].label}`);
      }
    }
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  return (
    <div
      className={fromPortfolio ? "drop-down-custom active" : "drop-down-custom"}
    >
      <form onSubmit={handleSubmit} className="d-flex">
        <ul className="list-group me-3">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-search">
              <input
                className="search-bar me-3 mt-2 mb-2 h-300"
                placeholder={
                  fromPortfolio
                    ? "Search for other stocks"
                    : "Search for a stock"
                }
                name="query"
                onChange={handleInputChange}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100 dropdown-menu">
              {options ? (
                options.map((option) => (
                  <div>
                    <div className="list-group-item list-group-item-action active absolute search-list text-decoration-none ">
                      {option.image == "https://eodhd.comnull" ? (
                        <>
                          <img
                            src={defaultStockImage}
                            alt={defaultStockImage}
                          />
                        </>
                      ) : (
                        <>
                          <img src={option.image} alt={defaultStockImage} />
                        </>
                      )}
                      <div className="search-items justify-content-around align-items-center">
                        <li className="">
                          <Link
                            to={`/stockinfo/${option.label}`}
                            className="text-decoration-underline text-dark"
                          >
                            {option.label.concat(`.${option.exchange}`)}
                          </Link>
                        </li>
                        <li className="">{option.open.toFixed(2)}</li>
                        <li className="">{option.close.toFixed(2)}</li>
                        <li className="">
                          {option.change > 0 ? (
                            <>
                              <FontAwesomeIcon
                                icon={faCaretUp}
                                className="text-success me-1"
                              />
                              {(option.change * 100).toFixed(2)}%
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faCaretDown}
                                className="text-danger me-1"
                              />
                              {(option.change * 100).toFixed(2)}%
                            </>
                          )}
                        </li>
                        <div>
                          <AddPortfolio
                            stockDetails={option}
                            stockSymbol={option.label}
                            longName={option.name}
                            open={option.open}
                            page={Boolean(false)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <></>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </ul>
      </form>
    </div>
  );
};

export default SearchBar;
