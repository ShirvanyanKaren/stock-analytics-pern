// src/components/Header.jsx
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import Auth from "../utils/auth";
import SearchBar from "./SearchBar";

const Header = () => {
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

  return (
    <header>
      <Container className="d-flex justify-content-between align-items-center py-3">
        <Navbar.Brand className="logo-cinco d-flex align-items-center">
          <FontAwesomeIcon icon={faDatabase} className="nav-brand" color="blue" />
          <Link to="/" className="navbar-brand ms-2">
            CincoData [ ]
          </Link>
        </Navbar.Brand>
        <SearchBar className="search-bar" />
        <div className="login-buttons">
          {Auth.loggedIn() ? (
            <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <button type="button" className="btn btn-primary me-2" onClick={handleLogin}>Log In</button>
              <button type="button" className="btn btn-secondary" onClick={handleSignup}>Sign Up</button>
            </>
          )}
        </div>
      </Container>
      <Navbar expand="xxl" bg="light" data-bs-theme="light" className="nav-bar">
        <Container className="justify-content-center">
          <Nav className="fs-5">
            <NavDropdown title="Stock Data" id="stock-data-dropdown">
              <NavDropdown.Item as={Link} to="/">Dashboard</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/portfolio">Portfolio</NavDropdown.Item>
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
              {/* Add relevant links here if needed */}
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
