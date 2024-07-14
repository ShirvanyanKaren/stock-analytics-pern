// src/components/Header.jsx
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import Auth from "../utils/auth";
import SearchBar from "./SearchBar"; 
import Watchlist from "./Watchlist";
import Draggable from 'react-draggable'; 
import '../styles/Watchlist.scss'

const Header = () => {
  const [watchListClose, setWatchListClose] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    Auth.logout();
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleWatchlist = () => {
    setWatchListClose(!watchListClose);
  };

  return (
    <>
      <header className="header-main">
        <div className="d-flex justify-content-around align-items-center">
          <Navbar.Brand className="logo-cinco d-flex align-items-center">
            <Link to="/" className="navbar-brand ms-2">
              CincoData [ ]
            </Link>
          </Navbar.Brand>
          <SearchBar className="search-bar" />
          <Navbar expand="xxl">
            <Container className="justify-content-center">
              <Nav>
                <NavDropdown title="Stock Data" id="stock-data-dropdown">
                  <NavDropdown.Item as={Link} to="/">Home</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/portfolio">Portfolio</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Analysis Tools" id="analysis-tools-dropdown">
                  <NavDropdown.Item as={Link} to="/linear-regression">Linear Regression</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Learning" id="learning-dropdown">
                  {/* Add relevant links here if needed */}
                </NavDropdown>
                <NavDropdown title="News" id="news-dropdown">
                  {/* Add relevant links here if needed */}
                </NavDropdown>
                <NavDropdown title="Resources" id="resources-dropdown">
                  <NavDropdown.Item as={Link} to="/glossary">Glossary</NavDropdown.Item>
                  {Auth.loggedIn() && watchListClose ? (
                    <NavDropdown.Item onClick={handleWatchlist}>Watchlist</NavDropdown.Item>
                  ) : (
                    null
                  )}
                </NavDropdown>
              </Nav>
            </Container>
          </Navbar>
          <div className="login-buttons">
            {Auth.loggedIn() ? (
              <button type="button" className="button-2" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <button type="button" className="button-3" onClick={handleLogin}>Log In</button>
                <button type="button" className="button-2" onClick={handleSignup}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </header>
      {watchListClose ? null : 
        <Draggable> 
          <div className="watchlist-container">
            <div className="d-flex justify-content-end">
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleWatchlist}></button>
            </div>
            <Watchlist />
          </div>
        </Draggable>
      }
    </>
  );
};

export default Header;
