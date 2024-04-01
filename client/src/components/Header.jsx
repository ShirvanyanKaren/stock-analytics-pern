import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";
import Auth from "../utils/auth";
import SearchBar from "./SearchBar";
import { idbPromise } from "../utils/helpers";
import decode from "jwt-decode";
import { QUERY_USER } from "../utils/queries";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";

const Header = () => {
  const handleLogout = async () => {
    Auth.logout();
  };

  return (
    <>
      <Navbar
        expand="xxl"
        bg="light"
        data-bs-theme="light"
        className="nav-bar nav-bar-custom"
      >
        <Container expand="xxl" className="justify-content-between navbar">
            <Navbar.Brand className="ms-0" to="/home">
              <FontAwesomeIcon icon={faDatabase} color="blue"/>
              <Link to="/" className="navbar-brand">
                CincoData
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
