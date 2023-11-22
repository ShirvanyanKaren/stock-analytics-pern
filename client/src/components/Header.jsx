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
import { faCaretDown, faCaretUp, faMoneyCheck } from "@fortawesome/free-solid-svg-icons";
import { stockSearch } from "../utils/helpers";
import AddPortfolio  from "./AddPortfolio";
import SearchBar from "./SearchBar";




const Header = () => {


  

  const handleLogout = () => {
    Auth.logout();
  };



  return (
    <>
      <Navbar expand="xxl" bg="light" data-bs-theme="light" className="nav-bar nav-bar-custom">
        <Container expand="xxl" className="justify-content-between navbar">
          <Navbar.Brand className="ms-0" to="/home">
            <Link to="/" className="navbar-brand">
              myStocks
            </Link>
          </Navbar.Brand>
          <div className="nav">
            <SearchBar />
            <Nav className="align-items-center ">
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
                <NavDropdown.Item href="/famafrench">
                  Expected Return
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
