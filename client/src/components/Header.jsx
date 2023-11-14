import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import AsyncSelect from "react-select/async";
import Form from "react-bootstrap/Form";
import Auth from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import defaultStockImage from "../assets/default-stock.jpeg";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";




const Header = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  

console.log(options);
useEffect(() => {
  console.log("useEffect");

  const fetchData = async () => {
    if (query.length > 0) {
      console.log("query", query);
      try {
        const response = await fetch(
          `https://eodhd.com/api/query-search-extended/?q=${query}&api_token=65431c249ef2b9.93958016`
        );
        const data = await response.json();
        console.log(data);
        console.log("here");
        const options = data.map((stock) => ({
          exchange: stock.exchange,
          image: "https://eodhd.com".concat(stock.image),
          label: stock.code,
          open: stock.open,
          close: stock.close,
          change: (stock.close - stock.open)/stock.open.toFixed(2),
        }));
        console.log(options);
        setOptions(options);
      } catch (err) {
        console.log(err);
      }
    }
  };

  fetchData();
}, [query]); // Run the effect whenever the 'query' state changes


  const handleSubmit = (event) => {
    console.log(query);
    event.preventDefault();
    if (query) {
      navigate(`/stockinfo/${query}`);
    }
  };

  const handleInputChange = (event) => {

    console.log(event.target.value);
    setQuery(event.target.value);
  };

  const handleLogout = () => {
    Auth.logout();
  };

  return (
    <>
      <Navbar expand="xxl" bg="dark" data-bs-theme="dark" className="nav-bar">
        <Container expand="xxl" className="justify-content-between navbar">
          <Navbar.Brand className="ms-0" to="/home">
            <Link to="/" className="navbar-brand">
              myStocks
            </Link>
          </Navbar.Brand>
          <div className="nav">
            <form onSubmit={handleSubmit} className="d-flex">
            <ul className="list-group me-3">
              <Dropdown>
              <Dropdown.Toggle variant="dark" id="dropdown-search">
                <input
                className="search-bar me-3 mt-2 mb-2 h-300"
                placeholder="Search"
                name="query"
                onChange={handleInputChange}
              />
              </Dropdown.Toggle>


              <Dropdown.Menu className="w-100 dropdown-menu">
              {options ? (
                options.map((option) => (
                    <Link to={`/stockinfo/${option.label}`} className="text-decoration-none">
                    <li className="list-group-item list-group-item-action active absolute search-list ">
                      {option.image == "https://eodhd.comnull" ? (
                        <>
                       
                        <img src={defaultStockImage} alt={defaultStockImage} />
                        </>
                      ) : (
                        <>
                         <img src={option.image} alt={defaultStockImage} />
                        </>
                        
                        )}
                    <div className="search-items justify-content-around">
                    <li className="">
                    {option.label.concat(`.${option.exchange}`)}
                    </li>
                    {option.open.toFixed(2)}
                    <li className="">
                    {option.close.toFixed(2)}
                    </li>
                    <li className="">
                    {option.change > 0 ? (
                      <>
                      <FontAwesomeIcon icon={faCaretUp} className="text-success me-1" />
                      {(option.change * 100).toFixed(2)}%
                      </>
                    
                    ) : (
                      <>
                      <FontAwesomeIcon icon={faCaretDown} className="text-danger me-1" />
                      {(option.change * 100).toFixed(2)}%
                      </>
                    )}
                    </li>
                    </div>

                 </li>
                  </Link>
                ))

              ) : (
                <></>
              )}
              </Dropdown.Menu>
              </Dropdown>
            </ul>

              {/* <button className="btn btn-outline-light ms-3 me-3" type="submit">
                Search
              </button> */}
            </form>
            <Nav className="ms-auto">
              {Auth.loggedIn() ? (
                <Nav.Link to="/" onClick={handleLogout}>
                  Logout
                </Nav.Link>
              ) : (
                <Nav.Link href="/login">Login/Signup</Nav.Link>
              )}
              <Nav.Link to="/features">Dashboard</Nav.Link>
              <Nav.Link to="/pricing">Create Portfolio</Nav.Link>
              <NavDropdown title="Features" id="collapsible-nav-dropdown">
                <NavDropdown.Item href="/stocklinreg">
                  Compare Portfolio
                </NavDropdown.Item>
                <NavDropdown.Item to="/action/3.2">
                  Edit Portfolio
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </div>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
