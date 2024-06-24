// src/components/Header.jsx
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";
import Auth from "../utils/auth";
import SearchBar from "./SearchBar";

const Header = () => {
  const handleLogout = async () => {
    Auth.logout();
    Navigate("/");
  };

  return (
    <>
      <Navbar expand="xxl" bg="light" data-bs-theme="light" className="nav-bar nav-bar-custom theme">
        <div expand="xxl" className="justify-content-around navbar w-100">
          <Navbar.Brand className="ms-0" to="/home">
            <FontAwesomeIcon icon={faDatabase} className="nav-brand" color="blue" />
            <Link to="/" className="navbar-brand">
              CincoData
            </Link>
          </Navbar.Brand>
          <SearchBar className="" />
          <Nav className="d-flex justify-content-between ms-3 fs-5">
              <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/">Portfolio</Nav.Link>
              <Nav.Link as={Link} to="/glossary">Glossary</Nav.Link>
              {Auth.loggedIn() ? (
                <>
                <NavDropdown title="Features" id="collapsible-nav-dropdown">
                <NavDropdown.Item href="/famafrench">
                  Expected Return
                </NavDropdown.Item>
                <NavDropdown.Item href="/linear-regression"> 
                  Linear Regression
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link onClick={handleLogout}>
                  Logout
                </Nav.Link>
                </>
              ) : (
                <> 
              <Nav.Link href="/login">Login</Nav.Link>
                </>
              )}
            </Nav>
        </div>
      </Navbar>
    </>
  );
};

export default Header;
